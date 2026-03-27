import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const API_URL = 'https://api-agent-wallet-core.sandbox.cobo.com';

export type PairingPhase = 'idle' | 'waiting' | 'connected' | 'configuring' | 'success';

const generateSetupToken = () =>
  'caw_tok_' + Array.from({ length: 64 }, () => Math.random().toString(36)[2] || '0').join('');
const generateShortId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function useOnboardingFlow() {
  const { language } = useLanguage();

  // Step 1: Invite code
  const [inviteCode, setInviteCode] = useState('');

  // Step 2: Setup command + pairing
  const [setupToken, setSetupToken] = useState(() => generateSetupToken());
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [pairingPhase, setPairingPhase] = useState<PairingPhase>('idle');
  const [timerActive, setTimerActive] = useState(false);

  // Step 3: Results
  const [walletId, setWalletId] = useState('');
  const [agentId, setAgentId] = useState('');

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return;
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Auto-refresh token
          const newToken = generateSetupToken();
          setSetupToken(newToken);
          return 15 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerActive]);

  // Build command text
  const buildCommand = useCallback((token?: string) => {
    const tok = token || setupToken;
    const cmdSuffix = inviteCode ? ` --COBO-${inviteCode}` : '';
    if (language === 'zh') {
      return `安装 Cobo Pact Skill，并用 Token 创建钱包。
Skill：https://github.com/cobosteven/cobo-agent-wallet-manual/tree/master/skills/cobo-pact
Token：${tok}`;
    }
    return `Install Cobo Pact Skill and create a wallet with the Token.
Skill: https://github.com/cobosteven/cobo-agent-wallet-manual/tree/master/skills/cobo-pact
Token: ${tok}`;
  }, [language, setupToken, inviteCode]);

  // Start timer when entering step 2
  const activateTimer = useCallback(() => {
    setTimerActive(true);
  }, []);

  // Validate invite code
  const validateInviteCode = useCallback(async (code: string): Promise<'valid' | 'invalid' | 'used'> => {
    await new Promise(r => setTimeout(r, 600));
    if (code === '1111-1111') return 'invalid';
    if (code === '2222-2222') return 'used';
    setInviteCode(code);
    return 'valid';
  }, []);

  // Refresh token
  const refreshToken = useCallback(() => {
    const newToken = generateSetupToken();
    setSetupToken(newToken);
    setTimeRemaining(15 * 60);
  }, []);

  // Start pairing simulation
  const startPairing = useCallback(() => {
    if (pairingPhase !== 'idle') return;
    setPairingPhase('waiting');

    const t1 = setTimeout(() => {
      setPairingPhase('connected');
    }, 1200);

    const t2 = setTimeout(() => {
      setPairingPhase('configuring');
    }, 2200);

    const t3 = setTimeout(() => {
      const wId = generateShortId();
      const aId = generateShortId();
      setWalletId(wId);
      setAgentId(aId);
      setPairingPhase('success');
    }, 3200);

    timersRef.current.push(t1, t2, t3);
  }, [pairingPhase]);

  return {
    // Step 1
    inviteCode,
    validateInviteCode,

    // Step 2
    setupToken,
    command: buildCommand(),
    timeRemaining,
    timerActive,
    activateTimer,
    refreshToken,
    startPairing,
    pairingPhase,

    // Step 3
    walletId,
    agentId,
  };
}
