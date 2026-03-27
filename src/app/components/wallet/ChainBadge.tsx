import { getChainById } from '../../data/chains';

interface ChainBadgeProps {
  chainId: string;
}

export default function ChainBadge({ chainId }: ChainBadgeProps) {
  const chain = getChainById(chainId);
  if (!chain) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] font-['Inter',sans-serif] font-medium text-[11px]"
      style={{ backgroundColor: `${chain.color}14`, color: chain.color }}
    >
      <span
        className="shrink-0"
        style={{ width: 12, height: 12 }}
        dangerouslySetInnerHTML={{ __html: chain.logo.replace(/width="24"/g, 'width="12"').replace(/height="24"/g, 'height="12"') }}
      />
      {chain.shortName}
    </span>
  );
}
