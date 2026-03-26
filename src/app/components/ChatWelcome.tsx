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
        className={`font-semibold text-[22px] sm:text-[28px] lg:text-[36px] text-[#0A0A0A] text-center leading-tight ${isFirst ? 'animate-reveal-up' : ''}`}
        style={{
          ...(isFirst && { animationDelay: '800ms', animationDuration: '500ms' }),
        }}
      >
        {isFirst ? (
          <span className="text-[#0A0A0A]">
            {t('chat.welcome.firstWallet.title')}
          </span>
        ) : (
          <>
            <span className="text-[#0A0A0A]">
              {language === 'zh' ? 'Hi buddy，欢迎使用 ' : 'Hi buddy, welcome to '}
            </span>
            <span className="font-space-grotesk" style={{ color: '#1c1c1c' }}>Cobo</span><span className="font-space-grotesk" style={{ color: '#1F32D6' }}>Pact</span>
          </>
        )}
      </h2>

      {/* Subtitle - only show for first wallet */}
      {isFirst && (
        <p
          className="text-[#7C7C7C] text-[14px] leading-[21px] md:text-[16px] md:leading-[24px] animate-reveal-up"
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
