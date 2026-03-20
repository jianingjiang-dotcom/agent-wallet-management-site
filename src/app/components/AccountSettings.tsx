import { useState } from 'react';
import { useNavigate } from 'react-router';
import { User, Mail, Calendar, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function AccountSettings() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [user] = useState(() => {
    const userData = localStorage.getItem('agent_wallet_current_user');
    return userData ? JSON.parse(userData) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('agent_wallet_current_user');
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-['Inter',sans-serif] font-semibold text-[28px] text-[#0a0a0a] mb-1">{t('account.title')}</h1>
        <p className="font-['Inter',sans-serif] font-normal text-[15px] text-[#7c7c7c]">{t('account.subtitle')}</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">{t('account.basicInfo')}</h2>

        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-200 to-orange-300 rounded-2xl flex items-center justify-center flex-shrink-0">
            <User className="w-10 h-10 text-amber-700" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <div className="text-sm text-slate-600 mb-1">{t('account.name')}</div>
              <div className="text-lg font-medium text-slate-900">{user.name}</div>
            </div>

            <div>
              <div className="flex items-center text-sm text-slate-600 mb-1">
                <Mail className="w-4 h-4 mr-2" />
                {t('account.email')}
              </div>
              <div className="text-slate-900">{user.email}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex items-center text-sm text-slate-600 mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('account.registeredAt')}
                </div>
                <div className="text-sm text-slate-900">{formatDate(user.createdAt)}</div>
              </div>

              <div>
                <div className="flex items-center text-sm text-slate-600 mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  {t('account.lastLogin')}
                </div>
                <div className="text-sm text-slate-900">{formatDate(new Date().toISOString())}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-white border border-[#EBEBEB] rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">{t('account.logout')}</h3>
            <p className="text-sm text-slate-600">{t('account.logoutDesc')}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-50 hover:bg-red-100 text-red-600 font-medium px-6 py-3 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('account.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
