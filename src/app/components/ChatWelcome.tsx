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

  return (
    <div className="flex flex-col items-center text-center mb-8">

      {/* Avatar */}
      <div className="mb-4">
        <AvatarCharacter variant={isFirst ? 'celebrate' : 'wave'} size={64} />
      </div>

      {/* Title */}
      <h2
        className={`font-semibold text-[22px] sm:text-[28px] lg:text-[36px] leading-tight ${isFirst ? 'animate-reveal-up' : ''}`}
        style={{
          ...(isFirst && { animationDelay: '800ms', animationDuration: '500ms' }),
          ...(!isFirst && { animationDuration: '0.5s', animationDelay: '0ms' }),
        }}
      >
        {isFirst ? (
          <span className="text-[var(--app-text)]">
            {t('chat.welcome.firstWallet.title')}
          </span>
        ) : (
          <>
            <span className="text-[var(--app-text)]">
              {language === 'zh' ? 'Hi buddy，欢迎使用 ' : 'Hi buddy, welcome to '}
            </span>
            <span className="font-space-grotesk" style={{ color: '#1c1c1c' }}>Cobo</span><span className="font-space-grotesk" style={{ color: '#4F5EFF' }}>Pact</span>
          </>
        )}
      </h2>

      {/* Subtitle */}
      {isFirst ? (
        <p
          className="text-[#7C7C7C] text-[14px] leading-[21px] md:text-[16px] md:leading-[24px] animate-reveal-up"
          style={{ maxWidth: '600px', animationDelay: '1100ms', animationDuration: '500ms' }}
        >
          {t('chat.welcome.firstWallet.subtitle')}
        </p>
      ) : (
        <p
          className="text-[#0A0A0A] text-[14px] lg:text-[16px] leading-[21px] lg:leading-[24px] mt-1.5 animate-reveal-up"
          style={{ animationDuration: '0.5s', animationDelay: '150ms' }}
        >
          {language === 'zh' ? '你的钱包助手已就绪，随时为你服务' : 'Your wallet assistant is ready to help'}
        </p>
      )}
    </div>
  );
}
