import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useOutletContext } from 'react-router';
import { ArrowUp, Plus, AtSign, AlertTriangle, CheckCircle, XCircle, Search, MoreHorizontal, Bot, Trash2, Sparkles, Wallet, ChevronRight, SquarePen, PanelLeftClose, X, MessageCircle, ClipboardCheck, Send, Users, Link, FileText, Settings, Clock, History } from 'lucide-react';
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
  const { onClaimWallet, onOpenWalletModal, onShowWalletPage, onHideWalletPage, showWalletPage, onDelegateWallet, onShowApprovalPage, onHideApprovalPage, showApprovalPage, sidebarCollapsed, demoApproval, setHasActiveChat } = useOutletContext<{
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
    if (startOnboarding === 'true' && !hasWallets && !onboarding.isOnboardingActive) {
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
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId && msg.approvalData
          ? { ...msg, approvalData: { ...msg.approvalData, status: action } }
          : msg
      )
    );
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
          onClick={handleNewChat}
          className={`h-[36px] flex items-center gap-[8px] px-[8px] rounded-[8px] transition-colors text-[#0A0A0A] overflow-hidden w-full ${sidebarCollapsed ? '' : 'hover:bg-[#EBEBEB]'}`}
          onMouseEnter={(e) => { if (sidebarCollapsed) { const rect = e.currentTarget.getBoundingClientRect(); setNavTooltip({ label: language === 'zh' ? '新对话' : 'New Chat', top: rect.top + rect.height / 2 }); } }}
          onMouseLeave={() => setNavTooltip(null)}
        >
          <div className={`shrink-0 flex items-center justify-center ${sidebarCollapsed ? 'w-[36px] h-[36px] -m-[8px] rounded-[8px] hover:bg-[#EBEBEB] transition-colors' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M9.99999 18.3333C14.6024 18.3333 18.3333 14.6023 18.3333 9.99996C18.3333 5.39759 14.6024 1.66663 9.99999 1.66663C5.39762 1.66663 1.66666 5.39759 1.66666 9.99996C1.66666 14.6023 5.39762 18.3333 9.99999 18.3333Z" fill="#0A0A0A" stroke="#0A0A0A" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.66666 10H13.3333" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 6.66663V13.3333" stroke="white" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span className={`text-[14px] leading-[20px] font-normal whitespace-nowrap transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>{t('ai.newChat')}</span>
        </button>
        <button
          onClick={() => { setShowSearchModal(true); setSearchQuery(''); }}
          className={`h-[36px] flex items-center gap-[8px] px-[8px] rounded-[8px] transition-colors text-[#0A0A0A] overflow-hidden w-full ${sidebarCollapsed ? '' : 'hover:bg-[#EBEBEB]'}`}
          onMouseEnter={(e) => { if (sidebarCollapsed) { const rect = e.currentTarget.getBoundingClientRect(); setNavTooltip({ label: language === 'zh' ? '搜索对话' : 'Search Chats', top: rect.top + rect.height / 2 }); } }}
          onMouseLeave={() => setNavTooltip(null)}
        >
          <div className={`shrink-0 flex items-center justify-center ${sidebarCollapsed ? 'w-[36px] h-[36px] -m-[8px] rounded-[8px] hover:bg-[#EBEBEB] transition-colors' : ''}`}>
            <Search className="w-[20px] h-[20px] shrink-0" strokeWidth={1.5} />
          </div>
          <span className={`text-[14px] leading-[20px] font-normal whitespace-nowrap transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>{language === 'zh' ? '搜索对话' : 'Search Chats'}</span>
        </button>
        {hasWallets && (
          <>
            <button
              onClick={() => { if (!showWalletPage) { onShowWalletPage(); setActiveChatId('current'); } }}
              className={`h-[36px] flex items-center gap-[8px] px-[8px] rounded-[8px] transition-colors overflow-hidden w-full ${sidebarCollapsed ? '' : 'hover:bg-[#EBEBEB]'} ${showWalletPage && !sidebarCollapsed ? 'bg-[#EBEBEB] text-[#0A0A0A]' : 'text-[#0A0A0A]'}`}
              onMouseEnter={(e) => { if (sidebarCollapsed) { const rect = e.currentTarget.getBoundingClientRect(); setNavTooltip({ label: language === 'zh' ? '我的钱包' : 'My Wallets', top: rect.top + rect.height / 2 }); } }}
              onMouseLeave={() => setNavTooltip(null)}
            >
              <div className={`shrink-0 flex items-center justify-center ${sidebarCollapsed ? 'w-[36px] h-[36px] -m-[8px] rounded-[8px] hover:bg-[#EBEBEB] transition-colors' : ''} ${showWalletPage && sidebarCollapsed ? 'bg-[#EBEBEB]' : ''}`}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0"><path d="M14.1667 11.6666H14.175" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.83333 5.83333H15.8333C16.2754 5.83333 16.6993 6.00893 17.0118 6.32149C17.3244 6.63405 17.5 7.05797 17.5 7.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H15.8333" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <span className={`text-[14px] leading-[20px] font-normal whitespace-nowrap transition-opacity duration-300 ease-in-out ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>{language === 'zh' ? '我的钱包' : 'My Wallets'}</span>
            </button>
            <button
              onClick={() => { if (!showApprovalPage) { setApprovalInitialTab('all'); onShowApprovalPage(); setActiveChatId('current'); } }}
              className={`h-[36px] flex items-center gap-[8px] px-[8px] rounded-[8px] transition-colors overflow-hidden w-full ${sidebarCollapsed ? '' : 'hover:bg-[#EBEBEB]'} ${showApprovalPage && !sidebarCollapsed ? 'bg-[#EBEBEB] text-[#0A0A0A]' : 'text-[#0A0A0A]'}`}
              onMouseEnter={(e) => { if (sidebarCollapsed) { const rect = e.currentTarget.getBoundingClientRect(); setNavTooltip({ label: language === 'zh' ? '交易审批' : 'Approvals', top: rect.top + rect.height / 2 }); } }}
              onMouseLeave={() => setNavTooltip(null)}
            >
              <div className={`shrink-0 flex items-center justify-center ${sidebarCollapsed ? 'w-[36px] h-[36px] -m-[8px] rounded-[8px] hover:bg-[#EBEBEB] transition-colors' : ''} ${showApprovalPage && sidebarCollapsed ? 'bg-[#EBEBEB]' : ''}`}>
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
            <span className="text-[12px] leading-[16px] font-normal text-[#7C7C7C]">
              {language === 'zh' ? '对话历史' : 'History'}
            </span>
          </div>
        )}
        {chatSessions.map((session) => (
          <div key={session.id} className={`relative group rounded-[8px] transition-colors ${activeChatId === session.id ? 'bg-[#EBEBEB]' : 'hover:bg-[#EBEBEB]'}`}>
            <button
              onClick={() => handleSwitchSession(session)}
              className={`w-full text-left px-[8px] py-[8px] pr-8 rounded-[8px] text-[14px] leading-[20px] font-normal truncate ${
                activeChatId === session.id
                  ? 'text-[#0A0A0A]'
                  : 'text-[#0A0A0A]'
              }`}
            >
              {session.title}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === session.id ? null : session.id); }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-opacity text-[#7C7C7C] hover:text-[#0A0A0A] ${
                activeChatId === session.id || menuOpenId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 10.8333C10.4602 10.8333 10.8333 10.4602 10.8333 9.99996C10.8333 9.53972 10.4602 9.16663 10 9.16663C9.53977 9.16663 9.16667 9.53972 9.16667 9.99996C9.16667 10.4602 9.53977 10.8333 10 10.8333Z" fill="currentColor" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M15.8333 10.8333C16.2936 10.8333 16.6667 10.4602 16.6667 9.99996C16.6667 9.53972 16.2936 9.16663 15.8333 9.16663C15.3731 9.16663 15 9.53972 15 9.99996C15 10.4602 15.3731 10.8333 15.8333 10.8333Z" fill="currentColor" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M4.16666 10.8333C4.6269 10.8333 4.99999 10.4602 4.99999 9.99996C4.99999 9.53972 4.6269 9.16663 4.16666 9.16663C3.70642 9.16663 3.33333 9.53972 3.33333 9.99996C3.33333 10.4602 3.70642 10.8333 4.16666 10.8333Z" fill="currentColor" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {menuOpenId === session.id && (
              <div ref={menuRef} className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-[#EBEBEB] py-1 z-50" style={{ minWidth: '120px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(session.id); setMenuOpenId(null); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-[#FAFAFA] flex items-center gap-2"
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
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]" onClick={() => setShowSearchModal(false)}>
      <div
        className="bg-white rounded-[16px] shadow-2xl w-[680px] h-[440px] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-[24px] py-[16px] border-b border-[#EBEBEB]">
          <Search className="w-[20px] h-[20px] text-[#999] shrink-0" strokeWidth={1.5} />
          <input
            ref={searchModalInputRef}
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'zh' ? '搜索聊天...' : 'Search chats...'}
            className="flex-1 text-[16px] bg-transparent text-[#0A0A0A] placeholder-[#999] focus:outline-none"
          />
          <button
            onClick={() => setShowSearchModal(false)}
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] hover:bg-[#FAFAFA] transition-colors text-[#999]"
          >
            <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto py-2">
          <div className="px-5 pt-2 pb-1">
            <span className="text-[12px] font-medium text-[#999]">{language === 'zh' ? '近期对话' : 'Recent Chats'}</span>
          </div>
          {/* All sessions flat list */}
          {filteredSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => { handleSwitchSession(session); setShowSearchModal(false); }}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#FAFAFA] transition-colors"
            >
              <MessageCircle className="w-[20px] h-[20px] text-[#999] shrink-0" strokeWidth={1.5} />
              <span className="text-[15px] text-[#0A0A0A] truncate">{session.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  // Render a single message (shared between regular and onboarding messages)
  const renderAssistantHeader = () => (
    <div style={{ fontSize: '14px', lineHeight: '20px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M13.0909 5.81818L12.1818 3.81818L10.1818 2.90909L12.1818 2L13.0909 0L14 2L16 2.90909L14 3.81818L13.0909 5.81818ZM13.0909 16L12.1818 14L10.1818 13.0909L12.1818 12.1818L13.0909 10.1818L14 12.1818L16 13.0909L14 14L13.0909 16ZM5.81818 13.8182L4 9.81818L0 8L4 6.18182L5.81818 2.18182L7.63636 6.18182L11.6364 8L7.63636 9.81818L5.81818 13.8182Z" fill="#1F32D6"/>
      </svg>
      <svg width="90" height="18" viewBox="0 0 280 58" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M86.4809 33.3248C86.485 43.2354 79.4301 51.7466 69.6867 53.5896C59.9404 55.4316 50.2619 50.0849 46.6433 40.8568L54.5068 32.9987V33.3248C54.4987 38.7434 58.3251 43.4116 63.6411 44.4749C68.9592 45.5372 74.2873 42.6967 76.3657 37.6923C78.4441 32.6878 76.693 26.9118 72.1846 23.9012C67.6753 20.8886 61.6671 21.48 57.8326 25.3128L35.2229 47.8885C29.3242 53.7871 20.4493 55.5531 12.7388 52.3633C5.02721 49.1715 0 41.6537 0 33.3157C0 24.9766 5.02721 17.4588 12.7388 14.268C20.4493 11.0782 29.3242 12.8432 35.2229 18.7429C36.3902 19.9205 36.8422 21.6299 36.4044 23.2288C35.9687 24.8288 34.7111 26.0743 33.108 26.4946C31.5029 26.9168 29.7954 26.452 28.628 25.2743C24.1946 20.8593 17.0191 20.8694 12.5969 25.2956C8.17263 29.7208 8.17263 36.8913 12.5969 41.3155C17.0191 45.7427 24.1946 45.7518 28.628 41.3368L51.2195 18.7429C57.1202 12.8422 65.9972 11.0762 73.7087 14.269C81.4203 17.4609 86.4465 24.9827 86.4424 33.3248H86.4809ZM176 33.3248C176.027 43.2547 168.967 51.7942 159.205 53.6393C149.439 55.4833 139.746 50.1123 136.144 40.8568L144.008 32.9987V33.3248C144.017 38.7242 147.841 43.3641 153.14 44.4071C158.441 45.4521 163.741 42.6107 165.801 37.6214C167.861 32.6291 166.107 26.8804 161.611 23.8881C157.114 20.8947 151.129 21.4911 147.314 25.3128L124.819 47.8115C118.937 53.7547 110.049 55.5622 102.312 52.3866C94.5755 49.212 89.523 41.6831 89.5189 33.3248V4.35129C89.676 1.90375 91.7088 0 94.1621 0C96.6154 0 98.6482 1.90375 98.8052 4.35129V16.0908C104.513 12.3309 111.716 11.6433 118.034 14.2579C124.351 16.8705 128.958 22.444 130.336 29.1365L140.759 18.7236C146.66 12.8362 155.528 11.0802 163.232 14.269C170.934 17.4609 175.958 24.9726 175.962 33.3056L176 33.3248ZM121.512 33.3248C121.512 28.7386 118.745 24.604 114.506 22.8501C110.264 21.0982 105.383 22.0704 102.141 25.3169C98.8974 28.5624 97.9327 33.4402 99.6939 37.6771C101.455 41.9109 105.599 44.6683 110.188 44.6602C116.446 44.6491 121.512 39.5788 121.512 33.3248Z" fill="#1F32D6"/>
        <path d="M209.952 28.884C209.952 30.0147 209.685 31.0813 209.152 32.084C208.619 33.0867 207.765 33.908 206.592 34.548C205.419 35.1667 203.915 35.476 202.08 35.476H198.048V44.5H194.4V22.26H202.08C203.787 22.26 205.227 22.5587 206.4 23.156C207.595 23.732 208.48 24.5213 209.056 25.524C209.653 26.5267 209.952 27.6467 209.952 28.884ZM202.08 32.5C203.467 32.5 204.501 32.1907 205.184 31.572C205.867 30.932 206.208 30.036 206.208 28.884C206.208 26.452 204.832 25.236 202.08 25.236H198.048V32.5H202.08ZM227.799 39.956H218.487L216.887 44.5H213.079L221.047 22.228H225.271L233.239 44.5H229.399L227.799 39.956ZM226.775 36.98L223.159 26.644L219.511 36.98H226.775ZM236.448 33.332C236.448 31.156 236.949 29.204 237.952 27.476C238.976 25.748 240.352 24.404 242.08 23.444C243.829 22.4627 245.738 21.972 247.808 21.972C250.176 21.972 252.277 22.5587 254.112 23.732C255.968 24.884 257.312 26.5267 258.144 28.66H253.76C253.184 27.4867 252.384 26.612 251.36 26.036C250.336 25.46 249.152 25.172 247.808 25.172C246.336 25.172 245.024 25.5027 243.872 26.164C242.72 26.8253 241.813 27.7747 241.152 29.012C240.512 30.2493 240.192 31.6893 240.192 33.332C240.192 34.9747 240.512 36.4147 241.152 37.652C241.813 38.8893 242.72 39.8493 243.872 40.532C245.024 41.1933 246.336 41.524 247.808 41.524C249.152 41.524 250.336 41.236 251.36 40.66C252.384 40.084 253.184 39.2093 253.76 38.036H258.144C257.312 40.1693 255.968 41.812 254.112 42.964C252.277 44.116 250.176 44.692 247.808 44.692C245.717 44.692 243.808 44.212 242.08 43.252C240.352 42.2707 238.976 40.916 237.952 39.188C236.949 37.46 236.448 35.508 236.448 33.332ZM277.742 22.26V25.236H271.822V44.5H268.174V25.236H262.222V22.26H277.742Z" fill="#0A0A0A"/>
      </svg>
    </div>
  );

  return (
    <>
      {/* Portal chat sessions into the layout sidebar */}
      {sidebarPortal && createPortal(chatSessionsSidebar, sidebarPortal)}

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
          <div className="bg-white rounded-xl p-6 shadow-xl" style={{ maxWidth: '360px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <p className="text-base font-medium text-[#0A0A0A] mb-2">
              {language === 'zh' ? '删除对话历史？' : 'Delete conversation history?'}
            </p>
            <p className="text-sm text-[#7C7C7C] mb-6">
              {language === 'zh' ? '确定要删除这条对话历史吗？此操作不可撤销。' : 'Are you sure you want to delete this conversation? This action cannot be undone.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm text-[#4F4F4F] bg-[#FAFAFA] rounded-lg hover:bg-[#EBEBEB] transition-colors"
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
        <div className="flex-1 flex flex-col bg-white overflow-y-auto min-h-0 relative">
          {/* Floating approval notification banner */}
          {demoApproval && hasWallets && pendingApprovalCount > 0 && !approvalBannerDismissed && (
            <div className="absolute top-0 left-0 right-0 z-10 flex justify-center px-6 pt-[24px] pointer-events-none">
              <div className="w-full max-w-[768px] flex items-center justify-between px-4 py-3 rounded-xl bg-[#FEF1E8] pointer-events-auto">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6667 10.8333C16.6667 15 13.75 17.0833 10.2833 18.2916C10.1018 18.3532 9.90461 18.3502 9.72499 18.2833C6.24999 17.0833 3.33333 15 3.33333 10.8333V4.99997C3.33333 4.77895 3.42113 4.56699 3.57741 4.41071C3.73369 4.25443 3.94565 4.16663 4.16666 4.16663C5.83333 4.16663 7.91666 3.16663 9.36666 1.89997C9.54321 1.74913 9.76779 1.66626 9.99999 1.66626C10.2322 1.66626 10.4568 1.74913 10.6333 1.89997C12.0917 3.17497 14.1667 4.16663 15.8333 4.16663C16.0543 4.16663 16.2663 4.25443 16.4226 4.41071C16.5789 4.56699 16.6667 4.77895 16.6667 4.99997V10.8333Z" stroke="#F97316" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 9.99992L9.16667 11.6666L12.5 8.33325" stroke="#F97316" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span className="text-[14px] leading-[20px] text-[#0A0A0A] font-normal">
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
              onSetupWallet={() => { onHideWalletPage(); }}
              onClaimWallet={onClaimWallet}
              onDelegateWallet={onDelegateWallet}
            />
          </div>
        </div>
      )}

      {/* Approval page - shown when approval sidebar item is active */}
      {showApprovalPage && (
        <div className="flex-1 flex flex-col bg-white overflow-y-auto min-h-0">
          <div className="w-full max-w-[864px] mx-auto px-[24px] py-[92px]">
            <ApprovalPage key={approvalInitialTab} initialTab={approvalInitialTab} onPendingCountChange={setPendingApprovalCount} />
          </div>
        </div>
      )}

      {/* Chat area - full height */}
      {!showWalletPage && !showApprovalPage && (
      <div className="flex-1 flex flex-col bg-white overflow-hidden min-h-0">
        {/* Floating approval notification banner */}
        {demoApproval && hasWallets && pendingApprovalCount > 0 && !approvalBannerDismissed && (
          <div className="absolute top-0 left-0 right-0 z-10 flex justify-center px-6 pt-[24px] pointer-events-none">
            <div className="w-full max-w-[768px] flex items-center justify-between px-4 py-3 rounded-xl bg-[#FEF1E8] pointer-events-auto">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6667 10.8333C16.6667 15 13.75 17.0833 10.2833 18.2916C10.1018 18.3532 9.90461 18.3502 9.72499 18.2833C6.24999 17.0833 3.33333 15 3.33333 10.8333V4.99997C3.33333 4.77895 3.42113 4.56699 3.57741 4.41071C3.73369 4.25443 3.94565 4.16663 4.16666 4.16663C5.83333 4.16663 7.91666 3.16663 9.36666 1.89997C9.54321 1.74913 9.76779 1.66626 9.99999 1.66626C10.2322 1.66626 10.4568 1.74913 10.6333 1.89997C12.0917 3.17497 14.1667 4.16663 15.8333 4.16663C16.0543 4.16663 16.2663 4.25443 16.4226 4.41071C16.5789 4.56699 16.6667 4.77895 16.6667 4.99997V10.8333Z" stroke="#F97316" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 9.99992L9.16667 11.6666L12.5 8.33325" stroke="#F97316" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="text-[14px] leading-[20px] text-[#0A0A0A] font-normal">
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
          <div className="w-full max-w-[744px] flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {displayMessages.map((message, msgIndex) => {
            // Check if this non-user message should be grouped with the previous one (skip header)
            const prevMsg = msgIndex > 0 ? displayMessages[msgIndex - 1] : null;
            const isGroupedWithPrev = message.role !== 'user' && prevMsg !== null && prevMsg.role !== 'user';

            return (
            <div key={message.id} className="animate-reveal-up" style={{ animationDuration: '400ms', ...(isGroupedWithPrev ? { marginTop: '-8px' } : {}) }}>
              {/* Onboarding messages */}
              {message.role === 'onboarding' && message.onboardingData ? (
                <div className="flex items-start justify-start">
                  <div className="bg-transparent text-[#0A0A0A] w-full min-w-0 overflow-hidden">
                    {!isGroupedWithPrev && renderAssistantHeader()}
                    {message.content && (
                      <div className="whitespace-pre-wrap break-words" style={{ fontSize: '15px', lineHeight: '25px' }}>
                        {message.content}
                      </div>
                    )}
                    <OnboardingMessageRenderer
                      data={message.onboardingData}
                      callbacks={onboardingCallbacks}
                    />
                    {/* Post-success suggestions — show after setup-command card when pairing is done */}
                    {message.onboardingData.step === 'setup-command' && message.onboardingData.payload?.pairingPhase === 'done' && (
                      <div className="flex flex-wrap gap-[10px] mt-4 justify-center">
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
                            className="w-fit px-[16px] py-[10px] rounded-[12px] border border-[#EBEBEB] bg-white hover:bg-[#FAFAFA] transition-all text-[14px] leading-[20px] font-normal text-[#0A0A0A]"
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
                  <div className="bg-white border-2 border-yellow-300 rounded-xl p-4 w-full max-w-md shadow-sm">
                    <div className="flex items-center mb-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" strokeWidth={1.5} />
                      <h4 className="font-semibold text-[#0A0A0A]">{t('ai.approvalRequest')}</h4>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7C7C7C]">{t('ai.operation')}:</span>
                        <span className="font-medium text-[#0A0A0A]">{message.approvalData.operation}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7C7C7C]">{t('ai.amount')}:</span>
                        <span className="font-medium text-[#0A0A0A]">{message.approvalData.amount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#7C7C7C]">{t('ai.target')}:</span>
                        <span className="font-medium text-[#0A0A0A] font-mono">{message.approvalData.target}</span>
                      </div>
                      <div className="border-t border-[#EBEBEB] pt-2 mt-2">
                        <span className="text-xs text-[#7C7C7C]">{t('ai.reason')}: </span>
                        <span className="text-xs text-yellow-700">{message.approvalData.reason}</span>
                      </div>
                    </div>
                    {message.approvalData.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproval(message.id, 'approved')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                          {t('ai.approve')}
                        </button>
                        <button
                          onClick={() => handleApproval(message.id, 'rejected')}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" strokeWidth={1.5} />
                          {t('ai.reject')}
                        </button>
                      </div>
                    ) : (
                      <div className={`text-center py-2 px-4 rounded-lg ${
                        message.approvalData.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
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
                    <div className="bg-transparent text-[#0A0A0A] w-full min-w-0 overflow-hidden">
                      {!isGroupedWithPrev && renderAssistantHeader()}
                      <div className="whitespace-pre-wrap break-words text-[14px] leading-[22px] lg:text-[14px] lg:leading-[22px]">{message.content}</div>
                      {message.walletListData && wallets.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <div className="bg-[#F1F3FF] text-[#0A0A0A] max-w-[85%] lg:max-w-[80%] rounded-[18px] lg:rounded-[12px] px-4 py-3">
                      <div className="whitespace-pre-wrap break-words text-[14px] leading-[22px] lg:text-[14px] lg:leading-[22px]">{message.content}</div>
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
                  <div className="w-1.5 h-1.5 bg-[#1F32D6]/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#1F32D6]/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#1F32D6]/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                      <button onClick={handleStartOnboarding} className="flex items-center gap-1.5 h-[36px] px-3.5 bg-[#EEF0FF] border border-transparent text-[#1F32D6] hover:bg-[#E2E5FF] text-[13px] font-medium rounded-full transition-colors">
                        <span className="text-[13px]">✨</span>
                        {t('onboarding.suggestion.createWallet')}
                      </button>
                    )}
                    {(language === 'zh' ? [
                      { emoji: '\uD83D\uDCE6', label: '安装 Agent' },
                      { emoji: '\uD83D\uDD12', label: '安全策略' },
                      { emoji: '\uD83D\uDCB3', label: '转账权限' },
                      { emoji: '\u26FD', label: 'Gas 优化' },
                    ] : [
                      { emoji: '\uD83D\uDCE6', label: 'Install Agent' },
                      { emoji: '\uD83D\uDD12', label: 'Security' },
                      { emoji: '\uD83D\uDCB3', label: 'Permissions' },
                      { emoji: '\u26FD', label: 'Gas fees' },
                    ]).map((item) => (
                      <button key={item.label} onClick={() => handleSendDirect(item.label)} className="flex items-center gap-1.5 h-[36px] px-3 bg-transparent hover:bg-[#FAFAFA] text-[13px] font-normal text-[#7C7C7C] rounded-full transition-colors border border-[#EBEBEB]">
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
                    <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] focus-within:border-[#1F32D6] focus-within:shadow-[0px_2px_12px_0px_rgba(31,50,214,0.08)] transition-all flex flex-col">
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
                          className="w-full bg-transparent px-[16px] py-3 text-[15px] leading-[22px] text-[#0A0A0A] font-normal focus:outline-none resize-none chat-input-placeholder overflow-y-auto"
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
                            <button onClick={() => fileInputRef.current?.click()} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-[#0A0A0A] hover:bg-[#FAFAFA] transition-colors">
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
                              className="flex-1 min-w-0 bg-transparent px-[8px] text-[14px] leading-[20px] text-[#0A0A0A] font-normal focus:outline-none chat-input-placeholder"
                            />
                          )}
                        </div>
                        <button
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isTyping}
                          className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] bg-[#1F32D6] hover:bg-[#1828AB] disabled:bg-[#EBEBEB] disabled:cursor-not-allowed text-white transition-all shrink-0"
                        >
                          <ArrowUp className="w-[18px] h-[18px]" strokeWidth={1.5} />
                        </button>
                      </div>
                    </div>
                    {!welcomeType && (
                      <div className="flex flex-wrap gap-2 mt-[28px] justify-center max-w-[600px] mx-auto overflow-hidden max-h-[84px]">
                        {!hasWallets && (
                          <button onClick={handleStartOnboarding} className="flex items-center gap-1.5 h-[36px] px-4 bg-[#EEF0FF] border border-transparent text-[#1F32D6] hover:bg-[#E2E5FF] text-sm font-medium rounded-full transition-colors">
                            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                            {t('onboarding.suggestion.createWallet')}
                          </button>
                        )}
                        {(language === 'zh' ? [
                          { emoji: '\uD83D\uDCE6', label: '安装 Agent' },
                          { emoji: '\uD83D\uDD12', label: '安全策略' },
                          { emoji: '\uD83D\uDCB3', label: '转账权限' },
                          { emoji: '\u26FD', label: 'Gas 优化' },
                        ] : [
                          { emoji: '\uD83D\uDCE6', label: 'Install Agent' },
                          { emoji: '\uD83D\uDD12', label: 'Security' },
                          { emoji: '\uD83D\uDCB3', label: 'Permissions' },
                          { emoji: '\u26FD', label: 'Gas fees' },
                        ]).map((item) => (
                          <button key={item.label} onClick={() => handleSendDirect(item.label)} className="flex items-center gap-1.5 h-[36px] px-4 bg-transparent hover:bg-[#FAFAFA] text-sm font-normal text-[#7C7C7C] rounded-full transition-colors border border-[#EBEBEB]">
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
                  <div className="bg-white border border-[#EBEBEB] rounded-[18px] lg:rounded-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] focus-within:border-[#1F32D6] focus-within:shadow-[0px_2px_12px_0px_rgba(31,50,214,0.08)] transition-all flex flex-col">
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
                        className="w-full bg-transparent px-[16px] py-3 text-[15px] leading-[22px] text-[#0A0A0A] font-normal focus:outline-none resize-none chat-input-placeholder overflow-y-auto"
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
                          <button onClick={() => fileInputRef.current?.click()} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-[#0A0A0A] hover:bg-[#FAFAFA] transition-colors">
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
                              if (el.scrollWidth > el.clientWidth) {
                                setInputExpanded(true);
                              }
                            }}
                            placeholder={t('ai.inputPlaceholder')}
                            className="flex-1 min-w-0 bg-transparent px-[8px] text-[14px] leading-[20px] text-[#0A0A0A] font-normal focus:outline-none chat-input-placeholder"
                          />
                        )}
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] bg-[#1F32D6] hover:bg-[#1828AB] disabled:bg-[#EBEBEB] disabled:cursor-not-allowed text-white transition-all shrink-0"
                      >
                        <ArrowUp className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

              </div>
            </div>
          </div>
        )}

        {/* Input area - shown when messages exist */}
        {(displayMessages.length > 0 || combinedTyping) && (
        <div className="bg-white px-4 lg:px-6 pb-4 lg:pb-6 pt-2 flex justify-center shrink-0 sticky bottom-0 z-10" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <div className="w-full max-w-[744px]">
          <div className="bg-white border border-[#EBEBEB] rounded-[18px] lg:rounded-xl shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] focus-within:border-[#1F32D6] focus-within:shadow-[0px_2px_12px_0px_rgba(31,50,214,0.08)] transition-all flex flex-col">
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
                className="w-full bg-transparent px-[16px] py-3 text-[15px] leading-[22px] text-[#0A0A0A] font-normal focus:outline-none resize-none chat-input-placeholder overflow-y-auto"
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
                  <button onClick={() => fileInputRef.current?.click()} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-[#0A0A0A] hover:bg-[#FAFAFA] transition-colors">
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
                      if (el.scrollWidth > el.clientWidth) {
                        setInputExpanded(true);
                      }
                    }}
                    placeholder={t('ai.inputPlaceholder')}
                    className="flex-1 min-w-0 bg-transparent px-[8px] text-[14px] leading-[20px] text-[#0A0A0A] font-normal focus:outline-none chat-input-placeholder"
                  />
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] bg-[#1F32D6] hover:bg-[#1828AB] disabled:bg-[#EBEBEB] disabled:cursor-not-allowed text-white transition-all shrink-0"
              >
                <ArrowUp className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <p className="text-center mt-2" style={{ fontSize: '12px', lineHeight: '16px', color: '#7C7C7C' }}>
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
      <div className={`lg:hidden fixed top-0 right-0 h-screen w-[80vw] max-w-[320px] bg-white z-[60] shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${mobileHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#EBEBEB]">
          <span className="text-[16px] font-medium text-[#0A0A0A]">{language === 'zh' ? '对话历史' : 'Chat History'}</span>
          <button onClick={() => setMobileHistoryOpen(false)} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] hover:bg-[#FAFAFA] transition-colors">
            <X className="w-[18px] h-[18px] text-[#7C7C7C]" strokeWidth={1.5} />
          </button>
        </div>
        {/* New Chat button */}
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={() => { handleNewChat(); setMobileHistoryOpen(false); }}
            className="w-full h-[40px] flex items-center justify-center gap-2 rounded-[10px] bg-[#0A0A0A] text-white text-[14px] font-medium transition-colors hover:bg-[#0A0A0A]"
          >
            <Plus className="w-[16px] h-[16px]" strokeWidth={1.5} />
            {language === 'zh' ? '新对话' : 'New Chat'}
          </button>
        </div>
        {/* Search */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 px-3 h-[36px] rounded-[8px] bg-[#FAFAFA]">
            <Search className="w-[16px] h-[16px] text-[#999] shrink-0" strokeWidth={1.5} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'zh' ? '搜索...' : 'Search...'}
              className="flex-1 bg-transparent text-[14px] text-[#0A0A0A] placeholder-[#999] focus:outline-none"
            />
          </div>
        </div>
        {/* Quick nav — My Wallets & Approvals */}
        {hasWallets && (
          <div className="px-3 pb-2 flex gap-2">
            <button
              onClick={() => { onShowWalletPage(); setMobileHistoryOpen(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 h-[36px] rounded-[8px] text-[13px] font-medium transition-colors ${showWalletPage ? 'bg-[#EBEBEB] text-[#0A0A0A]' : 'bg-[#FAFAFA] text-[#7C7C7C] hover:bg-[#EBEBEB]'}`}
            >
              <Wallet className="w-[14px] h-[14px]" strokeWidth={1.5} />
              {language === 'zh' ? '我的钱包' : 'My Wallets'}
            </button>
            <button
              onClick={() => { onShowApprovalPage(); setMobileHistoryOpen(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 h-[36px] rounded-[8px] text-[13px] font-medium transition-colors ${showApprovalPage ? 'bg-[#EBEBEB] text-[#0A0A0A]' : 'bg-[#FAFAFA] text-[#7C7C7C] hover:bg-[#EBEBEB]'}`}
            >
              <ClipboardCheck className="w-[14px] h-[14px]" strokeWidth={1.5} />
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
              className={`w-full text-left px-3 py-2.5 rounded-[8px] text-[14px] leading-[20px] truncate transition-colors ${activeChatId === session.id ? 'bg-[#EBEBEB] text-[#0A0A0A]' : 'text-[#0A0A0A] hover:bg-[#FAFAFA]'}`}
            >
              {session.title}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
