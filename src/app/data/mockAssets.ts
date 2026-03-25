import { Wallet } from '../hooks/useWalletStore';
import { CHAINS, getChainById, getChainsByParent, getExplorerTxUrl } from './chains';
import { TOKENS, getTokenById } from './tokens';

// --- Types ---

export interface AssetPosition {
  tokenId: string;
  chainId: string;
  amount: number;
  usdValue: number;
  /** If the same token+chain spans multiple addresses, list per-address breakdown */
  addressBreakdown?: { address: string; amount: number }[];
}

export interface Transaction {
  id: string;
  hash: string;
  chainId: string;
  tokenId: string;
  type: 'Send' | 'Receive' | 'Swap' | 'Approve';
  amount: number;
  usdValue: number;
  timestamp: string;
  status: 'confirmed' | 'pending' | 'failed';
  explorerUrl: string;
}

// --- Deterministic seed from wallet ID ---

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// --- Token price map (mock) ---

const TOKEN_PRICES: Record<string, number> = {
  eth: 1800,
  usdt: 1,
  usdc: 1,
  bnb: 310,
  wbtc: 43000,
  dai: 1,
  matic: 0.52,
  sol: 135,
};

// --- Token-chain compatibility ---

const EVM_TOKENS = ['eth', 'usdt', 'usdc', 'bnb', 'wbtc', 'dai', 'matic'];
const SOL_TOKENS = ['sol', 'usdt', 'usdc'];
const EVM_CHAIN_IDS = ['ethereum', 'bsc', 'polygon', 'arbitrum'];

// --- Generate assets ---

export function getWalletAssets(wallet: Wallet): AssetPosition[] {
  const rand = seededRandom(hashCode(wallet.id));
  const positions: AssetPosition[] = [];

  const hasEvm = wallet.addresses.some(a => a.chain === 'EVM');
  const hasSol = wallet.addresses.some(a => a.chain === 'SOL');
  const evmAddresses = wallet.addresses.filter(a => a.chain === 'EVM');
  const solAddresses = wallet.addresses.filter(a => a.chain === 'SOL');

  if (hasEvm) {
    // Pick 5-7 EVM asset positions
    const count = 5 + Math.floor(rand() * 3);
    const used = new Set<string>();

    for (let i = 0; i < count; i++) {
      const tokenIdx = Math.floor(rand() * EVM_TOKENS.length);
      const chainIdx = Math.floor(rand() * EVM_CHAIN_IDS.length);
      const tokenId = EVM_TOKENS[tokenIdx];
      const chainId = EVM_CHAIN_IDS[chainIdx];
      const key = `${tokenId}-${chainId}`;
      if (used.has(key)) continue;
      used.add(key);

      const price = TOKEN_PRICES[tokenId] || 1;
      const isStable = tokenId === 'usdt' || tokenId === 'usdc' || tokenId === 'dai';
      const amount = isStable
        ? Math.round(rand() * 5000 * 100) / 100
        : Math.round(rand() * 5 * 10000) / 10000;

      // Possibly split across multiple addresses
      const addressBreakdown: { address: string; amount: number }[] = [];
      if (evmAddresses.length > 1 && rand() > 0.5) {
        const ratio = 0.3 + rand() * 0.4;
        addressBreakdown.push({ address: evmAddresses[0].address, amount: Math.round(amount * ratio * 10000) / 10000 });
        addressBreakdown.push({ address: evmAddresses[1]?.address || evmAddresses[0].address, amount: Math.round(amount * (1 - ratio) * 10000) / 10000 });
      }

      positions.push({
        tokenId,
        chainId,
        amount,
        usdValue: Math.round(amount * price * 100) / 100,
        addressBreakdown: addressBreakdown.length > 1 ? addressBreakdown : undefined,
      });
    }
  }

  if (hasSol) {
    // Pick 1-2 SOL asset positions
    const count = 1 + Math.floor(rand() * 2);
    const used = new Set<string>();
    for (let i = 0; i < count; i++) {
      const tokenIdx = Math.floor(rand() * SOL_TOKENS.length);
      const tokenId = SOL_TOKENS[tokenIdx];
      if (used.has(tokenId)) continue;
      used.add(tokenId);

      const price = TOKEN_PRICES[tokenId] || 1;
      const isStable = tokenId === 'usdt' || tokenId === 'usdc';
      const amount = isStable
        ? Math.round(rand() * 3000 * 100) / 100
        : Math.round(rand() * 10 * 10000) / 10000;

      positions.push({
        tokenId,
        chainId: 'solana',
        amount,
        usdValue: Math.round(amount * price * 100) / 100,
      });
    }
  }

  // Ensure at least some positions exist
  if (positions.length === 0) {
    positions.push({
      tokenId: 'eth',
      chainId: 'ethereum',
      amount: 0.5,
      usdValue: 900,
    });
  }

  // Sort by USD value descending
  positions.sort((a, b) => b.usdValue - a.usdValue);
  return positions;
}

export function getWalletTotalBalance(wallet: Wallet): number {
  const assets = getWalletAssets(wallet);
  return Math.round(assets.reduce((sum, a) => sum + a.usdValue, 0) * 100) / 100;
}

export function getChainBalance(assets: AssetPosition[], chainId: string | null): number {
  const filtered = chainId ? assets.filter(a => a.chainId === chainId) : assets;
  return Math.round(filtered.reduce((sum, a) => sum + a.usdValue, 0) * 100) / 100;
}

/**
 * Filter assets by address. An asset matches an address if:
 * - it has addressBreakdown containing that address, OR
 * - it has no breakdown and its chain's parentChain matches the address's chain type
 */
export function filterAssetsByAddress(
  assets: AssetPosition[],
  address: string | null,
  walletAddresses: { chain: string; address: string }[]
): AssetPosition[] {
  if (!address) return assets;

  const walletAddr = walletAddresses.find(a => a.address === address);
  if (!walletAddr) return assets;

  const parentChain = walletAddr.chain; // 'EVM' or 'SOL'
  const validChainIds = CHAINS.filter(c => c.parentChain === parentChain).map(c => c.id);

  return assets
    .filter(a => validChainIds.includes(a.chainId))
    .map(a => {
      // If has breakdown, filter to only this address's portion
      if (a.addressBreakdown && a.addressBreakdown.length > 1) {
        const addrEntry = a.addressBreakdown.find(b => b.address === address);
        if (!addrEntry) return null;
        const price = a.usdValue / a.amount;
        return {
          ...a,
          amount: addrEntry.amount,
          usdValue: Math.round(addrEntry.amount * price * 100) / 100,
          addressBreakdown: undefined,
        };
      }
      return a;
    })
    .filter((a): a is AssetPosition => a !== null);
}

/**
 * Get filtered balance considering both chain and address filters
 */
export function getFilteredBalance(
  assets: AssetPosition[],
  chainId: string | null,
  address: string | null,
  walletAddresses: { chain: string; address: string }[]
): number {
  let filtered = filterAssetsByAddress(assets, address, walletAddresses);
  if (chainId) filtered = filtered.filter(a => a.chainId === chainId);
  return Math.round(filtered.reduce((sum, a) => sum + a.usdValue, 0) * 100) / 100;
}

// --- Generate transactions ---

const TX_TYPES: Transaction['type'][] = ['Send', 'Receive', 'Swap', 'Approve'];
const TX_STATUSES: Transaction['status'][] = ['confirmed', 'confirmed', 'confirmed', 'confirmed', 'pending', 'failed'];

export function getWalletTransactions(wallet: Wallet): Transaction[] {
  const rand = seededRandom(hashCode(wallet.id + '_tx'));
  const txs: Transaction[] = [];
  const count = 12 + Math.floor(rand() * 8);

  const hasEvm = wallet.addresses.some(a => a.chain === 'EVM');
  const hasSol = wallet.addresses.some(a => a.chain === 'SOL');

  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const isEvm = hasEvm && (!hasSol || rand() > 0.25);
    const chainId = isEvm
      ? EVM_CHAIN_IDS[Math.floor(rand() * EVM_CHAIN_IDS.length)]
      : 'solana';

    const tokenPool = isEvm ? EVM_TOKENS : SOL_TOKENS;
    const tokenId = tokenPool[Math.floor(rand() * tokenPool.length)];
    const price = TOKEN_PRICES[tokenId] || 1;
    const isStable = tokenId === 'usdt' || tokenId === 'usdc' || tokenId === 'dai';
    const amount = isStable
      ? Math.round(rand() * 2000 * 100) / 100
      : Math.round(rand() * 3 * 10000) / 10000;

    const type = TX_TYPES[Math.floor(rand() * TX_TYPES.length)];
    const status = TX_STATUSES[Math.floor(rand() * TX_STATUSES.length)];

    // Random time in last 30 days
    const minutesAgo = Math.floor(rand() * 43200);
    const ts = new Date(now - minutesAgo * 60000);

    const hash = '0x' + Array.from({ length: 64 }, () =>
      '0123456789abcdef'[Math.floor(rand() * 16)]
    ).join('');

    txs.push({
      id: `tx-${i}-${wallet.id.slice(0, 6)}`,
      hash,
      chainId,
      tokenId,
      type,
      amount,
      usdValue: Math.round(amount * price * 100) / 100,
      timestamp: ts.toISOString(),
      status,
      explorerUrl: getExplorerTxUrl(chainId, hash),
    });
  }

  // Sort by timestamp descending (newest first)
  txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return txs;
}

// --- Formatting ---

export function formatUsdValue(value: number): string {
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatTokenAmount(amount: number, tokenId: string): string {
  const token = getTokenById(tokenId);
  const isStable = tokenId === 'usdt' || tokenId === 'usdc' || tokenId === 'dai';
  const decimals = isStable ? 2 : 4;
  return amount.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
