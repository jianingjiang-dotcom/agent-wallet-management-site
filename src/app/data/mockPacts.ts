export type PactPermission = 'transfer' | 'swap' | 'stake' | 'contract_call';

export interface PactPolicy {
  effect: 'allow' | 'deny';
  action: string;
  deny_if?: string[];
  review_if?: string[];
}

export interface PactCompletionCondition {
  type: 'max_transactions' | 'total_amount';
  value: number;
  unit?: string;
}

export interface PactResourceScope {
  chains: string[];
  tokens: string[];
}

export interface PactSpec {
  id: string;
  permissions: PactPermission[];
  policies: PactPolicy[];
  duration_seconds: number;
  completion_conditions: PactCompletionCondition[];
  resource_scope: PactResourceScope;
}

export interface PactApproval {
  id: string;
  pactSpec: PactSpec;
  agentName: string;
  walletName: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  summary: { en: string; zh: string };
}

export const MOCK_PACTS: PactApproval[] = [
  {
    id: 'pact-001',
    agentName: 'DeFi Trading Agent',
    walletName: 'Wallet #1',
    requestedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    status: 'pending',
    summary: {
      en: 'DeFi Trading Agent is requesting permission to perform token transfers and swaps on Wallet #1. The agreement includes a per-transaction limit of $500, a daily limit of $2,000, and transactions exceeding $200 will require your manual confirmation. The agreement is valid for 30 days and is limited to USDC and USDT on Ethereum and Polygon.',
      zh: 'DeFi Trading Agent 请求对 Wallet #1 执行代币转账和兑换操作的授权。协议包含单笔限额 $500、每日限额 $2,000，超过 $200 的交易需要你手动确认。协议有效期 30 天，仅限在 Ethereum 和 Polygon 上操作 USDC 和 USDT。',
    },
    pactSpec: {
      id: 'pact-spec-001',
      permissions: ['transfer', 'swap'],
      policies: [
        {
          effect: 'allow',
          action: 'transfer',
          deny_if: ['amount > 500', 'daily_total > 2000'],
          review_if: ['amount > 200'],
        },
        {
          effect: 'allow',
          action: 'swap',
          deny_if: ['amount > 500', 'daily_total > 2000'],
          review_if: ['amount > 200'],
        },
      ],
      duration_seconds: 30 * 24 * 60 * 60, // 30 days
      completion_conditions: [
        { type: 'total_amount', value: 10000, unit: 'USDC' },
      ],
      resource_scope: {
        chains: ['Ethereum', 'Polygon'],
        tokens: ['USDC', 'USDT'],
      },
    },
  },
  {
    id: 'pact-002',
    agentName: 'Yield Optimizer',
    walletName: 'Wallet #2',
    requestedAt: new Date(Date.now() - 1000 * 60 * 10), // 10 mins ago
    status: 'pending',
    summary: {
      en: 'Yield Optimizer is requesting permission to stake tokens and call smart contracts on Wallet #2. The per-transaction limit is $1,000 with a daily limit of $5,000. Staking operations over $800 will require your approval. The agreement is valid for 7 days on Ethereum only, limited to ETH and stETH.',
      zh: 'Yield Optimizer 请求对 Wallet #2 执行质押和智能合约调用的授权。单笔限额 $1,000，每日限额 $5,000，超过 $800 的质押操作需要你审批。协议有效期 7 天，仅限在 Ethereum 上操作 ETH 和 stETH。',
    },
    pactSpec: {
      id: 'pact-spec-002',
      permissions: ['stake', 'contract_call'],
      policies: [
        {
          effect: 'allow',
          action: 'stake',
          deny_if: ['amount > 1000', 'daily_total > 5000'],
          review_if: ['amount > 800'],
        },
        {
          effect: 'allow',
          action: 'contract_call',
          deny_if: ['daily_total > 5000'],
        },
      ],
      duration_seconds: 7 * 24 * 60 * 60, // 7 days
      completion_conditions: [
        { type: 'max_transactions', value: 50 },
      ],
      resource_scope: {
        chains: ['Ethereum'],
        tokens: ['ETH', 'stETH'],
      },
    },
  },
];
