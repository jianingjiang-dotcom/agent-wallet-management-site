// ── Permission: "scope:action" format (e.g. "write:contract_call", "read:wallet") ──
export type PactPermission = string;

// ── Policy structures matching real Pact JSON ──

export interface PolicyTarget {
  chain_id: string;
  contract_addr: string;
}

export interface PolicyWhen {
  chain_in?: string[];
  target_in?: PolicyTarget[];
}

export interface PolicyDenyIf {
  amount_usd_gt?: string;
  usage_limits?: {
    rolling_24h?: {
      tx_count_gt?: number;
      amount_usd_gt?: string;
    };
  };
}

export interface PolicyReviewIf {
  amount_usd_gt?: string;
  usage_limits?: {
    rolling_24h?: {
      tx_count_gt?: number;
      amount_usd_gt?: string;
    };
  };
}

export interface PolicyRules {
  effect: 'allow' | 'deny';
  when?: PolicyWhen;
  deny_if?: PolicyDenyIf;
  review_if?: PolicyReviewIf;
}

export interface PactPolicy {
  name: string;
  type: string;
  rules: PolicyRules;
}

export interface PactCompletionCondition {
  type: string;
  threshold: string;
}

export interface PactResourceScope {
  wallet_id: string;
  chains?: string[];
  tokens?: string[];
}

export interface PactSpec {
  permissions: PactPermission[];
  policies: PactPolicy[];
  duration_seconds: number;
  completion_conditions: PactCompletionCondition[];
  resource_scope: PactResourceScope;
  program?: string;
}

export interface PactApproval {
  id: string;
  name: string;
  intent: string;
  pactSpec: PactSpec;
  agentName: string;
  walletName: string;
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
  summary?: { en: string; zh: string };
}

// ── Mock data ──

export const MOCK_PACTS: PactApproval[] = [
  {
    id: 'pact-001',
    name: 'WETH Unwrap + ETH→USDC Swap (Sepolia)',
    intent: 'Unwrap all WETH to ETH, then swap 0.05 ETH to USDC via Uniswap V3 on Sepolia',
    agentName: 'DeFi Trading Agent',
    walletName: 'Wallet #1',
    requestedAt: new Date(Date.now() - 1000 * 60 * 30),
    status: 'pending',
    pactSpec: {
      permissions: ['write:contract_call', 'read:wallet'],
      policies: [
        {
          name: 'allow-weth-withdraw',
          type: 'contract_call',
          rules: {
            effect: 'allow',
            when: {
              chain_in: ['SETH'],
              target_in: [
                {
                  chain_id: 'SETH',
                  contract_addr: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
                },
              ],
            },
          },
        },
        {
          name: 'deny-swap-over-limit',
          type: 'contract_call',
          rules: {
            effect: 'deny',
            when: {
              chain_in: ['SETH'],
              target_in: [
                {
                  chain_id: 'SETH',
                  contract_addr: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
                },
              ],
            },
            deny_if: {
              amount_usd_gt: '200',
              usage_limits: {
                rolling_24h: {
                  tx_count_gt: 1,
                },
              },
            },
          },
        },
      ],
      duration_seconds: 3600,
      completion_conditions: [
        { type: 'tx_count', threshold: '2' },
      ],
      resource_scope: {
        wallet_id: 'be61bcf2-d4e0-4b8f-b3ab-12a7c9e8f456',
        chains: ['Sepolia'],
        tokens: ['WETH', 'ETH', 'USDC'],
      },
      program: `# Summary
Step 1: Unwrap all WETH (≈0.1 WETH) to native ETH via WETH contract's withdraw function.
Step 2: Swap exactly 0.05 ETH → USDC through Uniswap V3 SwapRouter on Sepolia, accepting ≥ 95% of quoted output.

# Contract Operations
1. **WETH.withdraw(amount)**
   - Contract: \`0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14\` (Sepolia WETH)
   - Action: Unwrap WETH → ETH
   - Amount: Full balance (~0.1 WETH)

2. **SwapRouter.exactInputSingle(params)**
   - Contract: \`0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E\` (Uniswap V3 Router)
   - Action: Swap ETH → USDC
   - Input: 0.05 ETH
   - Min Output: 95% of quoted USDC amount
   - Fee Tier: 3000 (0.3%)

# Risk Controls
- Per-swap USD limit: $200
- Rolling 24h transaction cap: 1 swap operation
- Only whitelisted contracts on Sepolia chain

# Exit Conditions
- Maximum 2 transactions total
- Pact expires after 1 hour`,
    },
  },
  {
    id: 'pact-002',
    name: 'Aave V3 Yield Optimization',
    intent: 'Supply USDC to Aave V3 lending pool and manage collateral position on Ethereum mainnet',
    agentName: 'Yield Optimizer',
    walletName: 'Wallet #2',
    requestedAt: new Date(Date.now() - 1000 * 60 * 10),
    status: 'pending',
    pactSpec: {
      permissions: ['write:contract_call', 'write:transfer', 'read:wallet'],
      policies: [
        {
          name: 'allow-aave-supply',
          type: 'contract_call',
          rules: {
            effect: 'allow',
            when: {
              chain_in: ['ETH'],
              target_in: [
                {
                  chain_id: 'ETH',
                  contract_addr: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
                },
              ],
            },
          },
        },
        {
          name: 'deny-large-transfer',
          type: 'transfer',
          rules: {
            effect: 'deny',
            deny_if: {
              amount_usd_gt: '5000',
              usage_limits: {
                rolling_24h: {
                  amount_usd_gt: '10000',
                },
              },
            },
          },
        },
        {
          name: 'review-medium-transfer',
          type: 'transfer',
          rules: {
            effect: 'allow',
            review_if: {
              amount_usd_gt: '1000',
              usage_limits: {
                rolling_24h: {
                  tx_count_gt: 5,
                },
              },
            },
          },
        },
      ],
      duration_seconds: 7 * 24 * 60 * 60,
      completion_conditions: [
        { type: 'tx_count', threshold: '20' },
        { type: 'total_amount_usd', threshold: '50000' },
      ],
      resource_scope: {
        wallet_id: '4a92d7c1-8f3e-4d56-b912-7e3c8a1f5d09',
        chains: ['Ethereum'],
        tokens: ['USDC', 'aUSDC', 'ETH'],
      },
      program: `# Summary
Supply up to 10,000 USDC into Aave V3 lending pool on Ethereum mainnet. Monitor and rebalance the position to maintain optimal health factor above 1.5.

# Contract Operations
1. **USDC.approve(spender, amount)**
   - Contract: \`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\` (USDC)
   - Action: Approve Aave Pool to spend USDC

2. **Pool.supply(asset, amount, onBehalfOf, referralCode)**
   - Contract: \`0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2\` (Aave V3 Pool)
   - Action: Supply USDC to earn yield
   - Amount: Up to 10,000 USDC

# Risk Controls
- Single transfer limit: $5,000
- Rolling 24h transfer cap: $10,000
- Transfers over $1,000 require human review
- More than 5 transactions in 24h require human review

# Exit Conditions
- Maximum 20 transactions total
- Maximum $50,000 total volume
- Pact expires after 7 days`,
    },
  },
];
