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
      <div className="mb-4">
        <AvatarCharacter variant={isFirst ? 'celebrate' : 'wave'} size={64} />
      </div>

      {/* Title */}
      <h2
        className={`font-semibold text-[#0A0A0A] ${isFirst ? 'animate-reveal-up' : ''}`}
        style={{
          fontSize: '28px',
          lineHeight: '42px',
          marginBottom: '8px',
          ...(isFirst && { animationDelay: '800ms', animationDuration: '500ms' }),
        }}
      >
        {t(isFirst ? 'chat.welcome.firstWallet.title' : 'chat.welcome.returning.title')}
      </h2>

      {/* Subtitle */}
      <p
        className={`text-[#73798B] ${isFirst ? 'animate-reveal-up' : ''}`}
        style={{
          fontSize: '16px',
          lineHeight: '24px',
          maxWidth: '600px',
          ...(isFirst && { animationDelay: '1100ms', animationDuration: '500ms' }),
        }}
      >
        {t(isFirst ? 'chat.welcome.firstWallet.subtitle' : 'chat.welcome.returning.subtitle')}
      </p>
    </div>
  );
}
