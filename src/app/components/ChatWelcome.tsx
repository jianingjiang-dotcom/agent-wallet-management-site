import { useLanguage } from '../contexts/LanguageContext';
import AvatarCharacter from './AvatarCharacter';

interface ChatWelcomeProps {
  variant: 'first-wallet' | 'returning';
}

export default function ChatWelcome({ variant }: ChatWelcomeProps) {
  const { t, language } = useLanguage();
  const isFirst = variant === 'first-wallet';

  return (
    <div className="flex flex-col items-center text-center mb-8">

      {/* Avatar */}
      <div className="mb-4">
        <AvatarCharacter variant={isFirst ? 'celebrate' : 'wave'} size={64} />
      </div>

      {/* Title */}
      <h2
        className={`font-semibold text-[20px] leading-[30px] md:text-[28px] md:leading-[36px] md:h-[36px] md:overflow-hidden ${isFirst ? 'animate-reveal-up' : ''}`}
        style={{
          ...(isFirst && { animationDelay: '800ms', animationDuration: '500ms' }),
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

      {/* Subtitle - only show for first wallet */}
      {isFirst && (
        <p
          className="text-[#73798B] text-[14px] leading-[21px] md:text-[16px] md:leading-[24px] animate-reveal-up"
          style={{
            maxWidth: '600px',
            animationDelay: '1100ms',
            animationDuration: '500ms',
          }}
        >
          {t('chat.welcome.firstWallet.subtitle')}
        </p>
      )}
    </div>
  );
}
