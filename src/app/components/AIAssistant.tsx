import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useOutletContext } from 'react-router';
import { Send, Plus, AlertTriangle, CheckCircle, XCircle, Search, MoreHorizontal, Bot, Trash2, Sparkles, ArrowRight, Shield, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useWalletStore } from '../hooks/useWalletStore';
import { useOnboardingChat } from '../hooks/useOnboardingChat';
import ChatWelcome from './ChatWelcome';
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
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

export default function AIAssistant() {
  const { t, language } = useLanguage();
  const { hasWallets, addWalletWithAgent } = useWalletStore();
  const { onClaimWallet } = useOutletContext<{ onSetupWallet: () => void; onClaimWallet: () => void }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string>('current');
  const [chatTitle, setChatTitle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [welcomeType, setWelcomeType] = useState<'first-wallet' | null>(null);
  const [sidebarPortal, setSidebarPortal] = useState<HTMLElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
      // Preserve onboarding messages into the current chat session
      const onboardingMsgs: Message[] = onboarding.onboardingMessages.map(msg => ({
        ...msg,
        role: msg.onboardingData ? 'onboarding' as const : msg.role as Message['role'],
      }));

      const result = onboarding.handleComplete();
      if (result) {
        addWalletWithAgent({
          walletId: result.walletId,
          agentId: result.agentId,
          policy: result.policy,
        });

        // Merge onboarding messages into current chat and create a session
        setMessages(onboardingMsgs);
        const sessionTitle = language === 'zh' ? '钱包创建' : 'Wallet Setup';
        const newSessionId = 'onboarding-' + Date.now();
        setActiveChatId(newSessionId);
        setChatTitle(sessionTitle);
        setChatSessions(prev => [
          { id: newSessionId, title: sessionTitle, timestamp: new Date(), messages: onboardingMsgs },
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

  const handleSwitchSession = (session: ChatSession) => {
    setActiveChatId(session.id);
    setMessages(session.messages);
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
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: simulateAIResponse(inputValue),
        timestamp: new Date(),
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
  };

  // Start the onboarding flow
  const handleStartOnboarding = () => {
    onboarding.startOnboarding();
  };

  // Chat sessions sidebar content (portaled into DashboardLayout sidebar)
  const chatSessionsSidebar = (
    <>
      {/* New chat + search */}
      <div className="px-3 pt-2 pb-2 flex flex-col gap-2">
        <button
          onClick={handleNewChat}
          className="w-full h-[36px] flex items-center justify-center gap-2 px-4 text-[13px] font-medium text-[#4f5eff] border border-[#4f5eff] rounded-[8px] hover:bg-[#f0f0ff] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('ai.newChat')}
        </button>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'zh' ? '搜索对话...' : 'Search chats...'}
            className="w-full h-[32px] pl-8 pr-3 text-[12px] bg-white border border-[#EBEBEB] rounded-[8px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4f5eff] focus:border-[#4f5eff] transition-colors"
          />
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="px-2 py-1.5">
          <span className="text-[11px] font-medium text-[#4F4F4F] uppercase tracking-wider">
            {language === 'zh' ? '对话历史' : 'History'}
          </span>
        </div>
        {filteredSessions.map((session) => (
          <div key={session.id} className="relative group">
            <button
              onClick={() => handleSwitchSession(session)}
              className={`w-full text-left px-3 py-2 pr-8 rounded-[8px] text-[13px] transition-colors truncate ${
                activeChatId === session.id
                  ? 'bg-[#EBEBEB] text-[#4f5eff] font-medium'
                  : 'text-slate-700 hover:bg-[#EBEBEB] font-normal'
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

      {/* Delete confirmation dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setDeleteConfirmId(null)}>
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
    </>
  );

  // Render a single message (shared between regular and onboarding messages)
  const renderAssistantHeader = () => (
    <div style={{ fontSize: '14px', lineHeight: '20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
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

      {/* Chat area - full height */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative" style={{ height: 'calc(100vh - 0px)' }}>
        {/* Messages area */}
        {(displayMessages.length > 0 || combinedTyping) && (
        <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col items-center" style={{ gap: '24px', paddingTop: '32px' }}>
          <div className="w-full max-w-[768px] flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {displayMessages.map((message) => (
            <div key={message.id} className="animate-reveal-up" style={{ animationDuration: '400ms' }}>
              {/* Onboarding messages */}
              {message.role === 'onboarding' && message.onboardingData ? (
                <div className="flex items-start justify-start">
                  <div className="bg-transparent text-slate-900 w-full">
                    {renderAssistantHeader()}
                    <div className="whitespace-pre-wrap" style={{ fontSize: '14px', lineHeight: '20px' }}>
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
                      <div className="whitespace-pre-wrap" style={{ fontSize: '14px', lineHeight: '20px' }}>{message.content}</div>
                    </div>
                  ) : (
                    <div className="bg-[#EBEBEB] text-slate-900 max-w-[80%] rounded-[10px] px-4 py-3">
                      <div className="whitespace-pre-wrap" style={{ fontSize: '14px', lineHeight: '20px' }}>{message.content}</div>
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
          <div className="flex-1 flex items-center justify-center px-6">
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
                      className="w-full h-[80px] bg-transparent px-4 pt-3 pb-1 text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none"
                    />
                    <div className="flex items-center justify-between px-3 pb-3">
                      <button onClick={() => fileInputRef.current?.click()} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-slate-500 hover:bg-[#FAFAFA] transition-colors">
                        <Plus className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        className="w-[32px] h-[32px] flex items-center justify-center rounded-[10px] bg-[#4f5eff] hover:bg-[#3d4dd9] disabled:bg-slate-200 disabled:cursor-not-allowed text-white transition-all"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* Input area - shown when messages exist */}
        {(displayMessages.length > 0 || combinedTyping) && (
        <div className="bg-white px-6 pb-[24px] flex justify-center">
          <div className="w-full max-w-[768px]">
          <div className="bg-white border border-[#EBEBEB] rounded-xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)] flex flex-col">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder={t('ai.inputPlaceholder')}
              className="w-full h-[80px] bg-transparent px-4 pt-3 pb-1 text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <button onClick={() => fileInputRef.current?.click()} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-slate-500 hover:bg-[#FAFAFA] transition-colors">
                <Plus className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="w-[32px] h-[32px] flex items-center justify-center rounded-[10px] bg-[#4f5eff] hover:bg-[#3d4dd9] disabled:bg-slate-200 disabled:cursor-not-allowed text-white transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          </div>
        </div>
        )}
      </div>
    </>
  );
}
