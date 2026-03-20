interface AvatarCharacterProps {
  variant: 'celebrate' | 'wave';
  size?: number;
}

export default function AvatarCharacter({ variant, size = 64 }: AvatarCharacterProps) {
  const isCelebrate = variant === 'celebrate';

  return (
    <div
      className={isCelebrate ? 'animate-avatar-enter' : undefined}
      style={{ width: size, height: size }}
    >
      <div className={!isCelebrate ? 'animate-head-idle' : undefined}>
        <svg
          viewBox="0 0 80 80"
          width={size}
          height={size}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Body: rounded square with gradient, no outer shadow */}
          <defs>
            <linearGradient id="avatar-bg" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6c7aff" />
              <stop offset="100%" stopColor="#4f5eff" />
            </linearGradient>
          </defs>
          <rect
            x="4" y="4" width="72" height="72" rx="20" ry="20"
            fill="url(#avatar-bg)"
          />

          {/* Eyes group */}
          <g className={isCelebrate ? 'animate-eyes-look' : 'animate-eyes-look-loop'}>
            {/* Normal round eyes */}
            <circle
              cx="29" cy="35" r="4.5"
              fill="white"
              className={isCelebrate ? 'animate-fade-out-normal' : undefined}
            />
            <circle
              cx="51" cy="35" r="4.5"
              fill="white"
              className={isCelebrate ? 'animate-fade-out-normal' : undefined}
            />

            {/* Happy crescent eyes — celebrate: hidden initially, fades in */}
            {isCelebrate && (
              <>
                <path
                  d="M23.5 34 C25.5 29, 32.5 29, 34.5 34"
                  stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"
                  opacity="0" className="animate-fade-in-happy"
                />
                <path
                  d="M45.5 34 C47.5 29, 54.5 29, 56.5 34"
                  stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"
                  opacity="0" className="animate-fade-in-happy"
                />
              </>
            )}

            {/* Wave variant: always show happy crescents */}
            {!isCelebrate && (
              <>
                <path
                  d="M23.5 34 C25.5 29, 32.5 29, 34.5 34"
                  stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"
                />
                <path
                  d="M45.5 34 C47.5 29, 54.5 29, 56.5 34"
                  stroke="white" strokeWidth="3" strokeLinecap="round" fill="none"
                />
              </>
            )}
          </g>

          {/* Mouth */}
          {isCelebrate ? (
            <>
              <path
                d="M32 48 Q40 53 48 48"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"
                className="animate-fade-out-mouth"
              />
              <path
                d="M28 46 Q40 58 52 46"
                stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"
                opacity="0" className="animate-fade-in-smile"
              />
            </>
          ) : (
            <path
              d="M28 46 Q40 58 52 46"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"
            />
          )}
        </svg>
      </div>
    </div>
  );
}
