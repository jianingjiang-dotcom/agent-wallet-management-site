import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Plus, History, MessageSquare, AlertTriangle, CheckCircle, XCircle, ChevronDown } from 'lucide-react';
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

type Tab = 'history' | 'chat';

export default function AIAssistant() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [selectedModel] = useState('CoboAgentWallet');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    setActiveTab('chat');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col -m-4 sm:-m-6 lg:-m-8">
      {/* Top bar with tabs */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-slate-900 bg-slate-100'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-4 h-4" />
            {t('ai.history')}
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-slate-900 bg-slate-100'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {t('ai.chatTab')}
          </button>
        </div>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('ai.newChat')}
        </button>
      </div>

      {/* History tab */}
      {activeTab === 'history' && (
        <div className="flex-1 flex items-center justify-center bg-[#f5f5f5]">
          <div className="text-center text-slate-400">
            <History className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t('ai.noHistory')}</p>
          </div>
        </div>
      )}

      {/* Chat tab */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col bg-[#f5f5f5] overflow-hidden">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-slate-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm font-medium">{t('ai.noMessages')}</p>
                  <p className="text-xs mt-1">{t('ai.startChat')}</p>
                </div>
              </div>
            )}

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
                        <div className="border-t border-slate-200 pt-2 mt-2">
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
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-[#4f5eff] text-white'
                          : 'bg-white text-slate-900 border border-slate-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className={`text-xs mt-1.5 ${message.role === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                        {message.timestamp.toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
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

          {/* Input area */}
          <div className="bg-white border-t border-slate-200 px-6 py-4">
            {/* Model selector + file upload */}
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  {selectedModel}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {showModelDropdown && (
                  <div className="absolute bottom-full mb-1 left-0 bg-white border border-slate-200 rounded-lg shadow-lg min-w-[160px]">
                    <button
                      onClick={() => setShowModelDropdown(false)}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      CoboAgentWallet
                    </button>
                  </div>
                )}
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors">
                <Paperclip className="w-4 h-4" />
                {t('ai.uploadFile')}
              </button>
            </div>

            {/* Text input + send */}
            <div className="flex items-end gap-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('ai.inputPlaceholder')}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4f5eff] focus:border-transparent"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                className="bg-[#4f5eff] hover:bg-[#3d4dd9] disabled:bg-slate-200 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl transition-all flex items-center gap-2 text-sm font-medium"
              >
                <Send className="w-4 h-4" />
                {t('ai.send')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
