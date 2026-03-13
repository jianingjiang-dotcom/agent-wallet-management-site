import { useState, useCallback, useEffect } from 'react';

// --- Type definitions ---

export type Permission = 'transfer' | 'contractCall' | 'swap' | 'stake';

export interface Policy {
  singleTxLimit: number;
  dailyLimit: number;
  approvalRequired: boolean;
}

export interface Delegation {
  agentId: string;
  agentName: string;
  status: 'active' | 'frozen';
  connectedAt: string;
  permissions: Permission[];
  policy: Policy;
}

export interface Wallet {
  id: string;
  name: string;
  address: string;
  createdAt: string;
  delegation: Delegation | null;
}

interface WalletStoreData {
  wallets: Wallet[];
  selectedWalletId: string | null;
}

// --- Constants ---

const STORE_KEY = 'agent_wallet_wallets';
const LEGACY_USER_KEY = 'agent_wallet_current_user';

const DEFAULT_POLICY: Policy = {
  singleTxLimit: 10,
  dailyLimit: 50,
  approvalRequired: true,
};

const DEFAULT_PERMISSIONS: Permission[] = ['transfer', 'contractCall', 'swap'];

// --- Helper: generate IDs ---

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateAddress(): string {
  const hex = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += hex[Math.floor(Math.random() * 16)];
  }
  return addr;
}

// --- Read/write helpers ---

function readStore(): WalletStoreData {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { wallets: [], selectedWalletId: null };
}

function writeStore(data: WalletStoreData) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('wallet-store-updated'));
}

// --- Migration from legacy format ---

function migrateLegacyData(): boolean {
  // Already migrated if wallet store exists
  if (localStorage.getItem(STORE_KEY)) return false;

  try {
    const raw = localStorage.getItem(LEGACY_USER_KEY);
    if (!raw) return false;
    const user = JSON.parse(raw);

    if (user.walletPaired && user.walletAddress) {
      const wallet: Wallet = {
        id: generateId(),
        name: 'Wallet #1',
        address: user.walletAddress,
        createdAt: user.createdAt || new Date().toISOString(),
        delegation: {
          agentId: generateId(),
          agentName: 'Agent #1',
          status: 'active',
          connectedAt: new Date().toISOString(),
          permissions: [...DEFAULT_PERMISSIONS],
          policy: { ...DEFAULT_POLICY },
        },
      };

      writeStore({ wallets: [wallet], selectedWalletId: null });

      // Clean legacy fields but keep user identity
      delete user.walletPaired;
      delete user.walletAddress;
      localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(user));

      return true;
    }
  } catch {}
  return false;
}

// --- Hook ---

export function useWalletStore() {
  const [data, setData] = useState<WalletStoreData>(() => {
    migrateLegacyData();
    return readStore();
  });

  // Listen for cross-instance store updates
  useEffect(() => {
    const handler = () => {
      setData(readStore());
    };
    window.addEventListener('wallet-store-updated', handler);
    return () => window.removeEventListener('wallet-store-updated', handler);
  }, []);

  // Sync state → localStorage
  const persist = useCallback((newData: WalletStoreData) => {
    writeStore(newData);
    setData(newData);
  }, []);

  // --- CRUD operations ---

  const addWallet = useCallback((params: {
    id?: string;
    name?: string;
    address?: string;
    withAgent?: boolean;
    agentId?: string;
    agentName?: string;
    policy?: Partial<Policy>;
  }) => {
    const walletCount = data.wallets.length;
    const wallet: Wallet = {
      id: params.id || generateId(),
      name: params.name || `Wallet #${walletCount + 1}`,
      address: params.address || generateAddress(),
      createdAt: new Date().toISOString(),
      delegation: params.withAgent !== false ? {
        agentId: params.agentId || generateId(),
        agentName: params.agentName || `Agent #${walletCount + 1}`,
        status: 'active',
        connectedAt: new Date().toISOString(),
        permissions: [...DEFAULT_PERMISSIONS],
        policy: { ...DEFAULT_POLICY, ...params.policy },
      } : null,
    };

    const newData = {
      ...data,
      wallets: [...data.wallets, wallet],
    };
    persist(newData);
    return wallet;
  }, [data, persist]);

  const updateWallet = useCallback((walletId: string, updates: Partial<Wallet>) => {
    const newData = {
      ...data,
      wallets: data.wallets.map(w =>
        w.id === walletId ? { ...w, ...updates } : w
      ),
    };
    persist(newData);
  }, [data, persist]);

  const deleteWallet = useCallback((walletId: string) => {
    const newData = {
      wallets: data.wallets.filter(w => w.id !== walletId),
      selectedWalletId: data.selectedWalletId === walletId ? null : data.selectedWalletId,
    };
    persist(newData);
  }, [data, persist]);

  const selectWallet = useCallback((walletId: string | null) => {
    persist({ ...data, selectedWalletId: walletId });
  }, [data, persist]);

  const updateDelegation = useCallback((walletId: string, updates: Partial<Delegation>) => {
    const newData = {
      ...data,
      wallets: data.wallets.map(w => {
        if (w.id !== walletId || !w.delegation) return w;
        return { ...w, delegation: { ...w.delegation, ...updates } };
      }),
    };
    persist(newData);
  }, [data, persist]);

  const updatePolicy = useCallback((walletId: string, updates: Partial<Policy>) => {
    const newData = {
      ...data,
      wallets: data.wallets.map(w => {
        if (w.id !== walletId || !w.delegation) return w;
        return {
          ...w,
          delegation: {
            ...w.delegation,
            policy: { ...w.delegation.policy, ...updates },
          },
        };
      }),
    };
    persist(newData);
  }, [data, persist]);

  const updatePermissions = useCallback((walletId: string, permissions: Permission[]) => {
    const newData = {
      ...data,
      wallets: data.wallets.map(w => {
        if (w.id !== walletId || !w.delegation) return w;
        return {
          ...w,
          delegation: { ...w.delegation, permissions },
        };
      }),
    };
    persist(newData);
  }, [data, persist]);

  const freezeDelegation = useCallback((walletId: string) => {
    updateDelegation(walletId, { status: 'frozen' });
  }, [updateDelegation]);

  const unfreezeDelegation = useCallback((walletId: string) => {
    updateDelegation(walletId, { status: 'active' });
  }, [updateDelegation]);

  const revokeDelegation = useCallback((walletId: string) => {
    const newData = {
      ...data,
      wallets: data.wallets.map(w => {
        if (w.id !== walletId) return w;
        return { ...w, delegation: null };
      }),
    };
    persist(newData);
  }, [data, persist]);

  // Derived data
  const wallets = data.wallets;
  const selectedWallet = data.selectedWalletId
    ? data.wallets.find(w => w.id === data.selectedWalletId) || null
    : null;
  const hasWallets = wallets.length > 0;
  const hasAgent = wallets.some(w => w.delegation !== null);
  const hasCustomPolicy = wallets.some(w =>
    w.delegation &&
    (w.delegation.policy.singleTxLimit !== DEFAULT_POLICY.singleTxLimit ||
     w.delegation.policy.dailyLimit !== DEFAULT_POLICY.dailyLimit)
  );

  return {
    wallets,
    selectedWallet,
    hasWallets,
    hasAgent,
    hasCustomPolicy,
    addWallet,
    updateWallet,
    deleteWallet,
    selectWallet,
    updateDelegation,
    updatePolicy,
    updatePermissions,
    freezeDelegation,
    unfreezeDelegation,
    revokeDelegation,
  };
}
