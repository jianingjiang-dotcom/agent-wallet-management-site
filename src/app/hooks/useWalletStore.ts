import { useState, useCallback, useEffect } from 'react';

// --- Type definitions ---

export type Permission = 'transfer' | 'contractCall' | 'walletManagement';

export interface Policy {
  singleTxLimit: number;
  dailyLimit: number;
  approvalRequired: boolean;
}

export interface Agent {
  id: string;
  name: string;
  pairedAt: string;
  status: 'paired' | 'inactive';
}

export interface Delegation {
  id: string;
  walletId: string;
  agentId: string;
  status: 'active' | 'frozen';
  delegatedAt: string;
  permissions: Permission[];
  policy: Policy;
}

export interface WalletAddress {
  chain: string;       // e.g. 'EVM', 'SOL', 'BTC', 'TRON'
  address: string;
}

export interface Wallet {
  id: string;
  name: string;
  addresses: WalletAddress[];
  createdAt: string;
  originAgentId: string | null;
}

interface WalletStoreData {
  wallets: Wallet[];
  agents: Agent[];
  delegations: Delegation[];
  selectedWalletId: string | null;
  selectedDelegationId: string | null;
}

// --- Constants ---

const STORE_KEY = 'agent_wallet_wallets';
const LEGACY_USER_KEY = 'agent_wallet_current_user';

export const DEFAULT_POLICY: Policy = {
  singleTxLimit: 10,
  dailyLimit: 50,
  approvalRequired: true,
};

export const DEFAULT_PERMISSIONS: Permission[] = ['transfer', 'contractCall'];

// --- Helper: generate IDs ---

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateEvmAddress(): string {
  const hex = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) addr += hex[Math.floor(Math.random() * 16)];
  return addr;
}

function generateSolAddress(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let addr = '';
  for (let i = 0; i < 44; i++) addr += chars[Math.floor(Math.random() * chars.length)];
  return addr;
}

function generateDefaultAddresses(): WalletAddress[] {
  return [
    { chain: 'EVM', address: generateEvmAddress() },
    { chain: 'SOL', address: generateSolAddress() },
  ];
}

// --- Read/write helpers ---

const DEFAULT_STORE: WalletStoreData = {
  wallets: [],
  agents: [],
  delegations: [],
  selectedWalletId: null,
  selectedDelegationId: null,
};

function migrateAddressField(data: WalletStoreData): WalletStoreData {
  let needsWrite = false;
  const wallets = data.wallets.map((w: any) => {
    if (w.address && !w.addresses) {
      needsWrite = true;
      const { address, ...rest } = w;
      return { ...rest, addresses: [{ chain: 'EVM', address }] };
    }
    if (!w.addresses) {
      needsWrite = true;
      return { ...w, addresses: [] };
    }
    return w;
  });
  if (needsWrite) {
    const migrated = { ...data, wallets };
    writeStore(migrated);
    return migrated;
  }
  return data;
}

function readStore(): WalletStoreData {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate V1 → V2 if needed
      if (parsed.wallets && !parsed.agents) {
        return migrateAddressField(migrateV1ToV2(parsed));
      }
      return migrateAddressField({ ...DEFAULT_STORE, ...parsed });
    }
  } catch {}
  return { ...DEFAULT_STORE };
}

function writeStore(data: WalletStoreData) {
  localStorage.setItem(STORE_KEY, JSON.stringify(data));
  window.dispatchEvent(new Event('wallet-store-updated'));
}

// --- Migration from V1 (embedded delegation) to V2 (separate agents/delegations) ---

function migrateV1ToV2(v1Data: any): WalletStoreData {
  const agents: Agent[] = [];
  const delegations: Delegation[] = [];
  const wallets: Wallet[] = [];

  for (const oldWallet of (v1Data.wallets || [])) {
    const originAgentId = oldWallet.delegation?.agentId || null;

    // Migrate old single address to addresses array
    const oldAddr = oldWallet.address || '';
    const addresses: WalletAddress[] = oldWallet.addresses
      ? oldWallet.addresses
      : oldAddr ? [{ chain: 'EVM', address: oldAddr }] : [];

    wallets.push({
      id: oldWallet.id,
      name: oldWallet.name,
      addresses,
      createdAt: oldWallet.createdAt,
      originAgentId,
    });

    if (oldWallet.delegation) {
      const d = oldWallet.delegation;

      if (!agents.find(a => a.id === d.agentId)) {
        agents.push({
          id: d.agentId,
          name: d.agentName || `Agent`,
          pairedAt: d.connectedAt,
          status: 'paired',
        });
      }

      delegations.push({
        id: generateId(),
        walletId: oldWallet.id,
        agentId: d.agentId,
        status: d.status || 'active',
        delegatedAt: d.connectedAt,
        permissions: d.permissions || [...DEFAULT_PERMISSIONS],
        policy: d.policy || { ...DEFAULT_POLICY },
      });
    }
  }

  const v2Data: WalletStoreData = {
    wallets,
    agents,
    delegations,
    selectedWalletId: v1Data.selectedWalletId || null,
    selectedDelegationId: null,
  };

  writeStore(v2Data);
  return v2Data;
}

// --- Migration from legacy user format ---

function migrateLegacyData(): boolean {
  if (localStorage.getItem(STORE_KEY)) return false;

  try {
    const raw = localStorage.getItem(LEGACY_USER_KEY);
    if (!raw) return false;
    const user = JSON.parse(raw);

    if (user.walletPaired && user.walletAddress) {
      const agentId = generateId();
      const walletId = generateId();

      const data: WalletStoreData = {
        wallets: [{
          id: walletId,
          name: 'Wallet #1',
          addresses: [{ chain: 'EVM', address: user.walletAddress }],
          createdAt: user.createdAt || new Date().toISOString(),
          originAgentId: agentId,
        }],
        agents: [{
          id: agentId,
          name: 'Agent #1',
          pairedAt: new Date().toISOString(),
          status: 'paired',
        }],
        delegations: [{
          id: generateId(),
          walletId,
          agentId,
          status: 'active',
          delegatedAt: new Date().toISOString(),
          permissions: [...DEFAULT_PERMISSIONS],
          policy: { ...DEFAULT_POLICY },
        }],
        selectedWalletId: null,
        selectedDelegationId: null,
      };

      writeStore(data);

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

  useEffect(() => {
    const handler = () => setData(readStore());
    window.addEventListener('wallet-store-updated', handler);
    return () => window.removeEventListener('wallet-store-updated', handler);
  }, []);

  const persist = useCallback((newData: WalletStoreData) => {
    writeStore(newData);
    setData(newData);
  }, []);

  // --- Agent operations ---

  const addAgent = useCallback((params: {
    id?: string;
    name?: string;
  } = {}) => {
    const agentCount = data.agents.length;
    const agent: Agent = {
      id: params.id || generateId(),
      name: params.name || `Agent #${agentCount + 1}`,
      pairedAt: new Date().toISOString(),
      status: 'paired',
    };
    persist({ ...data, agents: [...data.agents, agent] });
    return agent;
  }, [data, persist]);

  const updateAgent = useCallback((agentId: string, updates: Partial<Agent>) => {
    persist({
      ...data,
      agents: data.agents.map(a => a.id === agentId ? { ...a, ...updates } : a),
    });
  }, [data, persist]);

  const removeAgent = useCallback((agentId: string) => {
    persist({
      ...data,
      agents: data.agents.filter(a => a.id !== agentId),
      delegations: data.delegations.filter(d => d.agentId !== agentId),
    });
  }, [data, persist]);

  const getAgentById = useCallback((agentId: string) => {
    return data.agents.find(a => a.id === agentId) || null;
  }, [data.agents]);

  // --- Wallet operations ---

  const addWallet = useCallback((params: {
    id?: string;
    name?: string;
    addresses?: WalletAddress[];
    originAgentId?: string | null;
  } = {}) => {
    const walletCount = data.wallets.length;
    const wallet: Wallet = {
      id: params.id || generateId(),
      name: params.name || `Wallet #${walletCount + 1}`,
      addresses: params.addresses || generateDefaultAddresses(),
      createdAt: new Date().toISOString(),
      originAgentId: params.originAgentId ?? null,
    };
    persist({ ...data, wallets: [...data.wallets, wallet] });
    return wallet;
  }, [data, persist]);

  const updateWallet = useCallback((walletId: string, updates: Partial<Wallet>) => {
    persist({
      ...data,
      wallets: data.wallets.map(w =>
        w.id === walletId ? { ...w, ...updates } : w
      ),
    });
  }, [data, persist]);

  const deleteWallet = useCallback((walletId: string) => {
    persist({
      ...data,
      wallets: data.wallets.filter(w => w.id !== walletId),
      delegations: data.delegations.filter(d => d.walletId !== walletId),
      selectedWalletId: data.selectedWalletId === walletId ? null : data.selectedWalletId,
    });
  }, [data, persist]);

  const selectWallet = useCallback((walletId: string | null) => {
    persist({ ...data, selectedWalletId: walletId });
  }, [data, persist]);

  // --- Delegation operations ---

  const addDelegation = useCallback((params: {
    walletId: string;
    agentId: string;
    permissions?: Permission[];
    policy?: Partial<Policy>;
  }) => {
    const delegation: Delegation = {
      id: generateId(),
      walletId: params.walletId,
      agentId: params.agentId,
      status: 'active',
      delegatedAt: new Date().toISOString(),
      permissions: params.permissions || [...DEFAULT_PERMISSIONS],
      policy: { ...DEFAULT_POLICY, ...params.policy },
    };
    persist({ ...data, delegations: [...data.delegations, delegation] });
    return delegation;
  }, [data, persist]);

  const removeDelegation = useCallback((delegationId: string) => {
    persist({
      ...data,
      delegations: data.delegations.filter(d => d.id !== delegationId),
      selectedDelegationId: data.selectedDelegationId === delegationId ? null : data.selectedDelegationId,
    });
  }, [data, persist]);

  const updateDelegation = useCallback((delegationId: string, updates: Partial<Delegation>) => {
    persist({
      ...data,
      delegations: data.delegations.map(d =>
        d.id === delegationId ? { ...d, ...updates } : d
      ),
    });
  }, [data, persist]);

  const freezeDelegation = useCallback((delegationId: string) => {
    updateDelegation(delegationId, { status: 'frozen' });
  }, [updateDelegation]);

  const unfreezeDelegation = useCallback((delegationId: string) => {
    updateDelegation(delegationId, { status: 'active' });
  }, [updateDelegation]);

  const updateDelegationPermissions = useCallback((delegationId: string, permissions: Permission[]) => {
    updateDelegation(delegationId, { permissions });
  }, [updateDelegation]);

  const updateDelegationPolicy = useCallback((delegationId: string, policyUpdates: Partial<Policy>) => {
    const delegation = data.delegations.find(d => d.id === delegationId);
    if (!delegation) return;
    updateDelegation(delegationId, {
      policy: { ...delegation.policy, ...policyUpdates },
    });
  }, [data.delegations, updateDelegation]);

  const selectDelegation = useCallback((delegationId: string | null) => {
    persist({ ...data, selectedDelegationId: delegationId });
  }, [data, persist]);

  const getDelegationsForWallet = useCallback((walletId: string) => {
    return data.delegations.filter(d => d.walletId === walletId);
  }, [data.delegations]);

  const getDelegationsForAgent = useCallback((agentId: string) => {
    return data.delegations.filter(d => d.agentId === agentId);
  }, [data.delegations]);

  // --- Backward-compatible helper: onboarding creates agent + wallet + delegation in one call ---

  const addWalletWithAgent = useCallback((params: {
    walletId?: string;
    walletName?: string;
    addresses?: WalletAddress[];
    agentId?: string;
    agentName?: string;
    policy?: Partial<Policy>;
  }) => {
    const walletCount = data.wallets.length;
    const agentCount = data.agents.length;

    const agentId = params.agentId || generateId();
    const walletId = params.walletId || generateId();
    const delegationId = generateId();

    const agent: Agent = {
      id: agentId,
      name: params.agentName || `Agent #${agentCount + 1}`,
      pairedAt: new Date().toISOString(),
      status: 'paired',
    };

    const wallet: Wallet = {
      id: walletId,
      name: params.walletName || `Wallet #${walletCount + 1}`,
      addresses: params.addresses || generateDefaultAddresses(),
      createdAt: new Date().toISOString(),
      originAgentId: agentId,
    };

    const delegation: Delegation = {
      id: delegationId,
      walletId,
      agentId,
      status: 'active',
      delegatedAt: new Date().toISOString(),
      permissions: [...DEFAULT_PERMISSIONS],
      policy: { ...DEFAULT_POLICY, ...params.policy },
    };

    // Check if agent already exists (e.g., already paired)
    const existingAgent = data.agents.find(a => a.id === agentId);
    const newAgents = existingAgent ? data.agents : [...data.agents, agent];

    persist({
      ...data,
      wallets: [...data.wallets, wallet],
      agents: newAgents,
      delegations: [...data.delegations, delegation],
    });

    return { wallet, agent, delegation };
  }, [data, persist]);

  // --- Derived data ---

  const wallets = data.wallets;
  const agents = data.agents;
  const delegations = data.delegations;
  const selectedWallet = data.selectedWalletId
    ? data.wallets.find(w => w.id === data.selectedWalletId) || null
    : null;
  const hasWallets = wallets.length > 0;
  const hasAgents = agents.length > 0;

  return {
    wallets,
    agents,
    delegations,
    selectedWallet,
    hasWallets,
    hasAgents,
    // Agent ops
    addAgent,
    updateAgent,
    removeAgent,
    getAgentById,
    // Wallet ops
    addWallet,
    updateWallet,
    deleteWallet,
    selectWallet,
    // Delegation ops
    addDelegation,
    removeDelegation,
    updateDelegation,
    freezeDelegation,
    unfreezeDelegation,
    updateDelegationPermissions,
    updateDelegationPolicy,
    selectDelegation,
    getDelegationsForWallet,
    getDelegationsForAgent,
    // Convenience
    addWalletWithAgent,
  };
}
