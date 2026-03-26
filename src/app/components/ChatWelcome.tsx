import { useLanguage } from '../contexts/LanguageContext';
import AvatarCharacter from './AvatarCharacter';

interface ChatWelcomeProps {
  variant: 'first-wallet' | 'returning';
}

function getTimeGreeting(language: string): string {
  const hour = new Date().getHours();
  if (language === 'zh') {
    if (hour < 6) return '夜深了';
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  }
  if (hour < 6) return 'Good evening';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getUserName(): string {
  try {
    const raw = localStorage.getItem('agent_wallet_current_user');
    if (raw) {
      const user = JSON.parse(raw);
      if (user.name && user.name !== 'Account') return user.name;
    }
  } catch {}
  return '';
}

export default function ChatWelcome({ variant }: ChatWelcomeProps) {
  const { t, language } = useLanguage();
  const isFirst = variant === 'first-wallet';
  const userName = getUserName();
  const greeting = getTimeGreeting(language);

  if (isFirst) {
    return (
      <div className="flex flex-col items-center text-center mb-8">
        <div className="mb-4">
          <AvatarCharacter variant="celebrate" size={64} />
        </div>
        <h2
          className="font-semibold text-[22px] sm:text-[28px] lg:text-[36px] text-[#0A0A0A] text-center leading-tight animate-reveal-up"
          style={{ animationDelay: '800ms', animationDuration: '500ms' }}
        >
          {t('chat.welcome.firstWallet.title')}
        </h2>
        <p
          className="text-[#7C7C7C] text-[14px] leading-[21px] md:text-[16px] md:leading-[24px] animate-reveal-up"
          style={{ maxWidth: '600px', animationDelay: '1100ms', animationDuration: '500ms' }}
        >
          {t('chat.welcome.firstWallet.subtitle')}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: stacked centered */}
      <div className="flex flex-col items-center text-center mb-8 lg:hidden">
        <div className="mb-3">
          <AvatarCharacter variant="wave" size={44} />
        </div>
        <h2 className="font-semibold text-[22px] text-[#0A0A0A] leading-tight">
          {greeting}{userName ? `, ${userName}` : ''}
        </h2>
        <p className="text-[#0A0A0A] text-[14px] leading-[21px] mt-1">
          {language === 'zh' ? '你的钱包助手已就绪，随时为你服务' : 'Your wallet assistant is ready to help'}
        </p>
      </div>
      {/* Desktop: side-by-side */}
      <div className="hidden lg:flex items-center gap-3 mb-8 justify-center">
        <div className="shrink-0">
          <AvatarCharacter variant="wave" size={44} />
        </div>
        <div className="flex flex-col">
          <h2 className="font-semibold text-[36px] text-[#0A0A0A] leading-tight">
            {greeting}{userName ? `, ${userName}` : ''}
          </h2>
          <p className="text-[#0A0A0A] text-[16px] leading-[24px] mt-1">
            {language === 'zh' ? '你的钱包助手已就绪，随时为你服务' : 'Your wallet assistant is ready to help'}
          </p>
        </div>
      </div>
    </>
  );
}
