import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useOutletContext } from 'react-router';
import { ArrowUp, Plus, AtSign, AlertTriangle, CheckCircle, XCircle, Search, MoreHorizontal, Bot, Trash2, Sparkles, Wallet, ChevronRight, SquarePen, PanelLeftClose, X, MessageCircle, ClipboardCheck, Send, Users, Link, FileText, Settings, Clock, History, Copy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWalletStore } from '../hooks/useWalletStore';
import { useOnboardingChat } from '../hooks/useOnboardingChat';
import ChatWelcome from './ChatWelcome';
import ApprovalPage from './ApprovalPage';
import WalletAgentPage from './WalletAgentPage';
import WalletCard from './WalletCard';
import OnboardingMessageRenderer from './onboarding-cards/OnboardingMessageRenderer';
import type { OnboardingData, OnboardingCallbacks } from './onboarding-cards/OnboardingMessageRenderer';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'approval' | 'onboarding';
  content: string;
  timestamp: Date;
  approvalData?: {
    operation: string;
    amount: string;
    target: string;
    reason: string;
    reasonKey?: string;
    agentName?: string;
    walletName?: string;
    status?: 'pending' | 'approved' | 'rejected';
  };
  onboardingData?: OnboardingData;
  walletListData?: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

export default function AIAssistant() {
  const { t, language } = useLanguage();
  const { wallets, hasWallets, addWalletWithAgent, delegations, selectWallet } = useWalletStore();
  const { onClaimWallet, onOpenWalletModal, onShowWalletPage, onHideWalletPage, showWalletPage, onDelegateWallet, onShowApprovalPage, onHideApprovalPage, showApprovalPage, sidebarCollapsed, demoApproval, setHasActiveChat, closeSidebar } = useOutletContext<{
    onSetupWallet: () => void;
    onClaimWallet: () => void;
    onOpenWalletModal: () => void;
    onShowWalletPage: () => void;
    onHideWalletPage: () => void;
    showWalletPage: boolean;
    onDelegateWallet: (walletId: string) => void;
    onShowApprovalPage: () => void;
    onHideApprovalPage: () => void;
    showApprovalPage: boolean;
    sidebarCollapsed: boolean;
    demoApproval: boolean;
    setHasActiveChat: (v: boolean) => void;
    closeSidebar: () => void;
  }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pendingApprovalCount, setPendingApprovalCount] = useState(hasWallets ? 2 : 0);
  const [approvalBannerDismissed, setApprovalBannerDismissed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [inputExpanded, setInputExpanded] = useState(false);
  const shouldFocusInputRef = useRef(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string>('current');
  const [chatTitle, setChatTitle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchModalInputRef = useRef<HTMLInputElement>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [navTooltip, setNavTooltip] = useState<{ label: string; top: number } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [welcomeType, setWelcomeType] = useState<'first-wallet' | null>(null);
  const [approvalInitialTab, setApprovalInitialTab] = useState<'all' | 'pending'>('all');
  const [sidebarPortal, setSidebarPortal] = useState<HTMLElement | null>(null);
  const [showWalletPicker, setShowWalletPicker] = useState<'empty' | 'chat' | null>(null);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const walletPickerRef = useRef<HTMLDivElement>(null);

  // Onboarding chat hook
  const onboarding = useOnboardingChat(!hasWallets);

  // Notify layout whether we have an active chat (for divider visibility)
  useEffect(() => {
    setHasActiveChat(messages.length > 0);
  }, [messages.length, setHasActiveChat]);

  // Check for startOnboarding URL param
  useEffect(() => {
    const startOnboarding = searchParams.get('startOnboarding');
    if (startOnboarding === 'true' && !onboarding.isOnboardingActive) {
      // Clear current chat and start fresh onboarding
      setMessages([]);
      setActiveChatId('current');
      setWelcomeType(null);
      onboarding.startOnboarding();
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Onboarding callbacks
  const onboardingCallbacks: OnboardingCallbacks = {
    onInviteVerify: onboarding.handleInviteVerify,
    onCommandCopy: onboarding.handleCommandCopy,
    onComplete: () => {
      const result = onboarding.handleComplete();
      if (result) {
        addWalletWithAgent({
          walletId: result.walletId,
          agentId: result.agentId,
          policy: result.policy,
        });

        // Convert onboarding messages
        const onboardingMsgs: Message[] = onboarding.onboardingMessages.map(msg => ({
          ...msg,
          role: msg.onboardingData ? 'onboarding' as const : msg.role as Message['role'],
        }));

        const allMsgs = onboardingMsgs;
        setMessages(allMsgs);

        // Update existing session or create new one
        const currentExists = chatSessions.some(s => s.id === activeChatId);
        if (currentExists) {
          // Already in a session — update its messages
          setChatSessions(prev =>
            prev.map(s =>
              s.id === activeChatId
                ? { ...s, messages: allMsgs }
                : s
            )
          );
        } else {
          // Create session entry in sidebar
          const sessionTitle = language === 'zh' ? '钱包创建' : 'Wallet Setup';
          const newSessionId = 'onboarding-' + Date.now();
          setActiveChatId(newSessionId);
          setChatTitle(sessionTitle);
          setChatSessions(prev => [
            { id: newSessionId, title: sessionTitle, timestamp: new Date(), messages: allMsgs },
            ...prev,
          ]);
        }
      }
    },
  };

  // Auto-trigger onComplete when onboarding reaches 'success' step
  useEffect(() => {
    if (onboarding.currentStep === 'success' && onboarding.isOnboardingActive) {
      onboardingCallbacks.onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onboarding.currentStep]);

  // Merge onboarding messages for display
  const displayMessages: Message[] = onboarding.isOnboardingActive
    ? onboarding.onboardingMessages.map(msg => ({
        ...msg,
        role: msg.onboardingData ? 'onboarding' as const : msg.role as Message['role'],
      }))
    : messages;

  const combinedTyping = isTyping || onboarding.isOnboardingTyping;
  const hasDisplayMessages = displayMessages.length > 0 || onboarding.isOnboardingActive;

  // Find the sidebar portal container
  useEffect(() => {
    const el = document.getElementById('sidebar-chat-area');
    if (el) setSidebarPortal(el);
  }, []);

  // Mock chat history data
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(hasWallets ? [
    {
      id: '1',
      title: language === 'zh' ? 'Agent 安装配置' : 'Agent Installation',
      timestamp: new Date(Date.now() - 3600000),
      messages: [
        { id: '1-1', role: 'user', content: language === 'zh' ? '如何安装 Agent？' : 'How to install Agent?', timestamp: new Date(Date.now() - 3600000) },
        { id: '1-2', role: 'assistant', content: language === 'zh' ? '您可以通过 pip install 命令安装 Agent CLI 工具，然后运行 caw 命令进行配置。' : 'You can install the Agent CLI tool via pip install, then run the caw command to configure.', timestamp: new Date(Date.now() - 3590000) },
      ],
    },
    {
      id: '2',
      title: language === 'zh' ? '安全策略设置' : 'Security Policy Setup',
      timestamp: new Date(Date.now() - 86400000),
      messages: [
        { id: '2-1', role: 'user', content: language === 'zh' ? '如何设置安全策略？' : 'How to set up security policies?', timestamp: new Date(Date.now() - 86400000) },
        { id: '2-2', role: 'assistant', content: language === 'zh' ? '建议您启用以下安全功能：单笔限额、每日限额和人工审批规则。' : 'We recommend enabling: per-transaction limit, daily limit, and manual approval rules.', timestamp: new Date(Date.now() - 86390000) },
      ],
    },
    {
      id: '3',
      title: language === 'zh' ? '转账权限咨询' : 'Transfer Permission',
      timestamp: new Date(Date.now() - 172800000),
      messages: [
        { id: '3-1', role: 'user', content: language === 'zh' ? 'Cobo Pact 的转账权限怎么配置？' : 'How to configure transfer permissions?', timestamp: new Date(Date.now() - 172800000) },
        { id: '3-2', role: 'assistant', content: language === 'zh' ? 'Cobo Pact 提供了完善的权限管理系统，您可以按链、按代币设置转账限额。' : 'Cobo Pact provides a comprehensive permission system. You can set transfer limits by chain and token.', timestamp: new Date(Date.now() - 172790000) },
      ],
    },
    {
      id: '4',
      title: language === 'zh' ? 'Gas 费用查询' : 'Gas Fee Inquiry',
      timestamp: new Date(Date.now() - 604800000),
      messages: [
        { id: '4-1', role: 'user', content: language === 'zh' ? '当前 Gas 费用是多少？' : 'What is the current gas fee?', timestamp: new Date(Date.now() - 604800000) },
        { id: '4-2', role: 'assistant', content: language === 'zh' ? '当前以太坊主网 Gas 费用约 15 Gwei，建议在低峰期操作以节省费用。' : 'Current Ethereum mainnet gas is about 15 Gwei. Consider operating during off-peak hours.', timestamp: new Date(Date.now() - 604790000) },
      ],
    },
    {
      id: '5',
      title: language === 'zh' ? '钱包创建指南' : 'Wallet Creation Guide',
      timestamp: new Date(Date.now() - 1209600000),
      messages: [
        { id: '5-1', role: 'user', content: language === 'zh' ? '怎么创建钱包？' : 'How to create a wallet?', timestamp: new Date(Date.now() - 1209600000) },
        { id: '5-2', role: 'assistant', content: language === 'zh' ? '点击"创建钱包"按钮，选择链类型，设置权限规则即可完成创建。' : 'Click "Create Wallet", select chain type, and set permission rules to complete creation.', timestamp: new Date(Date.now() - 1209590000) },
      ],
    },
  ] : []);

  const filteredSessions = chatSessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group sessions by date for search modal
  const groupSessionsByDate = (sessions: ChatSession[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const last7Days = new Date(today.getTime() - 7 * 86400000);

    const groups: { label: string; sessions: ChatSession[] }[] = [
      { label: language === 'zh' ? '今天' : 'Today', sessions: [] },
      { label: language === 'zh' ? '昨天' : 'Yesterday', sessions: [] },
      { label: language === 'zh' ? '前 7 天' : 'Previous 7 Days', sessions: [] },
      { label: language === 'zh' ? '更早' : 'Older', sessions: [] },
    ];

    sessions.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      if (sessionDate >= today) {
        groups[0].sessions.push(session);
      } else if (sessionDate >= yesterday) {
        groups[1].sessions.push(session);
      } else if (sessionDate >= last7Days) {
        groups[2].sessions.push(session);
      } else {
        groups[3].sessions.push(session);
      }
    });

    return groups.filter(g => g.sessions.length > 0);
  };

  const handleSwitchSession = (session: ChatSession) => {
    setActiveChatId(session.id);
    setMessages(session.messages);
    setMobileHistoryOpen(false);
    if (showWalletPage || showApprovalPage) onHideWalletPage();
  };

  const handleDeleteSession = (sessionId: string) => {
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeChatId === sessionId) {
      setActiveChatId('current');
      setMessages([]);
    }
    setDeleteConfirmId(null);
    setMenuOpenId(null);
  };

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpenId]);

  // Close wallet picker on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (walletPickerRef.current && !walletPickerRef.current.contains(e.target as Node)) {
        setShowWalletPicker(null);
      }
    };
    if (showWalletPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showWalletPicker]);

  const handleSelectWallet = (walletName: string) => {
    setInputValue(prev => prev + `@${walletName} `);
    setShowWalletPicker(null);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages, combinedTyping]);

  // Handle prefill & welcome type from URL query params
  useEffect(() => {
    const prefill = searchParams.get('prefill');
    const welcome = searchParams.get('welcome');
    if (prefill) setInputValue(prefill);
    if (welcome === 'first-wallet') setWelcomeType('first-wallet');
    if (welcome === 'wallet-ready') {
      // Go straight to the empty home state — no default message
      setMessages([]);
      setActiveChatId('');
      setChatTitle('');
    }
    if (prefill || welcome) setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleApproval = (messageId: string, action: 'approved' | 'rejected') => {
    let approvalInfo: Message['approvalData'] | undefined;
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId && msg.approvalData) {
          approvalInfo = msg.approvalData;
          return { ...msg, approvalData: { ...msg.approvalData, status: action } };
        }
        return msg;
      })
    );
    // Append confirmation message from assistant
    if (approvalInfo) {
      const confirmMsg: Message = {
        id: `confirm-${messageId}`,
        role: 'assistant',
        content: action === 'approved'
          ? (language === 'zh'
            ? `✅ 已批准 ${approvalInfo.agentName || 'Agent'} 的 ${approvalInfo.operation} 操作（${approvalInfo.amount}），交易将继续执行。`
            : `✅ Approved ${approvalInfo.agentName || 'Agent'}'s ${approvalInfo.operation} (${approvalInfo.amount}). The transaction will proceed.`)
          : (language === 'zh'
            ? `❌ 已拒绝 ${approvalInfo.agentName || 'Agent'} 的 ${approvalInfo.operation} 操作（${approvalInfo.amount}），交易已取消。`
            : `❌ Rejected ${approvalInfo.agentName || 'Agent'}'s ${approvalInfo.operation} (${approvalInfo.amount}). The transaction has been cancelled.`),
        timestamp: new Date(),
      };
      setTimeout(() => {
        setMessages(prev => [...prev, confirmMsg]);
      }, 500);
    }
  };

  const simulateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    if (language === 'zh') {
      if (lowerMessage.includes('钱包状态') || lowerMessage.includes('支持的能力') || lowerMessage.includes('介绍一下我的钱包') || lowerMessage.includes('基础能力') || lowerMessage.includes('cobo pact')) {
        return `Cobo Pact 是面向 AI Agent 的链上钱包管理平台，让你可以安全地将链上操作委托给 Agent，同时保持完整的控制权。以下是核心能力介绍：

🤖 Agent 委托管理
• 支持将钱包操作权限委托给一个或多个 AI Agent
• 每个 Agent 可独立配置操作范围和权限边界
• 随时可撤销或调整 Agent 的委托权限

💳 钱包与资产管理
• 支持创建和管理多个链上钱包
• 支持 ETH、USDC 等主流代币的发送、接收和余额查询
• 支持通过 Agent 发起智能合约交互（需授权）

🔒 风控与安全策略
• 可配置单笔交易限额和每日支出上限
• 超出限额的交易自动进入人工审批队列
• 支持白名单地址管理，限制转账目标范围

📋 交易审批
• 所有超限交易实时推送，等待你确认后才会执行
• 完整的交易历史记录，便于审计和追溯

你可以通过下方的快捷问题继续了解具体的操作方式！`;
      } else if (lowerMessage.includes('安装') || lowerMessage.includes('配置')) {
        return '关于 Agent 的安装和配置，您可以在"Agent 安装指南"页面找到详细的步骤说明。主要包括：1) 安装 SDK，2) 初始化配置，3) 设置 API 密钥。如果您在某个步骤遇到问题，请告诉我具体是哪一步。';
      } else if (lowerMessage.includes('充值') || lowerMessage.includes('管理') && lowerMessage.includes('资产')) {
        return `充值是开始使用 Cobo Pact 的第一步，完成后即可通过 Agent 进行链上操作。

💰 如何充值
1. 进入左侧「我的钱包」，选择目标钱包
2. 点击钱包地址旁的复制按钮获取收款地址
3. 从外部钱包或测试网水龙头向该地址转入代币
4. 到账后余额会自动刷新显示

💡 小贴士
• 当前钱包运行在 Ethereum Sepolia 测试网，可以免费获取测试代币
• 首次建议先充入少量代币熟悉流程

📊 资产管理
• 钱包详情页实时展示各代币余额和完整交易记录
• 你可以直接在对话中发起操作，例如："帮我转 0.1 ETH 到 0x..."
• Agent 发起的转账同样受风控策略约束，超限交易会自动进入审批

🔗 Sepolia 测试代币获取
• ETH: 可通过 Google Cloud Faucet 或 Alchemy Faucet 领取
• USDC: 可在 Sepolia USDC Faucet 领取测试 USDC

如需帮助获取测试代币，随时告诉我！`;
      } else if (lowerMessage.includes('金额上限') || lowerMessage.includes('限额') || lowerMessage.includes('花费')) {
        return `通过风控策略，你可以精确控制每个 Agent 的链上花费范围，确保资金安全。

⚙️ 设置步骤
1. 进入左侧「我的钱包」，选择目标钱包
2. 在「委托与策略」区域找到对应的 Agent
3. 点击编辑策略，即可配置限额规则

📋 可配置的限额类型
• 单笔交易限额 — 单次操作的最大金额（默认 $10）
• 每日支出上限 — Agent 一天内可花费的总额（默认 $50）
• 审批触发阈值 — 超过此金额的交易自动进入审批队列

🛡️ 风控机制说明
• 超出限额的交易不会被拒绝，而是暂停执行并等待你确认
• 每个 Agent 的限额独立计算，互不影响
• 每日额度在 UTC 0:00 自动重置
• 你可以在「交易审批」页面随时处理待审批的交易

💡 最佳实践
• 新 Agent 建议从较低限额开始，运行稳定后再逐步放宽
• 对于高频低额场景（如 Gas 费支付），可适当提高单笔限额
• 对于大额操作场景，建议设置较低的审批阈值以加强管控

需要我帮你调整当前 Agent 的限额设置吗？`;
      } else if (lowerMessage.includes('安全') || lowerMessage.includes('风险') || lowerMessage.includes('风控')) {
        return '安全是我们最重视的部分。建议您启用以下安全功能：1) 双因素认证，2) 自动拦截可疑活动，3) 交易限额控制。您可以在"委托与策略"页面进行详细设置。需要我帮您详细解释某个功能吗？';
      } else if (lowerMessage.includes('余额') || lowerMessage.includes('转账')) {
        return '关于交易和转账，Cobo Pact 提供了完善的交易管理功能。所有交易都会经过多重验证和风控检查。如需查看交易历史或调整交易权限，我可以帮您导航到相应的页面。';
      } else {
        return '感谢您的提问。我会尽力帮助您。如果您需要更详细的技术支持，建议您查看我们的完整文档或联系技术支持团队。还有其他问题吗？';
      }
    } else {
      if (lowerMessage.includes('wallet status') || lowerMessage.includes('capabilities') || lowerMessage.includes('describe my wallet') || lowerMessage.includes('cobo pact')) {
        return `Cobo Pact is an on-chain wallet management platform for AI Agents, allowing you to safely delegate on-chain operations to Agents while maintaining full control. Here are the core capabilities:

🤖 Agent Delegation
• Delegate wallet operation permissions to one or more AI Agents
• Configure independent operation scope and permission boundaries per Agent
• Revoke or adjust Agent delegation at any time

💳 Wallet & Asset Management
• Create and manage multiple on-chain wallets
• Send, receive, and query balances for ETH, USDC, and other major tokens
• Initiate smart contract interactions via Agent (requires authorization)

🔒 Risk Control & Security
• Configure per-transaction limits and daily spending caps
• Over-limit transactions automatically enter a manual approval queue
• Whitelist management to restrict transfer destinations

📋 Transaction Approval
• All over-limit transactions are pushed in real-time, pending your confirmation
• Complete transaction history for audit and traceability

Feel free to explore the quick questions below to learn more about specific operations!`;
      } else if (lowerMessage.includes('install') || lowerMessage.includes('setup')) {
        return 'For Agent installation and configuration, please visit the "Agent Installation" page for step-by-step instructions. The process includes: 1) Installing the SDK, 2) Initializing the configuration, 3) Setting up your API key.';
      } else if (lowerMessage.includes('deposit') || lowerMessage.includes('manage') && lowerMessage.includes('asset')) {
        return `Depositing funds is the first step to start using Cobo Pact. Once funded, your Agent can perform on-chain operations.

💰 How to Deposit
1. Go to "My Wallets" in the left sidebar and select your wallet
2. Click the copy button next to the wallet address
3. Send tokens from an external wallet or testnet faucet
4. Your balance will refresh automatically once the deposit arrives

💡 Tips
• Your wallet is on Ethereum Sepolia testnet — test tokens are free to obtain
• Start with a small amount to familiarize yourself with the process

📊 Asset Management
• View real-time balances and full transaction history in the wallet detail page
• Initiate operations directly in chat, e.g., "Transfer 0.1 ETH to 0x..."
• Agent-initiated transfers follow the same risk policies — over-limit transactions require approval

🔗 Sepolia Test Token Faucets
• ETH: Available via Google Cloud Faucet or Alchemy Faucet
• USDC: Available via Sepolia USDC Faucet

Let me know if you need help obtaining test tokens!`;
      } else if (lowerMessage.includes('spending limit') || lowerMessage.includes('daily limit') || lowerMessage.includes('spending')) {
        return `Risk policies let you precisely control each Agent's on-chain spending to keep your funds safe.

⚙️ Setup Steps
1. Go to "My Wallets" in the left sidebar and select the target wallet
2. Find the Agent under "Delegation & Policy"
3. Click edit policy to configure limit rules

📋 Configurable Limit Types
• Per-transaction limit — Max amount per operation (default: $10)
• Daily spending cap — Total amount an Agent can spend per day (default: $50)
• Approval threshold — Transactions above this amount auto-enter the approval queue

🛡️ How Risk Controls Work
• Over-limit transactions are paused (not rejected) and await your confirmation
• Each Agent's limits are calculated independently
• Daily quotas reset automatically at UTC 0:00
• Manage pending approvals anytime from the "Approvals" page

💡 Best Practices
• Start new Agents with lower limits and increase gradually once stable
• For high-frequency, low-value scenarios (e.g., gas payments), consider higher per-tx limits
• For large-value operations, set a lower approval threshold for tighter control

Would you like me to help adjust your current Agent's limit settings?`;
      } else if (lowerMessage.includes('security') || lowerMessage.includes('risk')) {
        return 'Security is our top priority. I recommend enabling: 1) Two-factor authentication, 2) Auto-block suspicious activities, 3) Transaction limits. You can configure these in "Delegation & Policy" page.';
      } else if (lowerMessage.includes('balance') || lowerMessage.includes('transfer')) {
        return 'Cobo Pact provides comprehensive transaction management. All transactions go through multiple verification and risk control checks. I can guide you to the relevant page if needed.';
      } else {
        return "Thank you for your question. I'll do my best to assist you. For more detailed technical support, please refer to our complete documentation. Is there anything else I can help with?";
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // During onboarding invite-code step, intercept input as invite code attempt
    if (onboarding.isOnboardingActive && onboarding.currentStep === 'invite-code') {
      const raw = inputValue.trim();
      setInputValue(''); setInputExpanded(false);
      await onboarding.handleInviteFromChat(raw);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    let currentSessionId = activeChatId;

    if (chatSessions.some(s => s.id === activeChatId)) {
      // Already in an existing session — append message
      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, userMessage] }
            : s
        )
      );
    } else {
      // New conversation — create session
      const title = inputValue.length > 20 ? inputValue.slice(0, 20) + '...' : inputValue;
      setChatTitle(title);
      const newSessionId = 'new-' + Date.now();
      currentSessionId = newSessionId;
      setActiveChatId(newSessionId);
      setChatSessions((prev) => [
        { id: newSessionId, title, timestamp: new Date(), messages: [userMessage] },
        ...prev,
      ]);
    }

    setMessages((prev) => [...prev, userMessage]);
    setInputValue(''); setInputExpanded(false);
    setIsTyping(true);

    setTimeout(() => {
      const lowerInput = inputValue.toLowerCase();
      const isWalletListQuery = hasWallets && (
        lowerInput.includes('我的钱包') || lowerInput.includes('钱包列表') || lowerInput.includes('查看钱包') || lowerInput.includes('展示钱包') || lowerInput.includes('显示钱包') || lowerInput.includes('所有钱包') ||
        lowerInput.includes('my wallet') || lowerInput.includes('wallet list') || lowerInput.includes('show wallet') || lowerInput.includes('list wallet') || lowerInput.includes('all wallet')
      );

      // Check if this should trigger an approval card (demo mode + transfer-related keywords)
      const isApprovalTrigger = demoApproval && hasWallets && (
        lowerInput.includes('转账') || lowerInput.includes('发送') || lowerInput.includes('transfer') || lowerInput.includes('send') ||
        lowerInput.includes('swap') || lowerInput.includes('兑换')
      );

      if (isApprovalTrigger) {
        const firstWallet = wallets[0];
        const walletDelegations = delegations.filter(d => d.walletId === firstWallet?.id);
        const agentName = walletDelegations.length > 0 ? `Agent #${walletDelegations[0].agentId.slice(-4)}` : 'Agent #1';
        const amounts = ['50 USDC', '120 USDC', '0.5 ETH', '200 USDT'];
        const targets = ['0x7a3d...f82e', '0x4b2c...a91d', '0x1f9a...c3e7', '0x9d8e...b4f2'];
        const idx = Math.floor(Math.random() * amounts.length);

        // First: assistant explains the situation
        const explainMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: language === 'zh'
            ? `${agentName} 正在尝试执行一笔转账操作，但金额超出了设定的单笔限额，需要你的审批确认。`
            : `${agentName} is attempting a transfer that exceeds the configured per-transaction limit. Your approval is required.`,
          timestamp: new Date(),
        };

        // Then: the approval card
        const approvalMsg: Message = {
          id: (Date.now() + 2).toString(),
          role: 'approval',
          content: '',
          timestamp: new Date(),
          approvalData: {
            operation: 'Transfer',
            amount: amounts[idx],
            target: targets[idx],
            reason: language === 'zh' ? '超出单笔限额' : 'Exceeded single transaction limit',
            reasonKey: 'approval.reason.singleLimit',
            agentName,
            walletName: firstWallet?.name || 'Wallet #1',
            status: 'pending',
          },
        };

        setMessages(prev => [...prev, explainMsg]);
        setChatSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, explainMsg] } : s));

        setTimeout(() => {
          setMessages(prev => [...prev, approvalMsg]);
          setChatSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, approvalMsg] } : s));
        }, 800);
      } else {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: isWalletListQuery
            ? (language === 'zh'
              ? `您当前共有 ${wallets.length} 个钱包，以下是钱包列表：`
              : `You currently have ${wallets.length} wallet${wallets.length > 1 ? 's' : ''}. Here's your wallet list:`)
            : simulateAIResponse(inputValue),
          timestamp: new Date(),
          ...(isWalletListQuery ? { walletListData: true } : {}),
        };
        setMessages((prev) => [...prev, aiResponse]);
        setChatSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? { ...s, messages: [...s.messages, aiResponse] }
              : s
          )
        );
      }
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleSendDirect = (text: string) => {
    if (isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    let currentSessionId = activeChatId;

    if (chatSessions.some(s => s.id === activeChatId)) {
      // Already in an existing session — append message
      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, userMessage] }
            : s
        )
      );
    } else {
      // New conversation — create session
      const title = text.length > 20 ? text.slice(0, 20) + '...' : text;
      const newSessionId = 'new-' + Date.now();
      currentSessionId = newSessionId;
      setActiveChatId(newSessionId);
      setChatSessions((prev) => [
        { id: newSessionId, title, timestamp: new Date(), messages: [userMessage] },
        ...prev,
      ]);
    }

    setMessages((prev) => [...prev, userMessage]);
    setInputValue(''); setInputExpanded(false);
    setIsTyping(true);

    setTimeout(() => {
      const lowerInput = text.toLowerCase();
      const isWalletListQuery = hasWallets && (
        lowerInput.includes('我的钱包') || lowerInput.includes('钱包列表') || lowerInput.includes('查看钱包') || lowerInput.includes('展示钱包') || lowerInput.includes('显示钱包') || lowerInput.includes('所有钱包') ||
        lowerInput.includes('my wallet') || lowerInput.includes('wallet list') || lowerInput.includes('show wallet') || lowerInput.includes('list wallet') || lowerInput.includes('all wallet')
      );
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: isWalletListQuery
          ? (language === 'zh'
            ? `您当前共有 ${wallets.length} 个钱包，以下是钱包列表：`
            : `You currently have ${wallets.length} wallet${wallets.length > 1 ? 's' : ''}. Here's your wallet list:`)
          : simulateAIResponse(text),
        timestamp: new Date(),
        ...(isWalletListQuery ? { walletListData: true } : {}),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, aiResponse] }
            : s
        )
      );
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveChatId('current');
    setWelcomeType(null);
    onboarding.resetOnboarding();
    if (showWalletPage || showApprovalPage) onHideWalletPage();
    shouldFocusInputRef.current = true;
  };

  // Start the onboarding flow
  const handleStartOnboarding = () => {
    const title = language === 'zh' ? '创建 Cobo Agent Wallet' : 'Create Cobo Agent Wallet';
    const newSessionId = 'onboarding-' + Date.now();
    setActiveChatId(newSessionId);
    setChatSessions((prev) => [
      { id: newSessionId, title, timestamp: new Date(), messages: [] },
      ...prev,
    ]);
    onboarding.startOnboarding();
  };

  // Chat sessions sidebar content (portaled into DashboardLayout sidebar)
  const chatSessionsSidebar = (
    <>
      {/* Action items */}
      <div className="px-2 pt-0 pb-[8px] flex flex-col gap-[2px]">
        <button
          onClick={() => { handleNewChat(); closeSidebar(); }}
          className={`h-[36px] flex items-center gap-[8px] rounded-[8px] transition-colors text-[var(--app-text)] overflow-hidden w-full ${sidebarCollapsed ? 'px-[11px]' : 'px-[8px] hover:bg-[var(--app-hover-accent-bg)]'}`}
          onMouseEnter={(e) => { if (sidebarCollapsed) { const rect = e.currentTarget.getBoundingClientRect(); setNavTooltip({ label: language === 'zh' ? '新对话' : 'New Chat', top: rect.top + rect.height / 2 }); } }}
          onMouseLeave={() => setNavTooltip(null)}
        >
          <div className={`shrink-0 flex items-center justify-center ${sidebarCollapsed ? 'rounded-[8px] hover:bg-[var(--app-hover-accent-bg)] transition-colors' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M9.99999 18.3333C14.6024 18.3333 18.3333 14.6023 18.3333 9.99996C18.3333 5.39759 14.6024 1.66663 9.99999 1.66663C5.39762 1.66663 1.66666 5.39759 1.66666 9.99996C1.66666 14.6023 5.39762 18.3333 9.99999 18.3333Z" fill="currentColor" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.66666 10H13.3333" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 6.66663V13.3333" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className={`text-[14px] leading-[20px] font-normal whitespace-nowrap transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>{t('ai.newChat')}</span>
        </button>
        <button
          onClick={() => { setShowSearchModal(true); setSearchQuery(''); }}
          className={`h-[36px] flex items-center gap-[8px] rounded-[8px] transition-colors text-[var(--app-text)] overflow-hidden w-full ${sidebarCollapsed ? 'px-[11px]' : 'px-[8px] hover:bg-[var(--app-hover-accent-bg)]'}`}
          onMouseEnter={(e) => { if (sidebarCollapsed) { const rect = e.currentTarget.getBoundingClientRect(); setNavTooltip({ label: language === 'zh' ? '搜索对话' : 'Search Chats', top: rect.top + rect.height / 2 }); } }}
          onMouseLeave={() => setNavTooltip(null)}
        >
          <div className={`shrink-0 flex items-center justify-center ${sidebarCollapsed ? 'rounded-[8px] hover:bg-[var(--app-hover-accent-bg)] transition-colors' : ''}`}>
            <Search className="w-[18px] h-[18px] shrink-0" strokeWidth={1.5} />
          </div>
          <span className={`text-[14px] leading-[20px] font-normal whitespace-nowrap transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>{language === 'zh' ? '搜索对话' : 'Search Chats'}</span>
        </button>
        {hasWallets && (
          <>
            <button
              onClick={() => { if (!showWalletPage) { onShowWalletPage(); setActiveChatId('current'); } }}
              className={`h-[36px] flex items-center gap-[8px] rounded-[8px] transition-colors overflow-hidden w-full ${sidebarCollapsed ? 'px-[11px]' : 'px-[8px] hover:bg-[var(--app-hover-accent-bg)]'} ${showWalletPage && !sidebarCollapsed ? 'bg-[var(--app-hover-accent-bg)] text-[var(--app-text)]' : 'text-[var(--app-text)]'}`}
              onMouseEnter={(e) => { if (sidebarCollapsed) { const rect = e.currentTarget.getBoundingClientRect(); setNavTooltip({ label: language === 'zh' ? '我的钱包' : 'My Wallets', top: rect.top + rect.height / 2 }); } }}
              onMouseLeave={() => setNavTooltip(null)}
            >
              <div className={`shrink-0 flex items-center justify-center ${sidebarCollapsed ? 'rounded-[8px] hover:bg-[var(--app-hover-accent-bg)] transition-colors' : ''} ${showWalletPage && sidebarCollapsed ? 'bg-[var(--app-hover-accent-bg)]' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M14.1667 11.6666H14.175" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.83333 5.83333H15.8333C16.2754 5.83333 16.6993 6.00893 17.0118 6.32149C17.3244 6.63405 17.5 7.05797 17.5 7.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H15.8333" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className={`text-[14px] leading-[20px] font-normal whitespace-nowrap transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>{language === 'zh' ? '我的钱包' : 'My Wallets'}</span>
            </button>
            <button
              onClick={() => { if (!showApprovalPage) { setApprovalInitialTab('all'); onShowApprovalPage(); setActiveChatId('current'); } }}
              className={`h-[36px] flex items-center gap-[8px] rounded-[8px] transition-colors overflow-hidden w-full ${sidebarCollapsed ? 'px-[11px]' : 'px-[8px] hover:bg-[var(--app-hover-accent-bg)]'} ${showApprovalPage && !sidebarCollapsed ? 'bg-[var(--app-hover-accent-bg)] text-[var(--app-text)]' : 'text-[var(--app-text)]'}`}
              onMouseEnter={(e) => { if (sidebarCollapsed) { const rect = e.currentTarget.getBoundingClientRect(); setNavTooltip({ label: language === 'zh' ? '交易审批' : 'Approvals', top: rect.top + rect.height / 2 }); } }}
              onMouseLeave={() => setNavTooltip(null)}
            >
              <div className={`shrink-0 flex items-center justify-center ${sidebarCollapsed ? 'rounded-[8px] hover:bg-[var(--app-hover-accent-bg)] transition-colors' : ''} ${showApprovalPage && sidebarCollapsed ? 'bg-[var(--app-hover-accent-bg)]' : ''}`}>
                <div className="relative shrink-0">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M16.6667 10.8333C16.6667 15 13.75 17.0833 10.2833 18.2916C10.1018 18.3532 9.90462 18.3502 9.72501 18.2833C6.25001 17.0833 3.33334 15 3.33334 10.8333V4.99997C3.33334 4.77895 3.42114 4.56699 3.57742 4.41071C3.7337 4.25443 3.94566 4.16663 4.16668 4.16663C5.83334 4.16663 7.91668 3.16663 9.36668 1.89997C9.54322 1.74913 9.7678 1.66626 10 1.66626C10.2322 1.66626 10.4568 1.74913 10.6333 1.89997C12.0917 3.17497 14.1667 4.16663 15.8333 4.16663C16.0544 4.16663 16.2663 4.25443 16.4226 4.41071C16.5789 4.56699 16.6667 4.77895 16.6667 4.99997V10.8333Z" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 10L9.16667 11.6667L12.5 8.33337" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {demoApproval && pendingApprovalCount > 0 && (
                    <div className={`absolute -top-[2px] -right-[2px] w-[8px] h-[8px] bg-[#FF3B30] rounded-full transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-100' : 'opacity-0'}`} />
                  )}
                </div>
              </div>
              <span className={`text-[14px] leading-[20px] font-normal whitespace-nowrap transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>{language === 'zh' ? '交易审批' : 'Approvals'}</span>
              {demoApproval && pendingApprovalCount > 0 && (
                <span className={`shrink-0 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-[#FF3B30] text-white text-[11px] leading-[1] font-medium px-[4px] transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                  {pendingApprovalCount}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* Session list */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden px-2 flex flex-col gap-[2px] transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {chatSessions.length > 0 && (
          <div className="p-[8px]">
            <span className="text-[12px] leading-[16px] font-normal text-[var(--app-text-secondary)]">
              {language === 'zh' ? '对话历史' : 'History'}
            </span>
          </div>
        )}
        {chatSessions.map((session) => (
          <div key={session.id} className={`relative group rounded-[8px] transition-colors ${activeChatId === session.id ? 'bg-[var(--app-hover-accent-bg)]' : 'hover:bg-[var(--app-hover-accent-bg)]'}`}>
            <button
              onClick={() => handleSwitchSession(session)}
              className={`w-full text-left px-[8px] py-[8px] pr-8 rounded-[8px] text-[14px] leading-[20px] font-normal truncate ${
                activeChatId === session.id
                  ? 'text-[var(--app-text)]'
                  : 'text-[var(--app-text)]'
              }`}
            >
              {session.title}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === session.id ? null : session.id); }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-opacity text-[var(--app-text-secondary)] hover:text-[var(--app-text)] ${
                activeChatId === session.id || menuOpenId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 10.8333C10.4602 10.8333 10.8333 10.4602 10.8333 9.99996C10.8333 9.53972 10.4602 9.16663 10 9.16663C9.53977 9.16663 9.16667 9.53972 9.16667 9.99996C9.16667 10.4602 9.53977 10.8333 10 10.8333Z" fill="currentColor" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.8333 10.8333C16.2936 10.8333 16.6667 10.4602 16.6667 9.99996C16.6667 9.53972 16.2936 9.16663 15.8333 9.16663C15.3731 9.16663 15 9.53972 15 9.99996C15 10.4602 15.3731 10.8333 15.8333 10.8333Z" fill="currentColor" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.16666 10.8333C4.6269 10.8333 4.99999 10.4602 4.99999 9.99996C4.99999 9.53972 4.6269 9.16663 4.16666 9.16663C3.70642 9.16663 3.33333 9.53972 3.33333 9.99996C3.33333 10.4602 3.70642 10.8333 4.16666 10.8333Z" fill="currentColor" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {menuOpenId === session.id && (
              <div ref={menuRef} className="absolute right-0 top-full mt-1 bg-[var(--app-card-bg)] rounded-lg shadow-lg border border-[var(--app-border-medium)] py-1 z-50" style={{ minWidth: '150px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    try { navigator.clipboard.writeText(session.id).catch(() => {}); } catch {}
                    setMenuOpenId(null);
                    setToastMessage(language === 'zh' ? '复制成功' : 'Copied');
                    setTimeout(() => setToastMessage(null), 2000);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[var(--app-text)] hover:bg-[var(--app-hover-bg)] flex items-center gap-2"
                >
                  <Copy style={{ width: '16px', height: '16px' }} />
                  {language === 'zh' ? '复制会话 ID' : 'Copy Session ID'}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(session.id); setMenuOpenId(null); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-[var(--app-hover-accent-bg)] flex items-center gap-2"
                >
                  <Trash2 style={{ width: '14px', height: '14px' }} strokeWidth={1.5} />
                  {language === 'zh' ? '删除' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

    </>
  );

  // Search modal - rendered at top level, not inside sidebar portal
  const searchModal = showSearchModal ? (
    <div className="fixed inset-0 bg-black/30 lg:flex lg:items-center lg:justify-center z-[60]" onClick={() => setShowSearchModal(false)}>
      <div
        className="bg-[var(--app-card-bg)] w-full h-full lg:w-[680px] lg:h-[440px] lg:rounded-[16px] shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-[20px] py-[12px] border-b border-[var(--app-border-medium)]">
          <Search className="w-[16px] h-[16px] text-[var(--app-text-secondary)] shrink-0" strokeWidth={1.5} />
          <input
            ref={searchModalInputRef}
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'zh' ? '搜索聊天...' : 'Search chats...'}
            className="flex-1 text-[14px] bg-transparent text-[var(--app-text)] placeholder-[#7C7C7C] focus:outline-none"
          />
          <button
            onClick={() => setShowSearchModal(false)}
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] hover:bg-[var(--app-hover-accent-bg)] transition-colors text-[var(--app-text-secondary)]"
          >
            <X className="w-[16px] h-[16px]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-5 pt-2 pb-1">
            <span className="text-[12px] font-normal text-[var(--app-text-secondary)]">{language === 'zh' ? '近期对话' : 'Recent Chats'}</span>
          </div>
          {/* All sessions flat list */}
          {filteredSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => { handleSwitchSession(session); setShowSearchModal(false); }}
              className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-[var(--app-hover-accent-bg)] transition-colors"
            >
              <MessageCircle className="w-[16px] h-[16px] text-[var(--app-text-secondary)] shrink-0" strokeWidth={1.5} />
              <span className="text-[14px] text-[var(--app-text)] truncate">{session.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  // Render a single message (shared between regular and onboarding messages)
  const renderAssistantHeader = () => (
    <div style={{ fontSize: '14px', lineHeight: '20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M13.0909 5.81818L12.1818 3.81818L10.1818 2.90909L12.1818 2L13.0909 0L14 2L16 2.90909L14 3.81818L13.0909 5.81818ZM13.0909 16L12.1818 14L10.1818 13.0909L12.1818 12.1818L13.0909 10.1818L14 12.1818L16 13.0909L14 14L13.0909 16ZM5.81818 13.8182L4 9.81818L0 8L4 6.18182L5.81818 2.18182L7.63636 6.18182L11.6364 8L7.63636 9.81818L5.81818 13.8182Z" fill="#1F32D6"/>
      </svg>
      <span style={{ fontWeight: 600, color: '#0A0A0A', fontSize: '14px' }}>Cobo Agentic Wallet</span>
    </div>
  );

  return (
    <>
      {/* Portal chat sessions into the layout sidebar */}
      {sidebarPortal && createPortal(chatSessionsSidebar, sidebarPortal)}

      {/* Global toast message */}
      {toastMessage && createPortal(
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] px-4 py-2 bg-[#1C1C1C] text-white text-[14px] leading-[20px] rounded-[8px] shadow-lg animate-reveal-up" style={{ animationDuration: '200ms' }}>
          {toastMessage}
        </div>,
        document.body
      )}

      {/* Nav tooltip - rendered via portal to avoid sidebar clipping */}
      {navTooltip && createPortal(
        <div
          className="fixed z-[200] px-[6px] py-[4px] bg-[#0A0A0A] text-white text-[12px] leading-[16px] rounded-[6px] whitespace-nowrap pointer-events-none"
          style={{
            top: `${navTooltip.top}px`,
            left: `${52 + 8}px`,
            transform: 'translateY(-50%)',
          }}
        >
          {navTooltip.label}
        </div>,
        document.body
      )}

      {/* Search modal - rendered at top level via portal to body */}
      {showSearchModal && createPortal(searchModal, document.body)}

      {/* Delete confirmation dialog - rendered at top level */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-[var(--app-card-bg)] rounded-[8px] p-6 shadow-xl" style={{ maxWidth: '360px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <p className="text-base font-medium text-[var(--app-text)] mb-2">
              {language === 'zh' ? '删除对话历史？' : 'Delete conversation history?'}
            </p>
            <p className="text-sm text-[var(--app-text-secondary)] mb-6">
              {language === 'zh' ? '确定要删除这条对话历史吗？此操作不可撤销。' : 'Are you sure you want to delete this conversation? This action cannot be undone.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm text-[var(--app-text-secondary)] bg-[var(--app-bg)] rounded-lg hover:bg-[var(--app-hover-accent-bg)] transition-colors"
              >
                {language === 'zh' ? '取消' : 'Cancel'}
              </button>
              <button
                onClick={() => handleDeleteSession(deleteConfirmId)}
                className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                {language === 'zh' ? '删除' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            console.log('Selected file:', file.name);
          }
          e.target.value = '';
        }}
      />

      {/* Wallet page - shown when wallet sidebar item is active */}
      {showWalletPage && (
        <div className="flex-1 flex flex-col bg-[var(--app-card-bg)] overflow-y-auto min-h-0 relative">
          {/* Floating approval notification banner */}
          {demoApproval && hasWallets && pendingApprovalCount > 0 && !approvalBannerDismissed && (
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-center px-6 pt-[24px] pointer-events-none">
              <div className="w-full max-w-[768px] flex items-center justify-between px-4 py-3 rounded-[8px] bg-[#FEF1E8] pointer-events-auto">
                <div className="flex items-center gap-2">
                  <div className="w-[18px] h-[18px] flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6667 10.8333C16.6667 15 13.75 17.0833 10.2833 18.2916C10.1018 18.3532 9.90461 18.3502 9.72499 18.2833C6.24999 17.0833 3.33333 15 3.33333 10.8333V4.99997C3.33333 4.77895 3.42113 4.56699 3.57741 4.41071C3.73369 4.25443 3.94565 4.16663 4.16666 4.16663C5.83333 4.16663 7.91666 3.16663 9.36666 1.89997C9.54321 1.74913 9.76779 1.66626 9.99999 1.66626C10.2322 1.66626 10.4568 1.74913 10.6333 1.89997C12.0917 3.17497 14.1667 4.16663 15.8333 4.16663C16.0543 4.16663 16.2663 4.25443 16.4226 4.41071C16.5789 4.56699 16.6667 4.77895 16.6667 4.99997V10.8333Z" stroke="#F97316" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 9.99992L9.16667 11.6666L12.5 8.33325" stroke="#F97316" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span className="text-[14px] leading-[20px] text-[var(--app-text)] font-normal">
                    {language === 'zh'
                      ? <>{pendingApprovalCount} 条审批待处理</>
                      : <>{pendingApprovalCount} pending approval{pendingApprovalCount > 1 ? 's' : ''}</>}
                  </span><button onClick={() => { setApprovalInitialTab('pending'); onShowApprovalPage(); }} className="text-[14px] leading-[20px] text-[#F97316] hover:text-[#FF9500] transition-colors font-normal cursor-pointer">
                    {language === 'zh' ? '立即查看' : 'View now'}
                  </button>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setApprovalBannerDismissed(true); }} className="cursor-pointer relative group p-[2px] -m-[2px]" title={language === 'zh' ? '关闭提示' : 'Close tip'}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#FF9500] transition-colors"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  <span className="absolute top-[calc(100%-2px+16px)] left-1/2 -translate-x-1/2 px-[6px] py-[4px] text-[12px] leading-[16px] font-normal text-white bg-[#0A0A0A] rounded-[6px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{language === 'zh' ? '关闭提示' : 'Close tip'}</span>
                </button>
              </div>
            </div>
          )}
          <div className="w-full max-w-[864px] mx-auto px-[24px] py-[92px]">
            <WalletAgentPage
              onSetupWallet={() => { onHideWalletPage(); setMessages([]); setActiveChatId('current'); setWelcomeType(null); onboarding.startOnboarding(); }}
              onClaimWallet={onClaimWallet}
              onDelegateWallet={onDelegateWallet}
            />
          </div>
        </div>
      )}

      {/* Approval page - shown when approval sidebar item is active */}
      {showApprovalPage && (
        <div className="flex-1 flex flex-col bg-[var(--app-card-bg)] overflow-y-auto min-h-0">
          <div className="w-full max-w-[864px] mx-auto px-[24px] py-[92px]">
            <ApprovalPage key={approvalInitialTab} initialTab={approvalInitialTab} onPendingCountChange={setPendingApprovalCount} />
          </div>
        </div>
      )}

      {/* Chat area - full height */}
      {!showWalletPage && !showApprovalPage && (
      <div className="flex-1 flex flex-col bg-[var(--app-card-bg)] overflow-hidden min-h-0">
        {/* Floating approval notification banner */}
        {demoApproval && hasWallets && pendingApprovalCount > 0 && !approvalBannerDismissed && (
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-center px-6 pt-[24px] pointer-events-none">
            <div className="w-full max-w-[768px] flex items-center justify-between px-4 py-3 rounded-[8px] bg-[#FEF1E8] pointer-events-auto">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6667 10.8333C16.6667 15 13.75 17.0833 10.2833 18.2916C10.1018 18.3532 9.90461 18.3502 9.72499 18.2833C6.24999 17.0833 3.33333 15 3.33333 10.8333V4.99997C3.33333 4.77895 3.42113 4.56699 3.57741 4.41071C3.73369 4.25443 3.94565 4.16663 4.16666 4.16663C5.83333 4.16663 7.91666 3.16663 9.36666 1.89997C9.54321 1.74913 9.76779 1.66626 9.99999 1.66626C10.2322 1.66626 10.4568 1.74913 10.6333 1.89997C12.0917 3.17497 14.1667 4.16663 15.8333 4.16663C16.0543 4.16663 16.2663 4.25443 16.4226 4.41071C16.5789 4.56699 16.6667 4.77895 16.6667 4.99997V10.8333Z" stroke="#F97316" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 9.99992L9.16667 11.6666L12.5 8.33325" stroke="#F97316" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="text-[14px] leading-[20px] text-[var(--app-text)] font-normal">
                  {language === 'zh'
                    ? <>{pendingApprovalCount} 条审批待处理</>
                    : <>{pendingApprovalCount} pending approval{pendingApprovalCount > 1 ? 's' : ''}</>}
                </span><button onClick={() => { setApprovalInitialTab('pending'); onShowApprovalPage(); }} className="text-[14px] leading-[20px] text-[#F97316] hover:text-[#FF9500] transition-colors font-normal cursor-pointer">
                  {language === 'zh' ? '立即查看' : 'View now'}
                </button>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setApprovalBannerDismissed(true); }} className="cursor-pointer relative group p-[2px] -m-[2px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#FF9500] transition-colors"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                <span className="absolute top-[calc(100%-2px+16px)] left-1/2 -translate-x-1/2 px-[6px] py-[4px] text-[12px] leading-[16px] font-normal text-white bg-[#0A0A0A] rounded-[6px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">{language === 'zh' ? '关闭提示' : 'Close tip'}</span>
              </button>
            </div>
          </div>
        )}
        {/* Messages area */}
        {(displayMessages.length > 0 || combinedTyping) && (
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-6 flex flex-col items-center" style={{ gap: '24px', paddingTop: demoApproval && hasWallets && pendingApprovalCount > 0 && !approvalBannerDismissed ? '92px' : '24px' }}>
          <div className="w-full max-w-[768px] flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {displayMessages.map((message, msgIndex) => {
            // Check if this non-user message should be grouped with the previous one (skip header)
            const prevMsg = msgIndex > 0 ? displayMessages[msgIndex - 1] : null;
            const isGroupedWithPrev = message.role !== 'user' && prevMsg !== null && prevMsg.role !== 'user';

            return (
            <div key={message.id} className="animate-reveal-up" style={{ animationDuration: '400ms', ...(isGroupedWithPrev ? { marginTop: '-8px' } : {}) }}>
              {/* Onboarding messages */}
              {message.role === 'onboarding' && message.onboardingData ? (
                <div className="flex items-start justify-start">
                  <div className="bg-transparent text-[var(--app-text)] w-full min-w-0 overflow-hidden">
                    {!isGroupedWithPrev && renderAssistantHeader()}
                    {message.content && (
                      <div className="whitespace-pre-wrap break-words text-[14px] leading-[22px] lg:text-[16px] lg:leading-[28px] lg:pl-[20px]">
                        {message.content}
                      </div>
                    )}
                    <OnboardingMessageRenderer
                      data={message.onboardingData}
                      callbacks={onboardingCallbacks}
                    />
                    {/* Post-success suggestions — show after setup-command card when pairing is done */}
                    {message.onboardingData.step === 'setup-command' && message.onboardingData.payload?.pairingPhase === 'done' && (
                      <div className="flex flex-wrap gap-[10px] mt-4 justify-center lg:pl-[20px]">
                        {(language === 'zh' ? [
                          'Cobo Pact 能做什么？',
                          '第一次如何给钱包充值？',
                          '如何设置 Agent 的每日花费上限？',
                        ] : [
                          'Introduce Cobo Pact capabilities',
                          'How to make the first deposit',
                          'How to limit Agent daily spending',
                        ]).map((label) => (
                          <button
                            key={label}
                            onClick={() => {
                              handleSendDirect(label);
                            }}
                            className="w-fit px-[16px] py-[10px] rounded-[8px] border border-[var(--app-border-medium)] bg-[var(--app-card-bg)] hover:bg-[var(--app-hover-accent-bg)] transition-all text-[14px] leading-[20px] font-normal text-[var(--app-text)]"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : message.role === 'approval' && message.approvalData ? (
                <div className="flex justify-center">
                  <div className="bg-[var(--app-card-bg)] border-2 border-[var(--app-warning)] rounded-[8px] p-4 w-full max-w-md shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <AlertTriangle className="w-[18px] h-[18px] text-[var(--app-warning)] mr-2" />
                        <h4 className="font-semibold text-[var(--app-text)]">{t('ai.approvalRequest')}</h4>
                      </div>
                      {message.approvalData.status === 'pending' && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 animate-pulse">
                          {language === 'zh' ? '待审批' : 'Pending'}
                        </span>
                      )}
                    </div>

                    {/* Agent & Wallet info */}
                    {(message.approvalData.agentName || message.approvalData.walletName) && (
                      <div className="flex items-center gap-3 mb-3 text-[12px] text-[var(--app-text-secondary)]">
                        {message.approvalData.agentName && (
                          <span className="flex items-center gap-1">
                            <Bot className="w-3 h-3" /> {message.approvalData.agentName}
                          </span>
                        )}
                        {message.approvalData.walletName && (
                          <span className="flex items-center gap-1">
                            <Wallet className="w-3 h-3" /> {message.approvalData.walletName}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--app-text-secondary)]">{t('ai.operation')}:</span>
                        <span className="font-medium text-[var(--app-text)]">{message.approvalData.operation}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--app-text-secondary)]">{t('ai.amount')}:</span>
                        <span className="font-medium text-[var(--app-text)]">{message.approvalData.amount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--app-text-secondary)]">{t('ai.target')}:</span>
                        <span className="font-medium text-[var(--app-text)] font-mono">{message.approvalData.target}</span>
                      </div>
                      <div className="border-t border-[var(--app-border)] pt-2 mt-2">
                        <span className="text-xs text-[var(--app-text-secondary)]">{t('ai.reason')}: </span>
                        <span className="text-xs text-amber-600">{message.approvalData.reasonKey ? t(message.approvalData.reasonKey) : message.approvalData.reason}</span>
                      </div>
                    </div>
                    {message.approvalData.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproval(message.id, 'approved')}
                          className="flex-1 bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                          {t('ai.approve')}
                        </button>
                        <button
                          onClick={() => handleApproval(message.id, 'rejected')}
                          className="flex-1 bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] hover:bg-[var(--app-hover-bg)] text-[var(--app-text)] font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" strokeWidth={1.5} />
                          {t('ai.reject')}
                        </button>
                      </div>
                    ) : (
                      <div className={`text-center py-2 px-4 rounded-lg ${
                        message.approvalData.status === 'approved'
                          ? 'bg-[var(--app-status-approved-bg)] text-[var(--app-status-approved-text)]'
                          : 'bg-[var(--app-status-rejected-bg)] text-[var(--app-status-rejected-text)]'
                      }`}>
                        <div className="flex items-center justify-center gap-2">
                          {message.approvalData.status === 'approved'
                            ? <><CheckCircle className="w-4 h-4" strokeWidth={1.5} /><span className="font-medium">{t('ai.approved')}</span></>
                            : <><XCircle className="w-4 h-4" strokeWidth={1.5} /><span className="font-medium">{t('ai.rejected')}</span></>
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`flex items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' ? (
                    <div className="bg-transparent text-[var(--app-text)] w-full min-w-0 overflow-hidden">
                      {!isGroupedWithPrev && renderAssistantHeader()}
                      <div className="whitespace-pre-wrap break-words text-[14px] leading-[22px] lg:text-[16px] lg:leading-[28px] lg:pl-[20px]">{message.content}</div>
                      {message.walletListData && wallets.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 lg:pl-[20px]">
                          {wallets.map((w) => {
                            const count = delegations.filter(d => d.walletId === w.id).length;
                            return (
                              <WalletCard
                                key={w.id}
                                wallet={w}
                                delegationCount={count}
                                onSelect={(walletId) => {
                                  selectWallet(walletId);
                                  onShowWalletPage();
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-[var(--app-user-message-bg)] text-[var(--app-text)] max-w-[85%] lg:max-w-[80%] rounded-[8px] px-4 py-[10px] lg:py-2">
                      <div className="whitespace-pre-wrap break-words text-[14px] leading-[22px] lg:text-[16px] lg:leading-[28px]">{message.content}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
          })}

          {combinedTyping && (
            <div className="flex items-start">
              <div className="px-1 py-3">
                <div className="flex space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-[var(--app-accent)] opacity-30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-[var(--app-accent)] opacity-30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-[var(--app-accent)] opacity-30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
          </div>
        </div>
        )}

        {/* Empty state — only when no messages AND onboarding not active */}
        {displayMessages.length === 0 && !combinedTyping && !onboarding.isOnboardingActive && (
          <div className="absolute inset-0 flex flex-col lg:flex-col z-0">
            {/* Welcome content — on mobile: centered above bottom input; on desktop: centered with offset */}
            <div className="flex-1 flex items-center justify-center px-4 md:px-6 lg:-mt-[15vh]">
              <div className="w-full max-w-[768px]">
                {!hasWallets && !welcomeType && <ChatWelcome variant="returning" />}
                {welcomeType === 'first-wallet' && <ChatWelcome variant="first-wallet" />}
                {hasWallets && !welcomeType && <ChatWelcome variant="returning" />}

                {/* Mobile only: prompt pills below welcome text */}
                {!welcomeType && (
                  <div className="lg:hidden flex flex-wrap gap-2 mt-4 justify-center max-w-[340px] mx-auto">
                    {!hasWallets && (
                      <button onClick={handleStartOnboarding} className="flex items-center gap-1.5 h-[36px] px-3.5 bg-[var(--app-suggestion-bg)] border border-transparent text-[var(--app-accent)] hover:bg-[var(--app-hover-accent-bg)] text-[13px] font-medium rounded-full transition-colors">
                        <span className="text-[13px]">✨</span>
                        {t('onboarding.suggestion.createWallet')}
                      </button>
                    )}
                    {(language === 'zh' ? [
                      { emoji: '🔧', label: '配置 Agent' },
                      { emoji: '🛡️', label: '设置限额' },
                      { emoji: '📋', label: '查看策略' },
                      { emoji: '⛽', label: 'Gas 管理' },
                    ] : [
                      { emoji: '🔧', label: 'Setup Agent' },
                      { emoji: '🛡️', label: 'Set limits' },
                      { emoji: '📋', label: 'View policies' },
                      { emoji: '⛽', label: 'Manage gas' },
                    ]).map((item, i) => (
                      <button key={item.label} onClick={() => handleSendDirect(item.label)} className="flex items-center gap-1.5 h-[36px] px-3 bg-transparent hover:bg-[var(--app-hover-accent-bg)] text-[13px] font-normal text-[var(--app-text-secondary)] rounded-full transition-colors border border-[var(--app-border-medium)]">
                        <span className="text-[13px]">{item.emoji}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Desktop only: input inline below welcome (original layout) */}
                <div className="hidden lg:block">
                  <div
                    className={welcomeType === 'first-wallet' ? 'animate-reveal-up' : ''}
                    style={welcomeType === 'first-wallet' ? { animationDelay: '1500ms', animationDuration: '500ms' } : {}}
                  >
                    <div className="bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] focus-within:border-[#1F32D6] focus-within:shadow-[0px_2px_12px_0px_rgba(31,50,214,0.08)] transition-all flex flex-col">
                      {inputExpanded && (
                        <textarea
                          ref={(el) => { if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length; } }}
                          value={inputValue}
                          onChange={(e) => {
                            setInputValue(e.target.value);
                            if (e.target.value === '') { shouldFocusInputRef.current = true; setInputExpanded(false); }
                          }}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                          placeholder={t('ai.inputPlaceholder')}
                          className="w-full bg-transparent px-[16px] py-3 text-[14px] leading-[22px] lg:text-[16px] lg:leading-[24px] text-[var(--app-text)] font-normal focus:outline-none resize-none chat-input-placeholder overflow-y-auto"
                          style={{ minHeight: '72px', maxHeight: '144px', height: '72px' }}
                          onInput={(e) => {
                            const el = e.currentTarget;
                            el.style.height = '72px';
                            el.style.height = Math.min(el.scrollHeight, 144) + 'px';
                          }}
                        />
                      )}
                      <div className={`flex items-center justify-between px-3 pb-3 ${!inputExpanded ? 'pt-3' : ''}`}>
                        <div className="flex items-center relative flex-1 min-w-0">
                          <div className="relative group shrink-0">
                            <button onClick={() => fileInputRef.current?.click()} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-[var(--app-text)] hover:bg-[var(--app-hover-accent-bg)] transition-colors">
                              <Plus className="w-[18px] h-[18px]" strokeWidth={1.5} />
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[8px] px-[6px] py-[4px] bg-[#0A0A0A] text-white text-[12px] leading-[16px] rounded-[6px] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                              添加图片/附件
                            </div>
                          </div>
                          {!inputExpanded && (
                            <input
                              ref={(el) => { if (el && shouldFocusInputRef.current) { el.focus(); shouldFocusInputRef.current = false; } }}
                              type="text"
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                              }}
                              onInput={(e) => {
                                const el = e.currentTarget;
                                if (el.scrollWidth > el.clientWidth) { setInputExpanded(true); }
                              }}
                              placeholder={t('ai.inputPlaceholder')}
                              className="flex-1 min-w-0 bg-transparent px-[8px] text-[14px] leading-[20px] lg:text-[16px] lg:leading-[24px] text-[var(--app-text)] font-normal focus:outline-none chat-input-placeholder"
                            />
                          )}
                        </div>
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isTyping}
                          className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] disabled:bg-[var(--app-hover-bg-dark)] disabled:cursor-not-allowed text-white transition-all shrink-0"
                        >
                          <ArrowUp className="w-[18px] h-[18px]" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                    {!welcomeType && (
                      <div className="flex flex-wrap gap-2 mt-[28px] justify-center max-w-[600px] mx-auto overflow-hidden max-h-[84px]">
                        {!hasWallets && (
                          <button onClick={handleStartOnboarding} className="flex items-center gap-1.5 h-[36px] px-4 bg-[var(--app-suggestion-bg)] border border-transparent text-[var(--app-accent)] hover:bg-[var(--app-hover-accent-bg)] text-sm font-medium rounded-full transition-colors">
                            <span className="text-[13px]">✨</span>
                            {t('onboarding.suggestion.createWallet')}
                          </button>
                        )}
                        {(language === 'zh' ? [
                          { emoji: '🔧', label: '配置 Agent' },
                          { emoji: '🛡️', label: '设置限额' },
                          { emoji: '📋', label: '查看策略' },
                          { emoji: '⛽', label: 'Gas 管理' },
                        ] : [
                          { emoji: '🔧', label: 'Setup Agent' },
                          { emoji: '🛡️', label: 'Set limits' },
                          { emoji: '📋', label: 'View policies' },
                          { emoji: '⛽', label: 'Manage gas' },
                        ]).map((item, i) => (
                          <button key={item.label} onClick={() => handleSendDirect(item.label)} className="flex items-center gap-1.5 h-[36px] px-4 bg-transparent hover:bg-[var(--app-hover-accent-bg)] text-sm font-normal text-[var(--app-text-secondary)] rounded-full transition-colors border border-[var(--app-border-medium)]">
                            <span className="text-[14px]">{item.emoji}</span>
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile only: Input + pills pinned to bottom */}
            <div
              className={`lg:hidden shrink-0 px-4 pb-4 flex justify-center ${welcomeType === 'first-wallet' ? 'animate-reveal-up' : ''}`}
              style={{
                paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
                ...(welcomeType === 'first-wallet' && { animationDelay: '1500ms', animationDuration: '500ms' }),
              }}
            >
              <div className="w-full max-w-[768px]">
                  <div className="bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] focus-within:border-[#1F32D6] focus-within:shadow-[0px_2px_12px_0px_rgba(31,50,214,0.08)] transition-all flex flex-col">
                    {inputExpanded && (
                      <textarea
                        ref={(el) => { if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length; } }}
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          if (e.target.value === '') { shouldFocusInputRef.current = true; setInputExpanded(false); }
                        }}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                        placeholder={t('ai.inputPlaceholder')}
                        className="w-full bg-transparent px-[16px] py-3 text-[14px] leading-[22px] lg:text-[16px] lg:leading-[24px] text-[var(--app-text)] font-normal focus:outline-none resize-none chat-input-placeholder overflow-y-auto"
                        style={{ minHeight: '72px', maxHeight: '144px', height: '72px' }}
                        onInput={(e) => {
                          const el = e.currentTarget;
                          el.style.height = '72px';
                          el.style.height = Math.min(el.scrollHeight, 144) + 'px';
                        }}
                      />
                    )}
                    <div className={`flex items-center justify-between px-3 pb-3 ${!inputExpanded ? 'pt-3' : ''}`}>
                      <div className="flex items-center relative flex-1 min-w-0">
                        <div className="relative group shrink-0">
                          <button onClick={() => fileInputRef.current?.click()} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-[var(--app-text)] hover:bg-[var(--app-hover-accent-bg)] transition-colors">
                            <Plus className="w-[18px] h-[18px]" strokeWidth={1.5} />
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[8px] px-[6px] py-[4px] bg-[#0A0A0A] text-white text-[12px] leading-[16px] rounded-[6px] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            添加图片/附件
                          </div>
                        </div>
                        {hasWallets && (
                          <div className="relative group shrink-0">
                            <button onClick={() => setShowWalletPicker(showWalletPicker === 'empty' ? null : 'empty')} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-[var(--app-text)] hover:bg-[#F8F9FC] transition-colors">
                              <AtSign className="w-[18px] h-[18px]" strokeWidth={2} />
                            </button>
                          </div>
                        )}
                        {showWalletPicker === 'empty' && (
                          <div ref={walletPickerRef} className="absolute bottom-full left-0 mb-2 bg-[var(--app-card-bg)] rounded-xl border border-[var(--app-border-medium)] shadow-lg py-1 z-50" style={{ minWidth: '200px' }}>
                            <div className="px-3 py-2 text-[12px] font-medium text-[var(--app-text-muted)]">{language === 'zh' ? '选择钱包' : 'Select Wallet'}</div>
                            {wallets.map(w => (
                              <button
                                key={w.id}
                                onClick={() => handleSelectWallet(w.name)}
                                className="w-full text-left px-3 py-2 text-[14px] text-[var(--app-text)] hover:bg-[var(--app-hover-bg)] transition-colors flex items-center gap-2"
                              >
                                <Wallet className="w-4 h-4 text-[#4f5eff]" strokeWidth={1.5} />
                                {w.name}
                              </button>
                            ))}
                          </div>
                        )}
                        {!inputExpanded && (
                          <input
                            ref={(el) => { if (el && shouldFocusInputRef.current) { el.focus(); shouldFocusInputRef.current = false; } }}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                            }}
                            onInput={(e) => {
                              const el = e.currentTarget;
                              if (el.scrollWidth > el.clientWidth) {
                                setInputExpanded(true);
                              }
                            }}
                            placeholder={t('ai.inputPlaceholder')}
                            className="flex-1 min-w-0 bg-transparent px-[8px] text-[14px] leading-[20px] lg:text-[16px] lg:leading-[24px] text-[var(--app-text)] font-normal focus:outline-none chat-input-placeholder"
                          />
                        )}
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] disabled:bg-[var(--app-hover-bg-dark)] disabled:cursor-not-allowed text-white transition-all shrink-0"
                      >
                        <ArrowUp className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                {/* Suggestions */}
                {!welcomeType && (
                  <div className="hidden lg:flex flex-wrap gap-[12px] mt-[24px] md:mt-[32px] justify-center">
                    {/* CTA suggestion for no-wallet users */}
                    {!hasWallets && (
                      <button
                        onClick={handleStartOnboarding}
                        className="w-fit px-[12px] py-[8px] md:px-[16px] md:py-[10px] rounded-[8px] bg-gradient-to-r from-[#1F32D6] to-[#4F5EFF] hover:from-[#1828AB] hover:to-[#3d4dd9] text-white text-[13px] md:text-[14px] leading-[20px] font-normal transition-all shadow-none hover:shadow-none flex items-center gap-1.5"
                      >
                        <Sparkles className="w-4 h-4" />
                        {t('onboarding.suggestion.createWallet')}
                      </button>
                    )}
                    {(language === 'zh' ? [
                      'Cobo Pact 能做什么？',
                      '第一次如何给钱包充值？',
                      '如何设置 Agent 的每日花费上限？',
                    ] : [
                      'Introduce Cobo Pact capabilities',
                      'How to make the first deposit',
                      'How to limit Agent daily spending',
                    ]).map((label) => (
                      <button
                        key={label}
                        onClick={() => handleSendDirect(label)}
                        className="w-fit px-[12px] py-[8px] md:px-[16px] md:py-[10px] rounded-[8px] border border-[var(--app-border-medium)] bg-[var(--app-card-bg)] hover:bg-[var(--app-hover-bg)] transition-all text-[13px] md:text-[14px] leading-[20px] font-normal text-[var(--app-text-muted)] text-left"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                </div>
            </div>
          </div>
        )}

        {/* Input area - shown when messages exist */}
        {(displayMessages.length > 0 || combinedTyping) && (
        <div className="bg-[var(--app-card-bg)] px-4 lg:px-6 pb-4 lg:pb-6 pt-2 flex justify-center shrink-0 sticky bottom-0 z-10" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <div className="w-full max-w-[768px]">
          <div className="bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-[8px] shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] focus-within:border-[#1F32D6] focus-within:shadow-[0px_2px_12px_0px_rgba(31,50,214,0.08)] transition-all flex flex-col">
            {inputExpanded && (
              <textarea
                ref={(el) => { if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length; } }}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (e.target.value === '') { shouldFocusInputRef.current = true; setInputExpanded(false); }
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder={t('ai.inputPlaceholder')}
                className="w-full bg-transparent px-[16px] py-3 text-[14px] leading-[22px] lg:text-[16px] lg:leading-[24px] text-[var(--app-text)] font-normal focus:outline-none resize-none chat-input-placeholder overflow-y-auto"
                style={{ minHeight: '72px', maxHeight: '144px', height: '72px' }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = '72px';
                  el.style.height = Math.min(el.scrollHeight, 144) + 'px';
                }}
              />
            )}
            <div className={`flex items-center justify-between px-3 pb-3 ${!inputExpanded ? 'pt-3' : ''}`}>
              <div className="flex items-center relative flex-1 min-w-0">
                <div className="relative group shrink-0">
                  <button onClick={() => fileInputRef.current?.click()} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-[var(--app-text)] hover:bg-[var(--app-hover-accent-bg)] transition-colors">
                    <Plus className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[8px] px-[6px] py-[4px] bg-[#0A0A0A] text-white text-[12px] leading-[16px] rounded-[6px] whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    添加图片/附件
                  </div>
                </div>
                {hasWallets && (
                  <div className="relative group shrink-0">
                    <button onClick={() => setShowWalletPicker(showWalletPicker === 'chat' ? null : 'chat')} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-[var(--app-text)] hover:bg-[#F8F9FC] transition-colors">
                      <AtSign className="w-[18px] h-[18px]" strokeWidth={2} />
                    </button>
                  </div>
                )}
                {showWalletPicker === 'chat' && (
                  <div ref={walletPickerRef} className="absolute bottom-full left-0 mb-2 bg-[var(--app-card-bg)] rounded-xl border border-[var(--app-border-medium)] shadow-lg py-1 z-50" style={{ minWidth: '200px' }}>
                    <div className="px-3 py-2 text-[12px] font-medium text-[var(--app-text-muted)]">{language === 'zh' ? '选择钱包' : 'Select Wallet'}</div>
                    {wallets.map(w => (
                      <button
                        key={w.id}
                        onClick={() => handleSelectWallet(w.name)}
                        className="w-full text-left px-3 py-2 text-[14px] text-[var(--app-text)] hover:bg-[var(--app-hover-bg)] transition-colors flex items-center gap-2"
                      >
                        <Wallet className="w-4 h-4 text-[#4f5eff]" strokeWidth={1.5} />
                        {w.name}
                      </button>
                    ))}
                  </div>
                )}
                {!inputExpanded && (
                  <input
                    ref={(el) => { if (el && shouldFocusInputRef.current) { el.focus(); shouldFocusInputRef.current = false; } }}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                    }}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      if (el.scrollWidth > el.clientWidth) {
                        setInputExpanded(true);
                      }
                    }}
                    placeholder={t('ai.inputPlaceholder')}
                    className="flex-1 min-w-0 bg-transparent px-[8px] text-[14px] leading-[20px] lg:text-[16px] lg:leading-[24px] text-[var(--app-text)] font-normal focus:outline-none chat-input-placeholder"
                  />
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] disabled:bg-[var(--app-hover-bg-dark)] disabled:cursor-not-allowed text-white transition-all shrink-0"
              >
                <ArrowUp className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <p className="text-center mt-2" style={{ fontSize: '11px', lineHeight: '14px', color: '#C0C0C0' }}>
            {language === 'zh' ? 'AI 钱包助手也可能会犯错，请仔细核对回答的内容。' : 'AI Wallet Assistant may make mistakes. Please verify the responses carefully.'}
          </p>
          </div>
        </div>
        )}
      </div>
      )}

      {/* Mobile history drawer backdrop */}
      {mobileHistoryOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/20 z-[55]" onClick={() => setMobileHistoryOpen(false)} />
      )}

      {/* Mobile history drawer */}
      <div className={`lg:hidden fixed top-0 right-0 h-screen w-[80vw] max-w-[320px] bg-[var(--app-card-bg)] z-[60] shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${mobileHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--app-border-medium)]">
          <span className="text-[16px] font-medium text-[var(--app-text)]">{language === 'zh' ? '对话历史' : 'Chat History'}</span>
          <button onClick={() => setMobileHistoryOpen(false)} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] hover:bg-[var(--app-hover-accent-bg)] transition-colors">
            <X className="w-[18px] h-[18px] text-[var(--app-text-secondary)]" strokeWidth={1.5} />
          </button>
        </div>
        {/* New Chat button */}
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={() => { handleNewChat(); setMobileHistoryOpen(false); }}
            className="w-full h-[40px] flex items-center justify-center gap-2 rounded-[8px] bg-[#0A0A0A] text-white text-[14px] font-medium transition-colors hover:bg-[#0A0A0A]"
          >
            <Plus className="w-[16px] h-[16px]" strokeWidth={1.5} />
            {language === 'zh' ? '新对话' : 'New Chat'}
          </button>
        </div>
        {/* Search */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 px-3 h-[36px] rounded-[8px] bg-[var(--app-bg)]">
            <Search className="w-[16px] h-[16px] text-[#999] shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'zh' ? '搜索...' : 'Search...'}
              className="flex-1 bg-transparent text-[14px] text-[var(--app-text)] placeholder-[#999] focus:outline-none"
            />
          </div>
        </div>
        {/* Quick nav — My Wallets & Approvals */}
        {hasWallets && (
          <div className="px-3 pb-2 flex gap-2">
            <button
              onClick={() => { onShowWalletPage(); setMobileHistoryOpen(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 h-[36px] rounded-[8px] text-[13px] font-medium transition-colors ${showWalletPage ? 'bg-[var(--app-hover-accent-bg)] text-[var(--app-text)]' : 'bg-[var(--app-bg)] text-[var(--app-text-secondary)] hover:bg-[var(--app-hover-accent-bg)]'}`}
            >
              <Wallet className="w-[16px] h-[16px]" strokeWidth={1.5} />
              {language === 'zh' ? '我的钱包' : 'My Wallets'}
            </button>
            <button
              onClick={() => { onShowApprovalPage(); setMobileHistoryOpen(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 h-[36px] rounded-[8px] text-[13px] font-medium transition-colors ${showApprovalPage ? 'bg-[var(--app-hover-accent-bg)] text-[var(--app-text)]' : 'bg-[var(--app-bg)] text-[var(--app-text-secondary)] hover:bg-[var(--app-hover-accent-bg)]'}`}
            >
              <ClipboardCheck className="w-[16px] h-[16px]" strokeWidth={1.5} />
              {language === 'zh' ? '交易审批' : 'Approvals'}
            </button>
          </div>
        )}
        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {filteredSessions.length === 0 && (
            <p className="text-center text-[13px] text-[#999] mt-6">{language === 'zh' ? '暂无对话' : 'No conversations'}</p>
          )}
          {filteredSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => handleSwitchSession(session)}
              className={`w-full text-left px-3 py-2.5 rounded-[8px] text-[14px] leading-[20px] truncate transition-colors ${activeChatId === session.id ? 'bg-[var(--app-hover-accent-bg)] text-[var(--app-text)]' : 'text-[var(--app-text)] hover:bg-[var(--app-hover-accent-bg)]'}`}
            >
              {session.title}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
