import { useEffect, useRef } from 'react';
import { Wallet as WalletIcon } from 'lucide-react';
import type { Wallet } from '../hooks/useWalletStore';

interface WalletMentionDropdownProps {
  wallets: Wallet[];
  highlightedIndex: number;
  onSelect: (index: number) => void;
  onHover: (index: number) => void;
  visible: boolean;
  language: string;
}

export default function WalletMentionDropdown({
  wallets,
  highlightedIndex,
  onSelect,
  onHover,
  visible,
  language,
}: WalletMentionDropdownProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll highlighted item into view
  useEffect(() => {
    if (!visible || !listRef.current) return;
    const items = listRef.current.querySelectorAll('[data-mention-item]');
    items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex, visible]);

  if (!visible) return null;

  return (
    <div
      ref={listRef}
      className="absolute bottom-full left-0 mb-2 bg-[var(--app-card-bg)] rounded-xl border border-[var(--app-border-medium)] shadow-lg py-1 z-50 max-h-[200px] overflow-y-auto"
      style={{ minWidth: '200px' }}
    >
      <div className="px-3 py-2 text-[12px] font-medium text-[var(--app-text-muted)]">
        {language === 'zh' ? '选择钱包' : 'Select Wallet'}
      </div>
      {wallets.length === 0 ? (
        <div className="px-3 py-2 text-[13px] text-[var(--app-text-secondary)]">
          {language === 'zh' ? '未找到匹配钱包' : 'No wallets found'}
        </div>
      ) : (
        wallets.map((w, i) => (
          <button
            key={w.id}
            data-mention-item
            onMouseDown={(e) => { e.preventDefault(); onSelect(i); }}
            onMouseEnter={() => onHover(i)}
            className={`w-full text-left px-3 py-2 text-[14px] text-[var(--app-text)] transition-colors flex items-center gap-2 ${
              i === highlightedIndex ? 'bg-[var(--app-hover-bg)]' : 'hover:bg-[var(--app-hover-bg)]'
            }`}
          >
            <WalletIcon className="w-4 h-4 text-[var(--app-accent)]" strokeWidth={1.5} />
            {w.name}
          </button>
        ))
      )}
    </div>
  );
}
