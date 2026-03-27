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
  reasonKey: string;
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
    reasonKey: 'approval.reason.singleLimit',
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
    reasonKey: 'approval.reason.newAddress',
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
    reasonKey: 'approval.reason.unauthorizedContract',
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
    reasonKey: 'approval.reason.singleLimit',
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
    reasonKey: 'approval.reason.dailyLimit',
  },
];

export default function ApprovalPage({ initialTab = 'all', onPendingCountChange }: { initialTab?: TabFilter; onPendingCountChange?: (count: number) => void }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabFilter>(initialTab);
  const [records, setRecords] = useState<ApprovalRecord[]>(mockRecords);

  const pendingCount = records.filter(r => r.status === 'pending').length;

  useEffect(() => {
    onPendingCountChange?.(pendingCount);
  }, [pendingCount, onPendingCountChange]);

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: t('approval.tabs.all') },
    { key: 'pending', label: t('approval.tabs.pending') },
    { key: 'approved', label: t('approval.tabs.approved') },
    { key: 'rejected', label: t('approval.tabs.rejected') },
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

    if (diffMins < 60) return t('time.minutesAgo').replace('{n}', String(diffMins));
    if (diffHours < 24) return t('time.hoursAgo').replace('{n}', String(diffHours));
    return t('time.daysAgo').replace('{n}', String(diffDays));
  };

  const statusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" style={{ color: 'var(--app-status-pending-text)' }} />;
      case 'approved': return <CheckCircle className="w-4 h-4" style={{ color: 'var(--app-status-approved-text)' }} />;
      case 'rejected': return <XCircle className="w-4 h-4" style={{ color: 'var(--app-status-rejected-text)' }} />;
    }
  };

  const statusLabel = (status: ApprovalStatus) => t(`approval.status.${status}`);

  const statusColor = (status: ApprovalStatus) => {
    switch (status) {
      case 'pending': return 'text-[var(--app-status-pending-text)] bg-[var(--app-status-pending-badge-bg)]';
      case 'approved': return 'text-[var(--app-status-approved-text)] bg-[var(--app-status-approved-badge-bg)]';
      case 'rejected': return 'text-[var(--app-status-rejected-text)] bg-[var(--app-status-rejected-badge-bg)]';
    }
  };

  return (
    <div className="w-full max-w-[768px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[24px] leading-[32px] font-normal text-[var(--app-text)] mb-1">
          {t('approval.title')}
        </h1>
        <p className="text-[14px] text-[var(--app-text-muted)]">
          {t('approval.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-[var(--app-border)] overflow-x-auto whitespace-nowrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-[14px] font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-[var(--app-accent)] text-[var(--app-accent)]'
                : 'border-transparent text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
            }`}
          >
            {tab.label}
            {tab.key === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[11px] font-medium bg-[var(--app-status-pending-badge-bg)] text-[var(--app-status-pending-text)] rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Records */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-16 text-[var(--app-text-muted)] text-[14px]">
            {t('approval.noRecords')}
          </div>
        ) : (
          filteredRecords.map(record => (
            <div
              key={record.id}
              className="bg-[var(--app-card-bg)] border border-[var(--app-border-medium)] rounded-xl p-4 hover:border-[var(--app-border-strong)] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium ${statusColor(record.status)}`}>
                    {statusIcon(record.status)}
                    {statusLabel(record.status)}
                  </div>
                  <span className="text-[12px] text-[var(--app-text-tertiary)]">{formatTime(record.timestamp)}</span>
                </div>
                <span className="text-[14px] font-semibold text-[var(--app-text)]">{record.amount}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mb-3">
                <div className="flex items-center gap-2 text-[13px]">
                  <Wallet className="w-3.5 h-3.5 text-[var(--app-text-tertiary)]" strokeWidth={1.5} />
                  <span className="text-[var(--app-text-muted)]">{t('approval.wallet')}:</span>
                  <span className="text-[var(--app-text)]">{record.walletName}</span>
                </div>
                <div className="flex items-center gap-2 text-[13px]">
                  <Bot className="w-3.5 h-3.5 text-[var(--app-text-tertiary)]" strokeWidth={1.5} />
                  <span className="text-[var(--app-text-muted)]">Agent:</span>
                  <span className="text-[var(--app-text)]">{record.agentName}</span>
                </div>
                <div className="text-[13px]">
                  <span className="text-[var(--app-text-muted)]">{t('approval.operation')}:</span>
                  <span className="text-[var(--app-text)] ml-1">{record.operation}</span>
                </div>
                <div className="text-[13px]">
                  <span className="text-[var(--app-text-muted)]">{t('approval.target')}:</span>
                  <span className="text-[var(--app-text)] ml-1 font-mono">{record.target}</span>
                </div>
              </div>

              <div className={`text-[12px] px-3 py-1.5 rounded-lg mb-3 ${
                record.status === 'approved' ? 'text-[var(--app-status-approved-text)] bg-[var(--app-status-approved-bg)]'
                : record.status === 'rejected' ? 'text-[var(--app-status-rejected-text)] bg-[var(--app-status-rejected-bg)]'
                : 'text-[var(--app-status-pending-text)] bg-[var(--app-status-pending-bg)]'
              }`}>
                {t('approval.trigger')}: {t(record.reasonKey)}
              </div>

              {record.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleApprove(record.id)}
                    className="flex-1 h-[36px] bg-[var(--app-accent)] hover:bg-[var(--app-accent-hover)] text-white text-[13px] font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {t('approval.approve')}
                  </button>
                  <button
                    onClick={() => handleReject(record.id)}
                    className="flex-1 h-[36px] bg-[var(--app-card-bg)] border border-[var(--app-hover-bg-dark)] hover:bg-[var(--app-hover-bg)] text-[var(--app-text)] text-[13px] font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    {t('approval.reject')}
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
