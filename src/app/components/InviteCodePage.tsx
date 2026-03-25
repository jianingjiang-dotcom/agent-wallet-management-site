import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';

export default function InviteCodePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastType, setToastType] = useState<'error' | 'success'>('error');
  const [exiting, setExiting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-format: strip non-alphanumeric, insert dash after 4 chars, max 9 chars (XXXX-XXXX)
    const raw = e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase();
    const stripped = raw.replace(/-/g, '');
    let formatted = stripped;
    if (stripped.length > 4) {
      formatted = stripped.slice(0, 4) + '-' + stripped.slice(4, 8);
    }
    setCode(formatted);
    if (error) setError('');
  };

  const handleSubmit = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');

    // Mock validation
    await new Promise(r => setTimeout(r, 800));

    if (code === '1111-1111') {
      setError(t('invitePage.codeInvalid'));
      inputRef.current?.focus();
      setToastType('error');
      setToast(t('invitePage.codeInvalid'));
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
      setLoading(false);
      return;
    }

    if (code === '2222-2222') {
      setError(t('invitePage.codeUsed'));
      inputRef.current?.focus();
      setToastType('error');
      setToast(t('invitePage.codeUsed'));
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 3000);
      setLoading(false);
      return;
    }

    // Store invite code and mark as verified
    localStorage.setItem('agent_wallet_invite_verified', 'true');
    localStorage.setItem('agent_wallet_invite_code', code);
    // Keep loading=true so the button doesn't flash back to idle before navigating
    setToastType('success');
    setToast(t('invitePage.codeSuccess'));
    setToastVisible(true);
    setTimeout(() => {
      setExiting(true);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div
      className={`min-h-screen bg-[#F8F9FC] relative ${exiting ? 'animate-page-exit' : 'animate-page-enter'}`}
      onAnimationEnd={() => { if (exiting) navigate('/setup'); }}
    >
      {/* Toast */}
      {toast && (
        <div
          className={`fixed left-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-[12px] shadow-[0px_4px_12px_rgba(0,0,0,0.08)] ${toastType === 'success' ? 'bg-[#F0FDF4] border border-[#BBF7D0]' : 'bg-[#FEF2F2] border border-[#FECACA]'} ${toastVisible ? '' : 'opacity-0 pointer-events-none'}`}
          style={{
            animation: toastVisible ? 'toast-drop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' : 'toast-drop-out 0.3s ease-in forwards',
          }}
          onAnimationEnd={() => { if (!toastVisible) setToast(''); }}
        >
          {toastType === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#22C55E"/><path d="M5 8L7 10L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="#EF4444"/><path d="M8 4.5V8.5M8 10.5V11" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
          )}
          <span className={`text-[14px] leading-[20px] font-medium ${toastType === 'success' ? 'text-[#166534]' : 'text-[#991B1B]'}`}>{toast}</span>
        </div>
      )}

      <style>{`
        @keyframes toast-drop-in {
          0% { transform: translateX(-50%) translateY(-80px); opacity: 0; }
          100% { transform: translateX(-50%) translateY(0); opacity: 1; top: 24px; }
        }
        @keyframes toast-drop-out {
          0% { transform: translateX(-50%) translateY(0); opacity: 1; top: 24px; }
          100% { transform: translateX(-50%) translateY(-80px); opacity: 0; top: 24px; }
        }
      `}</style>
      {/* Logo */}
      <div className="absolute top-0 left-0 px-6 py-[23px]">
        <span className="text-[18px] font-semibold leading-none whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif" }}>
          <span className="text-[#1C1C1C]">Cobo </span>
          <span className="text-[#4F5EFF]">Pact</span>
        </span>
      </div>

      {/* Centered content */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center w-[480px] gap-8 -mt-[120px]">
          {/* Title + subtitle */}
          <div className="flex flex-col items-center gap-3 w-full">
            <h1 className="font-medium text-[28px] leading-[42px] text-center text-[#1C1C1C]">
              {t('invitePage.title')}
            </h1>
            <p className="text-[16px] leading-[26px] text-center text-[#73798B]">
              {t('invitePage.subtitle')}
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col items-start gap-6 w-full">
            {/* Input */}
            <div className="w-full">
              <input
                ref={inputRef}
                type="text"
                value={code}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={t('invitePage.placeholder')}
                className="w-full h-[54px] px-6 py-4 bg-white border border-[#EDEEF3] rounded-[16px] text-[16px] leading-[22px] text-center text-[#1C1C1C] placeholder:text-[#B9BCC5] placeholder:uppercase focus:placeholder:text-transparent outline-none transition-colors"
                maxLength={9}
              />
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={!code.trim() || loading}
              className="w-full h-[54px] px-6 py-4 bg-[#4F5EFF] hover:bg-[#3d4dd9] disabled:opacity-50 disabled:cursor-not-allowed rounded-[16px] text-[16px] leading-[22px] font-medium text-white text-center transition-all duration-150 active:scale-[0.98]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6.5" stroke="white" strokeOpacity="0.3" strokeWidth="2" />
                    <path d="M14.5 8A6.5 6.5 0 0 0 8 1.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {t('invitePage.verifying')}
                </span>
              ) : t('invitePage.submit')}
            </button>
          </div>

          {/* Footer link */}
          <p className="text-[16px] leading-[24px] text-center text-[#73798B]">
            {t('invitePage.noCode')}{' '}
            <a
              href="https://www.cobo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4F5EFF] hover:text-[#3d4dd9] transition-colors cursor-pointer"
            >
              {t('invitePage.getCode')}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
