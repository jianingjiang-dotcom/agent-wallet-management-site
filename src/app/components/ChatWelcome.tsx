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
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .brand-gradient {
          background: linear-gradient(135deg, #4F5EFF 0%, #7B8AFF 40%, #4F5EFF 60%, #6C7AFF 100%);
          background-size: 200% 200%;
          animation: gradient-shift 4s ease-in-out infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .shimmer-wrap {
          position: relative;
          display: inline;
          overflow: hidden;
        }
        .shimmer-wrap::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 3s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>

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
          <span className="text-[#0A0A0A]">
            {t('chat.welcome.firstWallet.title')}
          </span>
        ) : (
          <>
            <span className="text-[#0A0A0A]">
              {language === 'zh' ? 'Hi buddy，欢迎使用 ' : 'Hi buddy, welcome to '}
            </span>
            <span style={{ color: '#1c1c1c' }}>Cobo</span><span className="brand-gradient">Pact</span>
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
