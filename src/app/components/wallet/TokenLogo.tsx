import { getTokenById } from '../../data/tokens';
import { getChainById } from '../../data/chains';

interface TokenLogoProps {
  tokenId: string;
  chainId: string;
  size?: number;
}

export default function TokenLogo({ tokenId, chainId, size = 32 }: TokenLogoProps) {
  const token = getTokenById(tokenId);
  const chain = getChainById(chainId);

  const badgeSize = Math.round(size * 0.45);
  const badgeOffset = -Math.round(badgeSize * 0.15);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {token && (
        <div
          style={{ width: size, height: size }}
          dangerouslySetInnerHTML={{ __html: token.logo.replace(/width="24"/, `width="${size}"`).replace(/height="24"/, `height="${size}"`) }}
        />
      )}
      {chain && (
        <div
          className="absolute rounded-full bg-white border border-white"
          style={{ width: badgeSize, height: badgeSize, bottom: badgeOffset, right: badgeOffset }}
          dangerouslySetInnerHTML={{ __html: chain.logo.replace(/width="24"/, `width="${badgeSize}"`).replace(/height="24"/, `height="${badgeSize}"`) }}
        />
      )}
    </div>
  );
}
