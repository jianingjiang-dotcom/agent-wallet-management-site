import { useState, useCallback, useRef } from 'react';
import type { Wallet } from './useWalletStore';

interface MentionState {
  active: boolean;
  query: string;
  startIndex: number;
  highlightedIndex: number;
  filteredWallets: Wallet[];
}

const INITIAL_STATE: MentionState = {
  active: false,
  query: '',
  startIndex: -1,
  highlightedIndex: 0,
  filteredWallets: [],
};

export function useMentionAutocomplete(
  wallets: Wallet[],
  inputValue: string,
  setInputValue: (value: string) => void,
) {
  const [state, setState] = useState<MentionState>(INITIAL_STATE);
  const activeInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const closeMention = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const detectMention = useCallback((value: string, cursorPos: number) => {
    if (wallets.length === 0) {
      setState(INITIAL_STATE);
      return;
    }

    // Scan backward from cursor to find '@'
    let atIndex = -1;
    for (let i = cursorPos - 1; i >= 0; i--) {
      const ch = value[i];
      if (ch === '@') {
        // Valid if at start of string or preceded by whitespace
        if (i === 0 || /\s/.test(value[i - 1])) {
          atIndex = i;
        }
        break;
      }
      if (/\s/.test(ch)) {
        // Hit whitespace before finding '@' — no mention
        break;
      }
    }

    if (atIndex === -1) {
      setState(INITIAL_STATE);
      return;
    }

    const query = value.slice(atIndex + 1, cursorPos);
    const lowerQuery = query.toLowerCase();
    const filtered = wallets.filter(w =>
      w.name.toLowerCase().includes(lowerQuery)
    );

    setState(prev => ({
      active: true,
      query,
      startIndex: atIndex,
      highlightedIndex: prev.active ? Math.min(prev.highlightedIndex, Math.max(filtered.length - 1, 0)) : 0,
      filteredWallets: filtered,
    }));
  }, [wallets]);

  const selectMention = useCallback((index: number) => {
    const wallet = state.filteredWallets[index];
    if (!wallet) return;

    const before = inputValue.slice(0, state.startIndex);
    const cursorPos = state.startIndex + 1 + state.query.length;
    const after = inputValue.slice(cursorPos);
    const inserted = `@${wallet.name} `;
    const newValue = before + inserted + after;
    const newCursorPos = before.length + inserted.length;

    setInputValue(newValue);
    setState(INITIAL_STATE);

    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      const el = activeInputRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  }, [state, inputValue, setInputValue]);

  const setHighlightedIndex = useCallback((index: number) => {
    setState(prev => ({ ...prev, highlightedIndex: index }));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent): boolean => {
    if (!state.active || state.filteredWallets.length === 0) return false;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setState(prev => ({
          ...prev,
          highlightedIndex: (prev.highlightedIndex + 1) % prev.filteredWallets.length,
        }));
        return true;

      case 'ArrowUp':
        e.preventDefault();
        setState(prev => ({
          ...prev,
          highlightedIndex: (prev.highlightedIndex - 1 + prev.filteredWallets.length) % prev.filteredWallets.length,
        }));
        return true;

      case 'Enter':
      case 'Tab':
        e.preventDefault();
        selectMention(state.highlightedIndex);
        return true;

      case 'Escape':
        e.preventDefault();
        closeMention();
        return true;

      default:
        return false;
    }
  }, [state.active, state.filteredWallets.length, state.highlightedIndex, selectMention, closeMention]);

  const registerInput = useCallback((el: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (el) activeInputRef.current = el;
  }, []);

  return {
    mentionActive: state.active,
    filteredWallets: state.filteredWallets,
    highlightedIndex: state.highlightedIndex,
    detectMention,
    handleKeyDown,
    selectMention,
    setHighlightedIndex,
    closeMention,
    registerInput,
  };
}
