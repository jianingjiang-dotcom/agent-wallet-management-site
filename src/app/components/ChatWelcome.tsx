import { useLanguage } from '../contexts/LanguageContext';
import AvatarCharacter from './AvatarCharacter';

interface ChatWelcomeProps {
  variant: 'first-wallet' | 'returning';
}

export default function ChatWelcome({ variant }: ChatWelcomeProps) {
  const { t } = useLanguage();
  const isFirst = variant === 'first-wallet';

  return (
    <div className="flex flex-col items-center text-center mb-8" style={{ paddingTop: '8px' }}>
      {/* Avatar */}
      <div className="mb-6">
        <AvatarCharacter variant={isFirst ? 'celebrate' : 'wave'} size={64} />
      </div>

      {/* Title */}
      <h2
        className={`font-semibold text-[#0A0A0A] ${isFirst ? 'animate-reveal-up' : ''}`}
        style={{
          fontSize: '28px',
          lineHeight: '36px',
          marginBottom: '8px',
          ...(isFirst && { animationDelay: '800ms', animationDuration: '500ms' }),
        }}
      >
        {t(isFirst ? 'chat.welcome.firstWallet.title' : 'chat.welcome.returning.title')}
      </h2>

      {/* Subtitle */}
      <p
        className={`text-[#4F4F4F] ${isFirst ? 'animate-reveal-up' : ''}`}
        style={{
          fontSize: '15px',
          lineHeight: '22px',
          maxWidth: '420px',
          ...(isFirst && { animationDelay: '1100ms', animationDuration: '500ms' }),
        }}
      >
        {t(isFirst ? 'chat.welcome.firstWallet.subtitle' : 'chat.welcome.returning.subtitle')}
      </p>
    </div>
  );
}
