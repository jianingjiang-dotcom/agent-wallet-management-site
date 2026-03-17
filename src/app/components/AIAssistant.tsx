import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Plus, MessageSquare, AlertTriangle, CheckCircle, XCircle, ChevronDown, Search, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Bot, Trash2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'approval';
  content: string;
  timestamp: Date;
  approvalData?: {
    operation: string;
    amount: string;
    target: string;
    reason: string;
    status?: 'pending' | 'approved' | 'rejected';
  };
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: Message[];
}

export default function AIAssistant() {
  const { t, language } = useLanguage();
  const [userName] = useState<string>(() => {
    try {
      const u = localStorage.getItem('agent_wallet_current_user');
      return u ? JSON.parse(u).name || '' : '';
    } catch { return ''; }
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedModel] = useState('CoboAgentWallet');
  const [activeChatId, setActiveChatId] = useState<string>('current');
  const [chatTitle, setChatTitle] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
  }, [messages]);

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
      if (lowerMessage.includes('安装') || lowerMessage.includes('配置')) {
        return '关于 Agent 的安装和配置，您可以在"Agent 安装指南"页面找到详细的步骤说明。主要包括：1) 安装 SDK，2) 初始化配置，3) 设置 API 密钥。如果您在某个步骤遇到问题，请告诉我具体是哪一步。';
      } else if (lowerMessage.includes('安全') || lowerMessage.includes('风险') || lowerMessage.includes('风控')) {
        return '安全是我们最重视的部分。建议您启用以下安全功能：1) 双因素认证，2) 自动拦截可疑活动，3) 交易限额控制。您可以在"委托与策略"页面进行详细设置。需要我帮您详细解释某个功能吗？';
      } else if (lowerMessage.includes('余额') || lowerMessage.includes('转账')) {
        return '关于交易和转账，Agent Wallet 提供了完善的交易管理功能。所有交易都会经过多重验证和风控检查。如需查看交易历史或调整交易权限，我可以帮您导航到相应的页面。';
      } else {
        return '感谢您的提问。我会尽力帮助您。如果您需要更详细的技术支持，建议您查看我们的完整文档或联系技术支持团队。还有其他问题吗？';
      }
    } else {
      if (lowerMessage.includes('install') || lowerMessage.includes('setup')) {
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
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    let currentSessionId = activeChatId;

    // Auto-generate chat title from first message and add to session list
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveChatId('current');
  };

  return (
    <div className="flex -m-4 sm:-m-6 lg:-m-8" style={{ height: 'calc(100vh)' }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            // Handle file upload here
            console.log('Selected file:', file.name);
          }
          e.target.value = '';
        }}
      />
      {/* Chat history sidebar - Monica style */}
      {sidebarOpen && (
      <div className="w-[280px] bg-white border-r border-[#EDEEF3] flex flex-col shrink-0">
        {/* Search bar + collapse */}
        <div className="px-4 pt-5 flex items-center gap-2" style={{ paddingBottom: '16px' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'zh' ? '搜索对话...' : 'Search chats...'}
              className="w-full h-[40px] pl-9 pr-3 text-sm bg-[#F8F9FC] border border-[#EDEEF3] rounded-[10px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#4f5eff] focus:border-[#4f5eff] transition-colors"
            />
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-[#F8F9FC] transition-colors shrink-0"
            title={language === 'zh' ? '收起侧边栏' : 'Collapse sidebar'}
          >
            <PanelLeftClose className="w-5 h-5 text-[#73798B]" strokeWidth={1.5} />
          </button>
        </div>

        {/* New chat button */}
        <div className="px-4" style={{ paddingBottom: '24px' }}>
          <button
            onClick={handleNewChat}
            className="w-full h-[40px] flex items-center justify-center gap-2 px-4 text-sm font-medium text-[#4f5eff] border border-[#4f5eff] rounded-[10px] hover:bg-[#f0f0ff] transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('ai.newChat')}
          </button>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-2">
          <div className="border-t border-[#EDEEF3] mx-2" style={{ marginBottom: '8px' }} />
          <div className="px-2 py-2">
            <span className="text-xs text-slate-500">
              {language === 'zh' ? '对话历史' : 'History'}
            </span>
          </div>
          {filteredSessions.map((session) => (
            <div key={session.id} className="relative group">
              <button
                onClick={() => handleSwitchSession(session)}
                style={{ paddingTop: '10px', paddingBottom: '10px', fontWeight: activeChatId === session.id ? 500 : 400 }}
                className={`w-full text-left px-3 pr-8 rounded-[10px] text-sm transition-colors truncate ${
                  activeChatId === session.id
                    ? 'bg-[#EDEEF3] text-[#4f5eff]'
                    : 'text-slate-700 hover:bg-[#EDEEF3]'
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
                <MoreHorizontal style={{ width: '14px', height: '14px', color: '#73798B' }} />
              </button>
              {menuOpenId === session.id && (
                <div ref={menuRef} className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-[#EDEEF3] py-1 z-50" style={{ minWidth: '120px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(session.id); setMenuOpenId(null); }}
                    className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-[#F8F9FC] flex items-center gap-2"
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                    {language === 'zh' ? '删除' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          ))}
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
                    className="px-4 py-2 text-sm text-slate-700 bg-[#F8F9FC] rounded-lg hover:bg-[#EDEEF3] transition-colors"
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
        </div>
      </div>
      )}

      {/* Chat area */}
      <div className={`flex-1 flex flex-col bg-white overflow-hidden relative ${messages.length === 0 ? 'justify-center' : ''}`}>
          {/* Expand sidebar button */}
          {!sidebarOpen && (
            <div className={`px-4 ${messages.length === 0 ? 'absolute top-0 left-0' : ''}`} style={{ paddingTop: '24px' }}>
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-[32px] h-[32px] flex items-center justify-center rounded-[6px] hover:bg-[#F8F9FC] transition-colors"
                title={language === 'zh' ? '展开侧边栏' : 'Expand sidebar'}
              >
                <PanelLeftOpen className="w-5 h-5 text-[#73798B]" strokeWidth={1.5} />
              </button>
            </div>
          )}

          {/* Messages area */}
          {messages.length > 0 && (
          <div className="flex-1 overflow-y-auto px-6 pb-6 flex flex-col items-center" style={{ gap: '32px', paddingTop: '32px' }}>
            <div className="w-full max-w-[768px] flex-1" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'approval' && message.approvalData ? (
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
                        <div className="border-t border-[#EDEEF3] pt-2 mt-2">
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
                        <div style={{ fontSize: '14px', lineHeight: '20px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#4f5eff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Bot style={{ width: '12px', height: '12px', color: 'white' }} />
                          </div>
                          <span style={{ fontWeight: 600 }}>Cobo<span style={{ color: '#4f5eff' }}>Agentic</span>Wallet</span>
                        </div>
                        <div className="whitespace-pre-wrap" style={{ fontSize: '14px', lineHeight: '20px' }}>{message.content}</div>
                      </div>
                    ) : (
                      <div className="bg-[#EDEEF3] text-slate-900 max-w-[80%] rounded-[10px] px-4 py-3">
                        <div className="whitespace-pre-wrap" style={{ fontSize: '14px', lineHeight: '20px' }}>{message.content}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start">
                <div className="bg-white border border-[#EDEEF3] rounded-2xl px-4 py-3">
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

          {/* Empty state: welcome text + input centered together */}
          {messages.length === 0 && (
            <div className="flex justify-center px-6" style={{ marginTop: '-60px' }}>
              <div className="w-full max-w-[768px]">
                <p style={{ fontSize: '36px', lineHeight: '46px', color: '#1C1C1C', marginBottom: '40px', textAlign: 'center' }}>
                  {language === 'zh' ? '有什么可以帮到您？' : 'How can I help you?'}
                </p>
                <div className="bg-white border border-[#EDEEF3] rounded-xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)] flex flex-col">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                    placeholder={t('ai.inputPlaceholder')}
                    className="w-full h-[80px] bg-transparent px-4 pt-3 pb-1 text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none"
                  />
                  <div className="flex items-center justify-between px-3 pb-3">
                    <button onClick={() => fileInputRef.current?.click()} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-slate-500 hover:bg-[#F8F9FC] transition-colors">
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

          {/* Input area - only shown when there are messages */}
          {messages.length > 0 && (
          <div className="bg-white px-6 pb-[24px] flex justify-center">
            <div className="w-full max-w-[768px]">
            {/* Text input with toolbar + send */}
            <div className="bg-white border border-[#EDEEF3] rounded-xl shadow-[0px_4px_16px_0px_rgba(0,0,0,0.08)] flex flex-col">
              {/* Textarea */}
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder={t('ai.inputPlaceholder')}
                className="w-full h-[80px] bg-transparent px-4 pt-3 pb-1 text-sm text-slate-900 placeholder-slate-400 focus:outline-none resize-none"
              />
              {/* Bottom toolbar: model selector + file upload + send */}
              <div className="flex items-center justify-between px-3 pb-3">
                <button onClick={() => fileInputRef.current?.click()} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] text-slate-500 hover:bg-[#F8F9FC] transition-colors">
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
      </div>
  );
}
