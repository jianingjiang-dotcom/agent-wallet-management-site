import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useOutletContext } from 'react-router';
import { ArrowUp, Plus, AtSign, AlertTriangle, CheckCircle, XCircle, Search, MoreHorizontal, Bot, Trash2, Sparkles, ArrowRight, Shield, Zap, Wallet, ChevronRight, SquarePen, PanelLeftClose, X, MessageCircle, ClipboardCheck, CircleDollarSign, ShieldCheck, Send, Fuel, Users, Link, FileText, Settings, Clock } from 'lucide-react';
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
  const { onClaimWallet, onOpenWalletModal, onShowWalletPage, onHideWalletPage, showWalletPage, onDelegateWallet, onShowApprovalPage, onHideApprovalPage, showApprovalPage } = useOutletContext<{
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
  }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string>('current');
  const [chatTitle, setChatTitle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchModalInputRef = useRef<HTMLInputElement>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [welcomeType, setWelcomeType] = useState<'first-wallet' | null>(null);
  const [approvalInitialTab, setApprovalInitialTab] = useState<'all' | 'pending'>('all');
  const pendingApprovalCount = 2; // TODO: derive from shared approval state
  const [sidebarPortal, setSidebarPortal] = useState<HTMLElement | null>(null);
  const [showWalletPicker, setShowWalletPicker] = useState<'empty' | 'chat' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const walletPickerRef = useRef<HTMLDivElement>(null);

  // Onboarding chat hook
  const onboarding = useOnboardingChat(!hasWallets);

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
    onLimitsConfirm: onboarding.handleLimitsConfirm,
    onCommandCopy: onboarding.handleCommandCopy,
    onCommandRefresh: onboarding.handleCommandRefresh,
    onComplete: () => {
      const result = onboarding.handleComplete();
      if (result) {
        addWalletWithAgent({
          walletId: result.walletId,
          agentId: result.agentId,
          policy: result.policy,
        });

        // Convert onboarding messages — mark success card as completed so button hides
        const onboardingMsgs: Message[] = onboarding.onboardingMessages.map(msg => ({
          ...msg,
          role: msg.onboardingData ? 'onboarding' as const : msg.role as Message['role'],
          onboardingData: msg.onboardingData?.step === 'success'
            ? { ...msg.onboardingData, status: 'completed' as const }
            : msg.onboardingData,
        }));

        // Add a welcome message after onboarding
        const welcomeMsg: Message = {
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: language === 'zh'
            ? '恭喜！你的 Agent Wallet 已经准备就绪 🎉\n\n现在你可以随时向我提问，例如：\n• 查看钱包状态和余额\n• 调整风控策略\n• 了解支持的功能\n\n有什么我可以帮你的吗？'
            : 'Congratulations! Your Agent Wallet is ready 🎉\n\nYou can now ask me anything, for example:\n• Check wallet status and balance\n• Adjust risk control policies\n• Learn about supported features\n\nHow can I help you?',
          timestamp: new Date(),
        };

        const allMsgs = [...onboardingMsgs, welcomeMsg];
        setMessages(allMsgs);

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
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
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
        { id: '3-1', role: 'user', content: language === 'zh' ? 'Agent Wallet 的转账权限怎么配置？' : 'How to configure transfer permissions?', timestamp: new Date(Date.now() - 172800000) },
        { id: '3-2', role: 'assistant', content: language === 'zh' ? 'Agent Wallet 提供了完善的权限管理系统，您可以按链、按代币设置转账限额。' : 'Agent Wallet provides a comprehensive permission system. You can set transfer limits by chain and token.', timestamp: new Date(Date.now() - 172790000) },
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
  ]);

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
    if (showWalletPage) onHideWalletPage();
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
      if (lowerMessage.includes('钱包状态') || lowerMessage.includes('支持的能力') || lowerMessage.includes('介绍一下我的钱包')) {
        return `您的 Agent Wallet 已成功创建并处于活跃状态，以下是当前钱包概览：

📊 钱包状态
• 状态：已激活 ✅
• 网络：Ethereum Sepolia (Testnet)
• 余额：0.00 USDC
• 钱包地址：0x7a3d...f82e

🔒 风控配置
• 单笔交易限额：$10
• 每日支出限额：$50

⚡ 支持的能力
1. 代币转账 — 支持 ETH、USDC 等主流代币的发送和接收
2. 智能合约调用 — 可通过 Agent 发起合约交互（需授权）
3. 余额查询 — 实时查看各代币余额和交易记录
4. 风控策略管理 — 灵活配置单笔/每日限额、白名单地址等
5. 多 Agent 委托 — 可将钱包权限委托给多个 AI Agent，分别设定操作范围
6. 交易审批 — 超出限额的交易会触发人工审批流程

如需充值测试代币或调整风控策略，随时告诉我！`;
      } else if (lowerMessage.includes('安装') || lowerMessage.includes('配置')) {
        return '关于 Agent 的安装和配置，您可以在"Agent 安装指南"页面找到详细的步骤说明。主要包括：1) 安装 SDK，2) 初始化配置，3) 设置 API 密钥。如果您在某个步骤遇到问题，请告诉我具体是哪一步。';
      } else if (lowerMessage.includes('安全') || lowerMessage.includes('风险') || lowerMessage.includes('风控')) {
        return '安全是我们最重视的部分。建议您启用以下安全功能：1) 双因素认证，2) 自动拦截可疑活动，3) 交易限额控制。您可以在"委托与策略"页面进行详细设置。需要我帮您详细解释某个功能吗？';
      } else if (lowerMessage.includes('余额') || lowerMessage.includes('转账')) {
        return '关于交易和转账，Agent Wallet 提供了完善的交易管理功能。所有交易都会经过多重验证和风控检查。如需查看交易历史或调整交易权限，我可以帮您导航到相应的页面。';
      } else {
        return '感谢您的提问。我会尽力帮助您。如果您需要更详细的技术支持，建议您查看我们的完整文档或联系技术支持团队。还有其他问题吗？';
      }
    } else {
      if (lowerMessage.includes('wallet status') || lowerMessage.includes('capabilities') || lowerMessage.includes('describe my wallet')) {
        return `Your Agent Wallet has been successfully created and is active. Here's an overview:

📊 Wallet Status
• Status: Active ✅
• Network: Ethereum Sepolia (Testnet)
• Balance: 0.00 USDC
• Address: 0x7a3d...f82e

🔒 Risk Controls
• Per-transaction limit: $10
• Daily spending limit: $50

⚡ Supported Capabilities
1. Token Transfers — Send and receive ETH, USDC, and other major tokens
2. Smart Contract Calls — Initiate contract interactions via Agent (requires authorization)
3. Balance Queries — Real-time token balances and transaction history
4. Risk Policy Management — Configure per-tx/daily limits, address whitelists, etc.
5. Multi-Agent Delegation — Delegate wallet permissions to multiple AI Agents with scoped access
6. Transaction Approval — Transactions exceeding limits trigger manual approval

Let me know if you'd like to fund test tokens or adjust risk policies!`;
      } else if (lowerMessage.includes('install') || lowerMessage.includes('setup')) {
        return 'For Agent installation and configuration, please visit the "Agent Installation" page for step-by-step instructions. The process includes: 1) Installing the SDK, 2) Initializing the configuration, 3) Setting up your API key.';
      } else if (lowerMessage.includes('security') || lowerMessage.includes('risk')) {
        return 'Security is our top priority. I recommend enabling: 1) Two-factor authentication, 2) Auto-block suspicious activities, 3) Transaction limits. You can configure these in "Delegation & Policy" page.';
      } else if (lowerMessage.includes('balance') || lowerMessage.includes('transfer')) {
        return 'Agent Wallet provides comprehensive transaction management. All transactions go through multiple verification and risk control checks. I can guide you to the relevant page if needed.';
      } else {
        return "Thank you for your question. I'll do my best to assist you. For more detailed technical support, please refer to our complete documentation. Is there anything else I can help with?";
      }
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || onboarding.isOnboardingActive) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    let currentSessionId = activeChatId;

    if (messages.length === 0) {
      const title = inputValue.length > 20 ? inputValue.slice(0, 20) + '...' : inputValue;
      setChatTitle(title);
      const newSessionId = 'new-' + Date.now();
      currentSessionId = newSessionId;
      setActiveChatId(newSessionId);
      setChatSessions((prev) => [
        { id: newSessionId, title, timestamp: new Date(), messages: [userMessage] },
        ...prev,
      ]);
    } else {
      setChatSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, userMessage] }
            : s
        )
      );
    }

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
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

  const handleNewChat = () => {
    setMessages([]);
    setActiveChatId('current');
    setWelcomeType(null);
    if (showWalletPage) onHideWalletPage();
    if (showApprovalPage) onHideApprovalPage();
  };

  // Start the onboarding flow
  const handleStartOnboarding = () => {
    onboarding.startOnboarding();
  };

  // Chat sessions sidebar content (portaled into DashboardLayout sidebar)
  const chatSessionsSidebar = (
    <>
      {/* Collapse sidebar button */}
      <div className="px-3 h-[64px] flex items-center justify-between">
        <button
          onClick={() => {
            const sidebar = document.querySelector('aside');
            if (sidebar) sidebar.classList.toggle('-translate-x-full');
          }}
          className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-[#EBEBEB] transition-colors text-[#73798B]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5h18"/><path d="M3 12h18"/><path d="M3 19h18"/></svg>
        </button>
        <button
          onClick={() => { setShowSearchModal(true); setSearchQuery(''); }}
          className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-[#EBEBEB] transition-colors text-[#73798B]"
        >
          <Search className="w-[20px] h-[20px]" strokeWidth={1.5} />
        </button>
      </div>

      {/* Action items */}
      <div className="px-2 pt-0 pb-[24px] flex flex-col">
        <button
          onClick={handleNewChat}
          className="w-full h-[44px] flex items-center gap-[8px] px-[12px] rounded-[8px] hover:bg-[#EBEBEB] transition-colors text-[#0A0A0A]"
        >
          <SquarePen className="w-[20px] h-[20px]" strokeWidth={1.5} />
          <span className="font-['Inter',sans-serif] text-[14px] leading-[20px] font-normal">{t('ai.newChat')}</span>
        </button>
        {hasWallets && (
          <>
            <button
              onClick={() => showWalletPage ? onHideWalletPage() : onShowWalletPage()}
              className={`w-full h-[44px] flex items-center gap-[8px] px-[12px] rounded-[8px] hover:bg-[#EBEBEB] transition-colors ${showWalletPage ? 'bg-[#EBEBEB] text-[#4f5eff]' : 'text-[#0A0A0A]'}`}
            >
              <Wallet className="w-[20px] h-[20px]" strokeWidth={1.5} />
              <span className="font-['Inter',sans-serif] text-[14px] leading-[20px] font-normal">{language === 'zh' ? '我的钱包' : 'My Wallets'}</span>
            </button>
            <button
              onClick={() => { if (showApprovalPage) { onHideApprovalPage(); } else { setApprovalInitialTab('all'); onShowApprovalPage(); } }}
              className={`w-full h-[44px] flex items-center gap-[8px] px-[12px] rounded-[8px] hover:bg-[#EBEBEB] transition-colors ${showApprovalPage ? 'bg-[#EBEBEB] text-[#4f5eff]' : 'text-[#0A0A0A]'}`}
            >
              <ClipboardCheck className="w-[20px] h-[20px]" strokeWidth={1.5} />
              <span className="font-['Inter',sans-serif] text-[14px] leading-[20px] font-normal">{language === 'zh' ? '操作审批' : 'Approvals'}</span>
              {pendingApprovalCount > 0 && (
                <span className="ml-auto px-[6px] py-[1px] text-[11px] font-semibold text-white bg-[#FF9500] rounded-full min-w-[18px] text-center leading-[16px]">
                  {pendingApprovalCount}
                </span>
              )}
            </button>
          </>
        )}
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="px-[12px] py-1.5">
          <span className="text-[14px] leading-[20px] font-normal text-[#B9BCC5]">
            {language === 'zh' ? '对话历史' : 'History'}
          </span>
        </div>
        {filteredSessions.map((session) => (
          <div key={session.id} className="relative group">
            <button
              onClick={() => handleSwitchSession(session)}
              className={`w-full text-left px-[12px] py-2 pr-8 rounded-[8px] text-[14px] leading-[20px] font-normal transition-colors truncate ${
                activeChatId === session.id
                  ? 'bg-[#EBEBEB] text-[#4f5eff]'
                  : 'text-slate-700 hover:bg-[#EBEBEB]'
              }`}
            >
              {session.title}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === session.id ? null : session.id); }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/60 transition-opacity ${
                activeChatId === session.id || menuOpenId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <MoreHorizontal style={{ width: '14px', height: '14px', color: '#4F4F4F' }} />
            </button>
            {menuOpenId === session.id && (
              <div ref={menuRef} className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-[#EBEBEB] py-1 z-50" style={{ minWidth: '120px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(session.id); setMenuOpenId(null); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-[#FAFAFA] flex items-center gap-2"
                >
                  <Trash2 style={{ width: '14px', height: '14px' }} />
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
    <div className="fixed inset-0 bg-black/30 flex items-start justify-center pt-[120px] z-[60]" onClick={() => setShowSearchModal(false)}>
      <div
        className="bg-white rounded-[16px] shadow-2xl w-[680px] max-h-[520px] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#EBEBEB]">
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
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] hover:bg-[#F5F5F5] transition-colors text-[#999]"
          >
            <X className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* New chat option */}
          <button
            onClick={() => { handleNewChat(); setShowSearchModal(false); }}
            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F5F5F5] transition-colors"
          >
            <SquarePen className="w-[20px] h-[20px] text-[#0A0A0A]" strokeWidth={1.5} />
            <span className="text-[15px] font-medium text-[#0A0A0A]">{language === 'zh' ? '新聊天' : 'New Chat'}</span>
          </button>

          {/* Grouped sessions */}
          {groupSessionsByDate(filteredSessions).map((group) => (
            <div key={group.label}>
              <div className="px-5 pt-4 pb-1.5">
                <span className="text-[12px] font-medium text-[#999]">{group.label}</span>
              </div>
              {group.sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => { handleSwitchSession(session); setShowSearchModal(false); }}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#F5F5F5] transition-colors"
                >
                  <MessageCircle className="w-[20px] h-[20px] text-[#999] shrink-0" strokeWidth={1.5} />
                  <span className="text-[15px] text-[#0A0A0A] truncate">{session.title}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  // Render a single message (shared between regular and onboarding messages)
  const renderAssistantHeader = () => (
    <div style={{ fontSize: '16px', lineHeight: '24px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#4f5eff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Bot style={{ width: '12px', height: '12px', color: 'white' }} />
      </div>
      <span style={{ fontWeight: 600 }}>Cobo<span style={{ color: '#4f5eff' }}>Agentic</span>Wallet</span>
    </div>
  );

  return (
    <>
      {/* Portal chat sessions into the layout sidebar */}
      {sidebarPortal && createPortal(chatSessionsSidebar, sidebarPortal)}

      {/* Search modal - rendered at top level via portal to body */}
      {showSearchModal && createPortal(searchModal, document.body)}

      {/* Delete confirmation dialog - rendered at top level */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-xl p-6 shadow-xl" style={{ maxWidth: '360px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <p className="text-base font-medium text-slate-900 mb-2">
              {language === 'zh' ? '确认删除' : 'Confirm Delete'}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {language === 'zh' ? '确定要删除这条对话历史吗？此操作不可撤销。' : 'Are you sure you want to delete this conversation? This action cannot be undone.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm text-slate-700 bg-[#FAFAFA] rounded-lg hover:bg-[#EBEBEB] transition-colors"
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

      {/* Pending approval notification banner — visible on all pages */}
      {hasWallets && pendingApprovalCount > 0 && !showApprovalPage && (
        <div className="w-full flex justify-center px-6 pt-4 bg-white">
          <button
            onClick={() => { setApprovalInitialTab('pending'); onShowApprovalPage(); }}
            className="w-full max-w-[768px] flex items-center justify-between px-4 py-3 rounded-xl bg-[#FFF8ED] border border-[#FFE4B5] hover:bg-[#FFF0D6] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF9500]/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#FF9500]" strokeWidth={2} />
              </div>
              <span className="text-[14px] text-[#0A0A0A]">
                {language === 'zh'
                  ? <>你有 <span className="font-semibold text-[#FF9500]">{pendingApprovalCount}</span> 条审批待处理</>
                  : <>You have <span className="font-semibold text-[#FF9500]">{pendingApprovalCount}</span> pending approval{pendingApprovalCount > 1 ? 's' : ''}</>}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-[#999] group-hover:text-[#FF9500] transition-colors" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Wallet page - shown when wallet sidebar item is active */}
      {showWalletPage && (
        <div className="flex-1 flex flex-col bg-white overflow-y-auto min-h-0">
          <div className="w-full max-w-[860px] mx-auto p-6 sm:p-10">
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
          <div className="w-full max-w-[860px] mx-auto p-6 sm:p-10">
            <ApprovalPage key={approvalInitialTab} initialTab={approvalInitialTab} />
          </div>
        </div>
      )}

      {/* Chat area - full height */}
      {!showWalletPage && !showApprovalPage && (
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative min-h-0">
        {/* Messages area */}
        {(displayMessages.length > 0 || combinedTyping) && (
        <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col items-center" style={{ gap: '24px', paddingTop: '32px' }}>
          <div className="w-full max-w-[744px] flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {displayMessages.map((message) => (
            <div key={message.id} className="animate-reveal-up" style={{ animationDuration: '400ms' }}>
              {/* Onboarding messages */}
              {message.role === 'onboarding' && message.onboardingData ? (
                <div className="flex items-start justify-start">
                  <div className="bg-transparent text-slate-900 w-full">
                    {renderAssistantHeader()}
                    <div className="whitespace-pre-wrap" style={{ fontSize: '16px', lineHeight: '24px' }}>
                      {message.content}
                    </div>
                    <OnboardingMessageRenderer
                      data={message.onboardingData}
                      callbacks={onboardingCallbacks}
                    />
                  </div>
                </div>
              ) : message.role === 'approval' && message.approvalData ? (
                <div className="flex justify-center">
                  <div className="bg-white border-2 border-yellow-300 rounded-xl p-4 w-full max-w-md shadow-sm">
                    <div className="flex items-center mb-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                      <h4 className="font-semibold text-slate-900">{t('ai.approvalRequest')}</h4>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('ai.operation')}:</span>
                        <span className="font-medium text-slate-900">{message.approvalData.operation}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('ai.amount')}:</span>
                        <span className="font-medium text-slate-900">{message.approvalData.amount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">{t('ai.target')}:</span>
                        <span className="font-medium text-slate-900 font-mono">{message.approvalData.target}</span>
                      </div>
                      <div className="border-t border-[#EBEBEB] pt-2 mt-2">
                        <span className="text-xs text-slate-500">{t('ai.reason')}: </span>
                        <span className="text-xs text-yellow-700">{message.approvalData.reason}</span>
                      </div>
                    </div>
                    {message.approvalData.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproval(message.id, 'approved')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {t('ai.approve')}
                        </button>
                        <button
                          onClick={() => handleApproval(message.id, 'rejected')}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
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
                            ? <><CheckCircle className="w-4 h-4" /><span className="font-medium">{t('ai.approved')}</span></>
                            : <><XCircle className="w-4 h-4" /><span className="font-medium">{t('ai.rejected')}</span></>
                          }
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={`flex items-start ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' ? (
                    <div className="bg-transparent text-slate-900 w-full">
                      {renderAssistantHeader()}
                      <div className="whitespace-pre-wrap" style={{ fontSize: '16px', lineHeight: '24px' }}>{message.content}</div>
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
                    <div className="bg-[#EBEBEB] text-slate-900 max-w-[80%] rounded-[10px] px-4 py-3">
                      <div className="whitespace-pre-wrap" style={{ fontSize: '16px', lineHeight: '24px' }}>{message.content}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {combinedTyping && (
            <div className="flex items-start">
              <div className="bg-white border border-[#EBEBEB] rounded-2xl px-4 py-3">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
          <div className="flex-1 flex items-center justify-center px-6" style={{ marginTop: '-160px' }}>
            <div className="w-full max-w-[768px]">

              {/* Scenario C: No wallet, no welcome — start onboarding in chat */}
              {!hasWallets && !welcomeType && (
                <>
                  <p style={{ fontSize: '36px', lineHeight: '46px', color: '#0A0A0A', marginBottom: '32px', textAlign: 'center' }}>
                    {language === 'zh' ? (
                      <>欢迎使用 Cobo<span style={{ color: '#4F5EFF' }}>Agentic</span>Wallet</>
                    ) : (
                      <>Welcome to Cobo<span style={{ color: '#4F5EFF' }}>Agentic</span>Wallet</>
                    )}
                  </p>

                  <div className="mb-6 relative overflow-hidden rounded-2xl border border-[rgba(79,94,255,0.15)] bg-gradient-to-r from-[#f8f8ff] via-[#f0f1ff] to-[#eef0ff] hover:from-[#f0f1ff] hover:via-[#e8eaff] hover:to-[#e4e7ff] transition-all duration-300 hover:shadow-[0px_8px_32px_0px_rgba(79,94,255,0.15)] hover:border-[rgba(79,94,255,0.25)] group">
                    <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[rgba(79,94,255,0.06)] group-hover:bg-[rgba(79,94,255,0.1)] transition-colors duration-300" />
                    <div className="absolute -right-2 -bottom-6 w-20 h-20 rounded-full bg-[rgba(79,94,255,0.04)] group-hover:bg-[rgba(79,94,255,0.08)] transition-colors duration-300" />

                    <button onClick={handleStartOnboarding} className="w-full text-left">
                      <div className="relative flex items-center gap-4 p-5">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#4f5eff] to-[#6c7aff] flex items-center justify-center shadow-[0px_4px_12px_0px_rgba(79,94,255,0.3)]">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-[15px] text-[#0A0A0A] mb-1">
                            {language === 'zh' ? '创建你的第一个 Agent Wallet' : 'Create Your First Agent Wallet'}
                          </div>
                          <div className="text-[13px] text-[#4F4F4F] leading-[18px]">
                            {language === 'zh'
                              ? '让 AI Agent 安全地管理链上资产，支持智能风控与多链操作'
                              : 'Let AI Agents securely manage on-chain assets with smart risk controls'}
                          </div>
                        </div>
                        <div className="shrink-0 w-8 h-8 rounded-full bg-white border border-[rgba(79,94,255,0.12)] flex items-center justify-center group-hover:bg-[#4f5eff] group-hover:border-[#4f5eff] transition-all duration-300">
                          <ArrowRight className="w-4 h-4 text-[#4f5eff] group-hover:text-white transition-colors duration-300" />
                        </div>
                      </div>
                      <div className="relative flex items-center gap-2 px-5 pb-3 -mt-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 border border-[rgba(79,94,255,0.08)] text-[11px] font-medium text-[#4f5eff]">
                          <Shield className="w-3 h-3" />
                          {language === 'zh' ? '安全风控' : 'Risk Control'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 border border-[rgba(79,94,255,0.08)] text-[11px] font-medium text-[#4f5eff]">
                          <Zap className="w-3 h-3" />
                          {language === 'zh' ? '多链支持' : 'Multi-Chain'}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 border border-[rgba(79,94,255,0.08)] text-[11px] font-medium text-[#4f5eff]">
                          <Bot className="w-3 h-3" />
                          {language === 'zh' ? 'Agent 委托' : 'Agent Delegation'}
                        </span>
                      </div>
                    </button>

                    <div className="relative border-t border-[rgba(79,94,255,0.1)] px-5 py-3 flex items-center justify-center">
                      <span className="text-[13px] text-[#4F4F4F]">
                        {language === 'zh' ? '已有钱包？' : 'Already have a wallet? '}
                      </span>
                      <button
                        onClick={onClaimWallet}
                        className="text-[13px] font-medium text-[#4f5eff] hover:text-[#3d4dd9] underline underline-offset-2 ml-1 transition-colors"
                      >
                        {language === 'zh' ? '认领钱包' : 'Claim Wallet'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Scenario A: First wallet just created */}
              {welcomeType === 'first-wallet' && (
                <ChatWelcome variant="first-wallet" />
              )}

              {/* Scenario B: Returning user, new chat */}
              {hasWallets && !welcomeType && (
                <ChatWelcome variant="returning" />
              )}

              {/* Input box for empty state */}
              <div
                className={welcomeType === 'first-wallet' ? 'animate-reveal-up' : ''}
                style={welcomeType === 'first-wallet'
                  ? { animationDelay: '1500ms', animationDuration: '500ms' }
                  : {}
                }
              >
                  <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)] flex flex-col">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                      placeholder={t('ai.inputPlaceholder')}
                      className="w-full bg-transparent p-3 text-[16px] leading-[24px] text-slate-900 focus:outline-none resize-none chat-input-placeholder overflow-y-auto"
                      style={{ minHeight: '72px', maxHeight: '144px', height: '72px' }}
                      onInput={(e) => { const el = e.currentTarget; el.style.height = '72px'; el.style.height = Math.min(el.scrollHeight, 144) + 'px'; }}
                    />
                    <div className="flex items-center justify-between px-3 pb-3">
                      <div className="flex items-center gap-1 relative">
                        <button onClick={() => fileInputRef.current?.click()} className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] text-slate-500 hover:bg-[#FAFAFA] transition-colors">
                          <Plus className="w-5 h-5" strokeWidth={1.5} />
                        </button>
                        {hasWallets && (
                          <button onClick={() => setShowWalletPicker(showWalletPicker === 'empty' ? null : 'empty')} className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] text-slate-500 hover:bg-[#FAFAFA] transition-colors">
                            <AtSign className="w-5 h-5" strokeWidth={1.5} />
                          </button>
                        )}
                        {showWalletPicker === 'empty' && (
                          <div ref={walletPickerRef} className="absolute bottom-full left-0 mb-2 bg-white rounded-xl border border-[#EBEBEB] shadow-lg py-1 z-50" style={{ minWidth: '200px' }}>
                            <div className="px-3 py-2 text-[12px] font-medium text-[#999]">{language === 'zh' ? '选择钱包' : 'Select Wallet'}</div>
                            {wallets.map(w => (
                              <button
                                key={w.id}
                                onClick={() => handleSelectWallet(w.name)}
                                className="w-full text-left px-3 py-2 text-[14px] text-[#0A0A0A] hover:bg-[#F5F5F5] transition-colors flex items-center gap-2"
                              >
                                <Wallet className="w-4 h-4 text-[#4f5eff]" strokeWidth={1.5} />
                                {w.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        className="w-[36px] h-[36px] flex items-center justify-center rounded-[10px] bg-[#4f5eff] hover:bg-[#3d4dd9] disabled:bg-slate-200 disabled:cursor-not-allowed text-white transition-all"
                      >
                        <ArrowUp className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                {/* Quick actions - only for returning users with wallets */}
                {hasWallets && !welcomeType && (
                  <div className="flex flex-wrap gap-[10px] mt-[32px] justify-center">
                    {(language === 'zh' ? [
                      { icon: CircleDollarSign, label: '查询钱包余额' },
                      { icon: ShieldCheck, label: '设置风控策略' },
                      { icon: Send, label: '发起一笔转账' },
                      { icon: Fuel, label: '查询 Gas 费用' },
                      { icon: Users, label: '配置 Agent 权限' },
                    ] : [
                      { icon: CircleDollarSign, label: 'Check Balance' },
                      { icon: ShieldCheck, label: 'Set Risk Policy' },
                      { icon: Send, label: 'Send Transfer' },
                      { icon: Fuel, label: 'Check Gas Fees' },
                      { icon: Users, label: 'Configure Agent' },
                    ]).map(({ icon: Icon, label }) => (
                      <button
                        key={label}
                        onClick={() => { setInputValue(label); }}
                        className="inline-flex items-center gap-[6px] px-[14px] py-[8px] rounded-full border border-[#E5E5E5] bg-white hover:bg-[#F5F5F5] hover:border-[#D0D0D0] transition-all text-[13px] text-[#4F4F4F] hover:text-[#0A0A0A]"
                      >
                        <Icon className="w-[14px] h-[14px] text-[#999]" strokeWidth={1.5} />
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
        <div className="bg-white px-6 pb-[8px] flex justify-center shrink-0 sticky bottom-0 z-10">
          <div className="w-full max-w-[744px]">
          <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)] flex flex-col">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder={t('ai.inputPlaceholder')}
              className="w-full bg-transparent p-3 text-[16px] leading-[24px] text-slate-900 focus:outline-none resize-none chat-input-placeholder overflow-y-auto"
                      style={{ minHeight: '72px', maxHeight: '144px', height: '72px' }}
                      onInput={(e) => { const el = e.currentTarget; el.style.height = '72px'; el.style.height = Math.min(el.scrollHeight, 144) + 'px'; }}
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <div className="flex items-center gap-1 relative">
                <button onClick={() => fileInputRef.current?.click()} className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] text-slate-500 hover:bg-[#FAFAFA] transition-colors">
                  <Plus className="w-5 h-5" strokeWidth={1.5} />
                </button>
                {hasWallets && (
                  <button onClick={() => setShowWalletPicker(showWalletPicker === 'chat' ? null : 'chat')} className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] text-slate-500 hover:bg-[#FAFAFA] transition-colors">
                    <AtSign className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                )}
                {showWalletPicker === 'chat' && (
                  <div ref={walletPickerRef} className="absolute bottom-full left-0 mb-2 bg-white rounded-xl border border-[#EBEBEB] shadow-lg py-1 z-50" style={{ minWidth: '200px' }}>
                    <div className="px-3 py-2 text-[12px] font-medium text-[#999]">{language === 'zh' ? '选择钱包' : 'Select Wallet'}</div>
                    {wallets.map(w => (
                      <button
                        key={w.id}
                        onClick={() => handleSelectWallet(w.name)}
                        className="w-full text-left px-3 py-2 text-[14px] text-[#0A0A0A] hover:bg-[#F5F5F5] transition-colors flex items-center gap-2"
                      >
                        <Wallet className="w-4 h-4 text-[#4f5eff]" strokeWidth={1.5} />
                        {w.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="w-[36px] h-[36px] flex items-center justify-center rounded-[10px] bg-[#4f5eff] hover:bg-[#3d4dd9] disabled:bg-slate-200 disabled:cursor-not-allowed text-white transition-all"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-center mt-2" style={{ fontSize: '12px', lineHeight: '16px', color: '#73798B' }}>
            {language === 'zh' ? 'AI 钱包助手也可能会犯错，请仔细核对回答的内容。' : 'AI Wallet Assistant may make mistakes. Please verify the responses carefully.'}
          </p>
          </div>
        </div>
        )}
      </div>
      )}
    </>
  );
}
