import { useState } from 'react';
import { Fuel, DollarSign, TrendingUp, AlertCircle, Copy, CheckCircle, QrCode, X, ExternalLink, Bell, Mail, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

type BalanceStatus = 'normal' | 'warning' | 'low' | 'loading';
type Chain = 'ETH' | 'SOL';

export default function Gasless() {
  const { t } = useLanguage();
  
  // Balance state
  const [isLoading, setIsLoading] = useState(false);
  const [fuelBalance] = useState(125.50);
  const [usdValue] = useState(125.50);
  const [alertThreshold, setAlertThreshold] = useState(50);
  
  // Deposit modal state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedChain, setSelectedChain] = useState<Chain>('ETH');
  const [copied, setCopied] = useState(false);
  
  // Alert settings
  const [notificationMethod, setNotificationMethod] = useState<'page' | 'email'>('page');
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Calculate balance status
  const getBalanceStatus = (): BalanceStatus => {
    if (isLoading) return 'loading';
    if (fuelBalance <= 10) return 'low';
    if (fuelBalance <= alertThreshold) return 'warning';
    return 'normal';
  };

  const balanceStatus = getBalanceStatus();

  const depositAddresses: Record<Chain, string> = {
    'ETH': '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    'SOL': 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAlert = () => {
    alert(t('gasless.saveSettings') + ' - Threshold: ' + alertThreshold + ', Method: ' + notificationMethod);
  };

  const transactions = [
    { id: 1, time: '2026-03-09 14:30', chain: 'Ethereum', txHash: '0x1a2b3c4d5e6f7890abcdef', fuelUsed: 0.5, operationType: 'Token Transfer' },
    { id: 2, time: '2026-03-09 12:15', chain: 'Polygon', txHash: '0x4d5e6f7890abcdef123456', fuelUsed: 0.2, operationType: 'Contract Call' },
    { id: 3, time: '2026-03-08 18:45', chain: 'Ethereum', txHash: '0x7g8h9i0j1k2l3m4n5o6p7q', fuelUsed: 0.8, operationType: 'NFT Mint' },
    { id: 4, time: '2026-03-08 10:20', chain: 'BSC', txHash: '0xjk1l2m3n4o5p6q7r8s9t0u', fuelUsed: 0.3, operationType: 'Swap' },
    { id: 5, time: '2026-03-07 16:30', chain: 'Ethereum', txHash: '0x3n4o5p6q7r8s9t0u1v2w3x', fuelUsed: 0.6, operationType: 'Token Transfer' },
    { id: 6, time: '2026-03-07 09:10', chain: 'Arbitrum', txHash: '0x4y5z6a7b8c9d0e1f2g3h4i', fuelUsed: 0.4, operationType: 'Contract Call' },
    { id: 7, time: '2026-03-06 22:45', chain: 'Ethereum', txHash: '0x5j6k7l8m9n0o1p2q3r4s5t', fuelUsed: 0.7, operationType: 'Token Transfer' },
    { id: 8, time: '2026-03-06 15:20', chain: 'Optimism', txHash: '0x6u7v8w9x0y1z2a3b4c5d6e', fuelUsed: 0.3, operationType: 'Swap' },
  ];

  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getChainColor = (chain: string) => {
    switch (chain) {
      case 'Ethereum': return 'bg-blue-100 text-blue-700';
      case 'Polygon': return 'bg-purple-100 text-purple-700';
      case 'BSC': return 'bg-yellow-100 text-yellow-700';
      case 'Arbitrum': return 'bg-cyan-100 text-cyan-700';
      case 'Optimism': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getExplorerUrl = (chain: string, txHash: string) => {
    const baseUrls: Record<string, string> = {
      'Ethereum': 'https://etherscan.io/tx/',
      'Polygon': 'https://polygonscan.com/tx/',
      'BSC': 'https://bscscan.com/tx/',
      'Arbitrum': 'https://arbiscan.io/tx/',
      'Optimism': 'https://optimistic.etherscan.io/tx/',
    };
    return baseUrls[chain] + txHash;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h1 className="font-['Inter',sans-serif] font-semibold text-[28px] text-[#0a0a0a] mb-1">{t('gasAccount.title')}</h1>
        <p className="font-['Inter',sans-serif] font-normal text-[15px] text-[#7c7c7c] mb-4">{t('gasAccount.subtitle')}</p>
        <div className="bg-[rgba(79,94,255,0.04)] border border-[rgba(79,94,255,0.1)] rounded-[10px] px-4 py-3">
          <p className="font-['Inter',sans-serif] font-normal text-[13px] text-[#4f4f4f] leading-relaxed">
            {t('gasAccount.intro')}
          </p>
        </div>
      </div>

      {/* Status Banner */}
      {balanceStatus === 'low' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <div>
              <div className="font-medium text-red-900">{t('gasAccount.criticalLow')}</div>
              <div className="text-sm text-red-700">{t('gasAccount.criticalLowDesc')}</div>
            </div>
          </div>
          <button
            onClick={() => setShowDepositModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            {t('gasAccount.depositNow')}
          </button>
        </div>
      )}

      {balanceStatus === 'warning' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3" />
            <div>
              <div className="font-medium text-yellow-900">{t('gasAccount.alertTriggered')}</div>
              <div className="text-sm text-yellow-700">{t('gasAccount.alertTriggeredDesc')} {alertThreshold} Fuel</div>
            </div>
          </div>
          <button
            onClick={() => setShowDepositModal(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
          >
            {t('gasAccount.topUp')}
          </button>
        </div>
      )}

      {/* Balance Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-blue-50 p-3 rounded-xl mr-4">
                <Fuel className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-slate-600">{t('gasless.fuelBalance')}</div>
                <div className="text-3xl font-semibold text-slate-900">{fuelBalance.toFixed(2)} Fuel</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center text-slate-600 text-sm mb-1">
                <DollarSign className="w-4 h-4 mr-1" />
                {t('gasless.usdValue')}
              </div>
              <div className="text-xl font-medium text-slate-900">${usdValue.toFixed(2)}</div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm text-green-800">{t('gasless.sufficientBalance')}</span>
              </div>
              <span className="text-sm font-medium text-green-700">{t('gasless.healthy')}</span>
            </div>
          </div>
        </div>

        {/* Alert Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-[#4f5eff] mr-2" />
            <h3 className="font-semibold text-slate-900">{t('gasless.alertSettings')}</h3>
          </div>
          <p className="text-sm text-slate-600 mb-4">{t('gasless.alertDesc')}</p>
          <div className="mb-4">
            <label className="text-sm text-slate-700 mb-2 block">{t('gasless.alertThreshold')}</label>
            <input
              type="number"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4f5eff] focus:border-transparent"
            />
          </div>
          <div className="mb-4 relative">
            <label className="text-sm text-slate-700 mb-2 block">{t('gasAccount.notifyMethod')}</label>
            <button
              onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center">
                {notificationMethod === 'page' ? (
                  <>
                    <Bell className="w-4 h-4 mr-2" />
                    <span className="text-sm">{t('gasless.notifyPage')}</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="text-sm">{t('gasless.notifyEmail')}</span>
                  </>
                )}
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showNotificationDropdown && (
              <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10">
                <button
                  onClick={() => {
                    setNotificationMethod('page');
                    setShowNotificationDropdown(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors rounded-t-xl"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {t('gasless.notifyPage')}
                </button>
                <button
                  onClick={() => {
                    setNotificationMethod('email');
                    setShowNotificationDropdown(false);
                  }}
                  className="w-full flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors rounded-b-xl"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {t('gasless.notifyEmail')}
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleSaveAlert}
            className="w-full bg-[#4f5eff] hover:bg-[#3d4dd9] text-white font-medium py-3 rounded-xl transition-colors shadow-sm"
          >
            {t('gasless.saveSettings')}
          </button>
        </div>
      </div>

      {/* Deposit Address */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-slate-900">{t('gasless.depositAddress')}</h2>
        </div>
        <p className="text-sm text-slate-600 mb-4">{t('gasless.depositDesc')}</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-4">
              <label className="text-sm text-slate-700 mb-2 block">{t('gasless.selectChain')}</label>
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value as Chain)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4f5eff] focus:border-transparent"
              >
                <option value="ETH">Ethereum (ETH)</option>
                <option value="SOL">Solana (SOL)</option>
              </select>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
              <code className="text-sm text-slate-900 break-all font-mono">{depositAddresses[selectedChain]}</code>
            </div>
            <button
              onClick={() => handleCopyAddress(depositAddresses[selectedChain])}
              className="flex items-center bg-[#4f5eff] hover:bg-[#3d4dd9] text-white font-medium px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('gasless.copied')}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  {t('gasless.copyAddress')}
                </>
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 w-48 h-48 flex items-center justify-center">
              <QrCode className="w-32 h-32 text-slate-300" />
            </div>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">{t('gasless.supportedChains')}</div>
              <div>Ethereum, Polygon, BSC, Arbitrum, Optimism</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">{t('gasless.transactionHistory')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">{t('gasless.time')}</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">{t('gasless.chain')}</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">{t('gasless.txHash')}</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">{t('gasless.fuelUsed')}</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">{t('gasless.operationType')}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-slate-700">{tx.time}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getChainColor(tx.chain)}`}>
                      {tx.chain}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={getExplorerUrl(tx.chain, tx.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-slate-600 font-mono underline"
                    >
                      {tx.txHash}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-medium text-slate-900">
                    {tx.fuelUsed.toFixed(2)} Fuel
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-medium text-slate-900">
                    {tx.operationType}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {t('gasless.previous')}
          </button>
          <span className="mx-2 text-sm text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {t('gasless.next')}
          </button>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">{t('gasless.deposit')}</h2>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">{t('gasless.depositDesc')}</p>
            <div className="mb-4">
              <label className="text-sm text-slate-700 mb-2 block">{t('gasless.selectChain')}</label>
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(e.target.value as Chain)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4f5eff] focus:border-transparent"
              >
                <option value="ETH">Ethereum (ETH)</option>
                <option value="SOL">Solana (SOL)</option>
              </select>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4">
              <code className="text-sm text-slate-900 break-all font-mono">{depositAddresses[selectedChain]}</code>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4">
                <QrCode className="w-32 h-32 text-slate-300" />
              </div>
            </div>
            <button
              onClick={() => handleCopyAddress(depositAddresses[selectedChain])}
              className="w-full flex items-center justify-center bg-[#4f5eff] hover:bg-[#3d4dd9] text-white font-medium px-6 py-3 rounded-xl transition-colors shadow-sm"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('gasless.copied')}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  {t('gasless.copyAddress')}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}