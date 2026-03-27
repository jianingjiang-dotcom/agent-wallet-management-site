export interface Chain {
  id: string;
  name: string;
  shortName: string;
  chainId?: number;
  explorerUrl: string;
  explorerTxPath: string;
  color: string;
  parentChain: string; // maps to WalletAddress.chain ('EVM' | 'SOL')
  logo: string; // inline SVG string
}

export const CHAINS: Chain[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    shortName: 'ETH',
    chainId: 1,
    explorerUrl: 'https://etherscan.io',
    explorerTxPath: '/tx/',
    color: '#627EEA',
    parentChain: 'EVM',
    logo: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#627EEA"/><path d="M12 3v6.652l5.625 2.512L12 3z" fill="#fff" fill-opacity=".6"/><path d="M12 3L6.375 12.164 12 9.652V3z" fill="#fff"/><path d="M12 16.476v4.52l5.63-7.784L12 16.476z" fill="#fff" fill-opacity=".6"/><path d="M12 20.997v-4.52l-5.625-3.264L12 20.997z" fill="#fff"/><path d="M12 15.43l5.625-3.266L12 9.652v5.779z" fill="#fff" fill-opacity=".2"/><path d="M6.375 12.164L12 15.43V9.652l-5.625 2.512z" fill="#fff" fill-opacity=".6"/></svg>`,
  },
  {
    id: 'bsc',
    name: 'BNB Chain',
    shortName: 'BSC',
    chainId: 56,
    explorerUrl: 'https://bscscan.com',
    explorerTxPath: '/tx/',
    color: '#F0B90B',
    parentChain: 'EVM',
    logo: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><g fill="none"><circle cx="16" cy="16" r="16" fill="#F0B90B"/><path fill="#FFF" d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.003-.003 2.263-2.257zM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16zm-3.188-.002h.002V16L16 18.294l-2.291-2.29-.004-.004.004-.003.401-.402.195-.195L16 13.706l2.293 2.293z"/></g></svg>`,
  },
  {
    id: 'polygon',
    name: 'Polygon',
    shortName: 'Polygon',
    chainId: 137,
    explorerUrl: 'https://polygonscan.com',
    explorerTxPath: '/tx/',
    color: '#8247E5',
    parentChain: 'EVM',
    logo: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#8247E5"/><path d="M15.5 9.88c-.25-.15-.58-.15-.83 0l-1.95 1.15-1.32.75-1.95 1.15c-.25.15-.58.15-.83 0l-1.55-.9c-.25-.15-.42-.42-.42-.72V9.46c0-.3.15-.57.42-.72l1.52-.88c.25-.15.58-.15.83 0l1.52.88c.25.15.42.42.42.72v1.15l1.32-.78v-1.15c0-.3-.15-.57-.42-.72l-2.82-1.65c-.25-.15-.58-.15-.83 0l-2.88 1.65c-.27.15-.42.42-.42.72v3.3c0 .3.15.57.42.72l2.85 1.65c.25.15.58.15.83 0l1.95-1.13 1.32-.78 1.95-1.13c.25-.15.58-.15.83 0l1.52.88c.25.15.42.42.42.72v1.85c0 .3-.15.57-.42.72l-1.5.88c-.25.15-.58.15-.83 0l-1.52-.88c-.25-.15-.42-.42-.42-.72v-1.12l-1.32.78v1.15c0 .3.15.57.42.72l2.85 1.65c.25.15.58.15.83 0l2.85-1.65c.25-.15.42-.42.42-.72v-3.3c0-.3-.15-.57-.42-.72L15.5 9.88z" fill="#fff"/></svg>`,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    shortName: 'Arbitrum',
    chainId: 42161,
    explorerUrl: 'https://arbiscan.io',
    explorerTxPath: '/tx/',
    color: '#28A0F0',
    parentChain: 'EVM',
    logo: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#213147"/><path fill="#12AAFF" d="M13.077 13.2l-1.1 3.02c-.027.082-.027.173 0 .264l1.89 5.193-.003-8.477zm2.21-5.076c-.064-.164-.291-.164-.355 0l-1.1 3.02c-.027.082-.027.173 0 .264l3.1 8.502-.003-11.786z"/><path fill="#FFF" d="M11.232 5.856H9.11c-.155 0-.3.1-.355.245L5.106 17.54l2.192 1.264 5-13.702c.045-.127-.045-.255-.173-.255l.107.009zm3.71 0h-2.12c-.155 0-.3.1-.355.245L7.726 19.305l2.192 1.264 5.636-14.468c.045-.127-.045-.255-.173-.255l-.43.01z"/></svg>`,
  },
  {
    id: 'solana',
    name: 'Solana',
    shortName: 'SOL',
    explorerUrl: 'https://solscan.io',
    explorerTxPath: '/tx/',
    color: '#9945FF',
    parentChain: 'SOL',
    logo: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 32 32"><g fill="none"><circle cx="16" cy="16" r="16" fill="#000"/><defs><linearGradient id="sol" x1="7" y1="22.5" x2="25" y2="9.5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#9945FF"/><stop offset="1" stop-color="#14F195"/></linearGradient></defs><path d="M9.925 19.687a.59.59 0 01.415-.17h14.366a.29.29 0 01.207.497l-2.838 2.815a.59.59 0 01-.415.171H7.294a.291.291 0 01-.207-.498l2.838-2.815zm0-10.517A.59.59 0 0110.34 9h14.366c.261 0 .392.314.207.498l-2.838 2.815a.59.59 0 01-.415.17H7.294a.291.291 0 01-.207-.497L9.925 9.17zm12.15 5.225a.59.59 0 00-.415-.17H7.294a.291.291 0 00-.207.498l2.838 2.815c.11.109.26.17.415.17h14.366a.291.291 0 00.207-.498l-2.838-2.815z" fill="url(#sol)"/></g></svg>`,
  },
];

const chainMap = new Map(CHAINS.map(c => [c.id, c]));

export function getChainById(chainId: string): Chain | undefined {
  return chainMap.get(chainId);
}

export function getChainsByParent(parentChain: string): Chain[] {
  return CHAINS.filter(c => c.parentChain === parentChain);
}

export function getExplorerTxUrl(chainId: string, txHash: string): string {
  const chain = getChainById(chainId);
  if (!chain) return '#';
  return `${chain.explorerUrl}${chain.explorerTxPath}${txHash}`;
}
