import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Wallet, Bot } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type ApprovalStatus = 'pending' | 'approved' | 'rejected';
type TabFilter = 'all' | 'pending' | 'approved' | 'rejected';

interface ApprovalRecord {
  id: string;
  walletName: string;
  agentName: string;
  operation: string;
  amount: string;
  target: string;
  status: ApprovalStatus;
  timestamp: Date;
  reason: string;
}

const mockRecords: ApprovalRecord[] = [
  {
    id: '1',
    walletName: 'Wallet #1',
    agentName: 'Agent #1',
    operation: 'Transfer',
    amount: '50 USDC',
    target: '0x7a3d...f82e',
    status: 'pending',
    timestamp: new Date(Date.now() - 1800000),
    reason: '超出单笔限额',
  },
  {
    id: '2',
    walletName: 'Wallet #1',
    agentName: 'Agent #1',
    operation: 'Transfer',
    amount: '25 USDC',
    target: '0x4b2c...a91d',
    status: 'pending',
    timestamp: new Date(Date.now() - 3600000),
    reason: '新地址首次转账',
  },
  {
    id: '3',
    walletName: 'Wallet #1',
    agentName: 'Agent #1',
    operation: 'Contract Call',
    amount: '0.5 ETH',
    target: '0x1f9a...c3e7',
    status: 'approved',
    timestamp: new Date(Date.now() - 86400000),
    reason: '未授权合约地址',
  },
  {
    id: '4',
    walletName: 'Wallet #1',
    agentName: 'Agent #1',
    operation: 'Transfer',
    amount: '200 USDC',
    target: '0x9d8e...b4f2',
    status: 'approved',
    timestamp: new Date(Date.now() - 172800000),
    reason: '超出单笔限额',
  },
  {
    id: '5',
    walletName: 'Wallet #1',
    agentName: 'Agent #1',
    operation: 'Transfer',
    amount: '500 USDC',
    target: '0x3c7f...e1a8',
    status: 'rejected',
    timestamp: new Date(Date.now() - 259200000),
    reason: '超出每日限额',
  },
];

export default function ApprovalPage({ initialTab = 'all', onPendingCountChange }: { initialTab?: TabFilter; onPendingCountChange?: (count: number) => void }) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabFilter>(initialTab);
  const [records, setRecords] = useState<ApprovalRecord[]>(mockRecords);

  const pendingCount = records.filter(r => r.status === 'pending').length;

  useEffect(() => {
    onPendingCountChange?.(pendingCount);
  }, [pendingCount, onPendingCountChange]);

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: language === 'zh' ? '全部' : 'All' },
    { key: 'pending', label: language === 'zh' ? '未审批' : 'Pending' },
    { key: 'approved', label: language === 'zh' ? '已审批' : 'Approved' },
    { key: 'rejected', label: language === 'zh' ? '已拒绝' : 'Rejected' },
  ];

  const filteredRecords = activeTab === 'all'
    ? records
    : records.filter(r => r.status === activeTab);

  const handleApprove = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' as ApprovalStatus } : r));
  };

  const handleReject = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' as ApprovalStatus } : r));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return language === 'zh' ? `${diffMins} 分钟前` : `${diffMins}m ago`;
    if (diffHours < 24) return language === 'zh' ? `${diffHours} 小时前` : `${diffHours}h ago`;
    return language === 'zh' ? `${diffDays} 天前` : `${diffDays}d ago`;
  };

  const statusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const statusLabel = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending': return language === 'zh' ? '待审批' : 'Pending';
      case 'approved': return language === 'zh' ? '已审批' : 'Approved';
      case 'rejected': return language === 'zh' ? '已拒绝' : 'Rejected';
    }
  };

  const statusColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending': return 'text-amber-600 bg-amber-50';
      case 'approved': return 'text-green-600 bg-green-50';
      case 'rejected': return 'text-red-600 bg-red-50';
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[#0A0A0A] mb-1">
          {language === 'zh' ? '操作审批' : 'Operation Approvals'}
        </h1>
        <p className="text-[14px] text-[#73798B]">
          {language === 'zh'
            ? '管理钱包和 Agent 的操作审批请求'
            : 'Manage approval requests from wallets and agents'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-[#EBEBEB]">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-[#4f5eff] text-[#4f5eff]'
                : 'border-transparent text-[#73798B] hover:text-[#0A0A0A]'
            }`}
          >
            {tab.label}
            {tab.key === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[11px] font-medium bg-amber-100 text-amber-600 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Records */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 text-[#73798B] text-[14px]">
            {language === 'zh' ? '暂无待审批请求' : 'No pending approval requests'}
          </div>
        ) : (
          filteredRecords.map(record => (
            <div
              key={record.id}
              className="bg-white border border-[#EBEBEB] rounded-xl p-4 hover:border-[#D0D0D0] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium ${statusColor(record.status)}`}>
                    {statusIcon(record.status)}
                    {statusLabel(record.status)}
                  </div>
                  <span className="text-[12px] text-[#999]">{formatTime(record.timestamp)}</span>
                </div>
                <span className="text-[14px] font-semibold text-[#0A0A0A]">{record.amount}</span>
              </div>

              <div className="grid grid-cols-2 gap-y-2 gap-x-4 mb-3">
                <div className="flex items-center gap-2 text-[13px]">
                  <Wallet className="w-3.5 h-3.5 text-[#999]" strokeWidth={1.5} />
                  <span className="text-[#73798B]">{language === 'zh' ? '钱包' : 'Wallet'}:</span>
                  <span className="text-[#0A0A0A]">{record.walletName}</span>
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <Bot className="w-3.5 h-3.5 text-[#999]" strokeWidth={1.5} />
                  <span className="text-[#73798B]">Agent:</span>
                  <span className="text-[#0A0A0A]">{record.agentName}</span>
                </div>
                <div className="text-[13px]">
                  <span className="text-[#73798B]">{language === 'zh' ? '操作' : 'Operation'}:</span>
                  <span className="text-[#0A0A0A] ml-1">{record.operation}</span>
                </div>
                <div className="text-[13px]">
                  <span className="text-[#73798B]">{language === 'zh' ? '目标' : 'Target'}:</span>
                  <span className="text-[#0A0A0A] ml-1 font-mono">{record.target}</span>
                </div>
              </div>

              <div className={`text-[12px] px-3 py-1.5 rounded-lg mb-3 ${
                record.status === 'approved' ? 'text-green-600 bg-green-50'
                : record.status === 'rejected' ? 'text-red-600 bg-red-50'
                : 'text-amber-600 bg-amber-50'
              }`}>
                {language === 'zh' ? '触发原因' : 'Trigger'}: {record.reason}
              </div>

              {record.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleApprove(record.id)}
                    className="flex-1 h-[36px] bg-[#4f5eff] hover:bg-[#3d4dd9] text-white text-[13px] font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {language === 'zh' ? '批准' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(record.id)}
                    className="flex-1 h-[36px] bg-white border border-[#EBEBEB] hover:bg-[#FAFAFA] text-[#0A0A0A] text-[13px] font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    {language === 'zh' ? '拒绝' : 'Reject'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
