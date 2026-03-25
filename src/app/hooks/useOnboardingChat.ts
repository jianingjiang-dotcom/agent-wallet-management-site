import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { OnboardingData, OnboardingStep } from '../components/onboarding-cards/OnboardingMessageRenderer';

export interface OnboardingMessage {
  id: string;
  role: 'user' | 'assistant' | 'onboarding';
  content: string;
  timestamp: Date;
  onboardingData?: OnboardingData;
}

type WaitingPhase = 'waiting' | 'connected' | 'configuring' | 'success';

const generateSetupToken = () =>
  'caw_tok_' + Array.from({ length: 64 }, () => Math.random().toString(36)[2] || '0').join('');
const generateShortId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export function useOnboardingChat(_isFirstWallet?: boolean) {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Internal state
  const [, setInviteCode] = useState('');
  const [walletId, setWalletId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [, setWaitingPhase] = useState<WaitingPhase>('waiting');

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const buildPromptText = useCallback(() => {
    const token = generateSetupToken();
    if (language === 'zh') {
      return `安装 Cobo Pact Skill，并用 Token 创建钱包。\nSkill：https://github.com/cobosteven/cobo-agent-wallet-manual/tree/master/skills/cobo-pact\nToken：${token}`;
    }
    return `Install Cobo Pact Skill and create a wallet with the Token.\nSkill: https://github.com/cobosteven/cobo-agent-wallet-manual/tree/master/skills/cobo-pact\nToken: ${token}`;
  }, [language]);

  const addId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  const addMessage = useCallback((msg: OnboardingMessage) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  const addUserMessage = useCallback((content: string) => {
    const msg: OnboardingMessage = {
      id: addId(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, msg]);
  }, []);

  const showTypingThenMessage = useCallback((msg: OnboardingMessage, delay = 600) => {
    setIsTyping(true);
    const tid = setTimeout(() => {
      setIsTyping(false);
      addMessage(msg);
    }, delay + Math.random() * 400);
    timersRef.current.push(tid);
  }, [addMessage]);

  // Helper: proceed to setup-command step after invite verification or directly
  const proceedToSetupCommand = useCallback(() => {
    const cmdMsg: OnboardingMessage = {
      id: addId(),
      role: 'onboarding',
      content: t('onboarding.chat.inviteVerifiedNew'),
      timestamp: new Date(),
      onboardingData: {
        step: 'setup-command',
        status: 'active',
        payload: {
          command: buildPromptText(),
        },
      },
    };
    showTypingThenMessage(cmdMsg, 600);
    setCurrentStep('setup-command');
  }, [t, buildPromptText, showTypingThenMessage]);

  // ─── Start Onboarding ───
  const startOnboarding = useCallback(() => {
    setIsActive(true);
    setMessages([]);
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // User initiates
    const userMsg: OnboardingMessage = {
      id: addId(),
      role: 'user',
      content: t('onboarding.suggestion.createWallet'),
      timestamp: new Date(),
    };
    addMessage(userMsg);

    // AI welcomes + asks for invite code
    setIsTyping(true);
    const t1 = setTimeout(() => {
      setIsTyping(false);

      const inviteMsg: OnboardingMessage = {
        id: addId(),
        role: 'onboarding',
        content: t('onboarding.chat.invitePromptNew'),
        timestamp: new Date(),
        onboardingData: { step: 'invite-code', status: 'active' },
      };
      showTypingThenMessage(inviteMsg, 600);
      setCurrentStep('invite-code');
    }, 600 + Math.random() * 400);
    timersRef.current.push(t1);
  }, [t, addMessage, showTypingThenMessage]);

  // ─── Handle Invite Code Verify (from card) ───
  const handleInviteVerify = useCallback(async (code: string) => {
    // Mock validation
    await new Promise(r => setTimeout(r, 600));
    if (code === '1111-1111') {
      setMessages(prev => prev.map(msg => {
        if (msg.onboardingData?.step === 'invite-code') {
          return { ...msg, onboardingData: { ...msg.onboardingData, status: 'error' as const, payload: { error: 'onboarding.inviteCodeInvalid' } } };
        }
        return msg;
      }));
      return;
    }
    if (code === '2222-2222') {
      setMessages(prev => prev.map(msg => {
        if (msg.onboardingData?.step === 'invite-code') {
          return { ...msg, onboardingData: { ...msg.onboardingData, status: 'error' as const, payload: { error: 'onboarding.inviteCodeUsed' } } };
        }
        return msg;
      }));
      return;
    }

    // Success — mark card completed, proceed to setup-command (no user message for card interaction)
    setInviteCode(code);

    setMessages(prev => prev.map(msg => {
      if (msg.onboardingData?.step === 'invite-code') {
        return { ...msg, onboardingData: { ...msg.onboardingData, status: 'completed' as const, payload: { verifiedCode: code } } };
      }
      return msg;
    }));

    // Directly proceed to setup command (verified text merged into command prompt)
    const t1 = setTimeout(() => {
      proceedToSetupCommand();
    }, 600);
    timersRef.current.push(t1);
  }, [proceedToSetupCommand]);

  // ─── Handle Invite Code from Chat Input ───
  const handleInviteFromChat = useCallback(async (rawInput: string) => {
    // Try to extract 8-character alphanumeric code from input
    const stripped = rawInput.replace(/^COBO-?/i, '');
    const clean = stripped.replace(/[^a-zA-Z0-9]/g, '');

    // Add user message
    addUserMessage(rawInput);

    // Immediately disable the invite-code card
    setMessages(prev => prev.map(msg => {
      if (msg.onboardingData?.step === 'invite-code' && msg.onboardingData.status !== 'completed') {
        return { ...msg, onboardingData: { ...msg.onboardingData, status: 'disabled' as const } };
      }
      return msg;
    }));

    // Check format: must be exactly 8 alphanumeric characters
    if (clean.length !== 8) {
      const errorMsg: OnboardingMessage = {
        id: addId(),
        role: 'assistant',
        content: language === 'zh'
          ? '请输入正确的 8 位邀请码（格式：XXXX-XXXX）'
          : 'Please enter a valid 8-character invite code (format: XXXX-XXXX)',
        timestamp: new Date(),
      };
      showTypingThenMessage(errorMsg, 400);
      // Re-enable the card
      setMessages(prev => prev.map(msg => {
        if (msg.onboardingData?.step === 'invite-code' && msg.onboardingData.status === 'disabled') {
          return { ...msg, onboardingData: { ...msg.onboardingData, status: 'active' as const } };
        }
        return msg;
      }));
      return;
    }

    const formatted = clean.slice(0, 4) + '-' + clean.slice(4);

    // Mock validation
    await new Promise(r => setTimeout(r, 600));

    if (formatted === '1111-1111') {
      const errorMsg: OnboardingMessage = {
        id: addId(),
        role: 'assistant',
        content: t('onboarding.inviteCodeInvalid'),
        timestamp: new Date(),
      };
      showTypingThenMessage(errorMsg, 400);
      // Re-enable the card
      setMessages(prev => prev.map(msg => {
        if (msg.onboardingData?.step === 'invite-code' && msg.onboardingData.status === 'disabled') {
          return { ...msg, onboardingData: { ...msg.onboardingData, status: 'active' as const } };
        }
        return msg;
      }));
      return;
    }
    if (formatted === '2222-2222') {
      const errorMsg: OnboardingMessage = {
        id: addId(),
        role: 'assistant',
        content: t('onboarding.inviteCodeUsed'),
        timestamp: new Date(),
      };
      showTypingThenMessage(errorMsg, 400);
      // Re-enable the card
      setMessages(prev => prev.map(msg => {
        if (msg.onboardingData?.step === 'invite-code' && msg.onboardingData.status === 'disabled') {
          return { ...msg, onboardingData: { ...msg.onboardingData, status: 'active' as const } };
        }
        return msg;
      }));
      return;
    }

    // Success
    setInviteCode(formatted);

    // Mark card as completed (from disabled)
    setMessages(prev => prev.map(msg => {
      if (msg.onboardingData?.step === 'invite-code') {
        return { ...msg, onboardingData: { ...msg.onboardingData, status: 'completed' as const, payload: { verifiedCode: formatted } } };
      }
      return msg;
    }));

    // Directly proceed to setup command (verified text is in the command prompt)
    const t1 = setTimeout(() => {
      proceedToSetupCommand();
    }, 600);
    timersRef.current.push(t1);
  }, [t, language, addUserMessage, showTypingThenMessage, proceedToSetupCommand]);

  // Helper to update setup-command message payload
  const updateSetupPayload = useCallback((update: Record<string, any>) => {
    setMessages(prev => prev.map(msg => {
      if (msg.onboardingData?.step === 'setup-command') {
        return { ...msg, onboardingData: { ...msg.onboardingData, payload: { ...msg.onboardingData.payload, ...update } } };
      }
      return msg;
    }));
  }, []);

  // ─── Handle Command Copy ───
  const handleCommandCopy = useCallback(() => {
    // Mark as copied
    updateSetupPayload({ copied: true });

    // Start pairing overlay on the setup-command card
    const tid = setTimeout(() => {
      updateSetupPayload({ pairingPhase: 'waiting' });
      setWaitingPhase('waiting');

      // Phase: connected (agent done)
      const t1 = setTimeout(() => {
        setWaitingPhase('connected');
        updateSetupPayload({ pairingPhase: 'connected' });
      }, 1200);

      // Phase: configuring (creating wallet)
      const t2 = setTimeout(() => {
        setWaitingPhase('configuring');
        updateSetupPayload({ pairingPhase: 'configuring' });
      }, 2200);

      // Phase: done
      const t3 = setTimeout(() => {
        setWaitingPhase('success');
        const wId = generateShortId();
        const aId = generateShortId();
        setWalletId(wId);
        setAgentId(aId);

        updateSetupPayload({ pairingPhase: 'done' });
        setCurrentStep('success');

        // Add a text message for the success
        const successMsg: OnboardingMessage = {
          id: addId(),
          role: 'assistant',
          content: t('onboarding.chat.walletDone'),
          timestamp: new Date(),
        };
        setIsTyping(true);
        const t4 = setTimeout(() => {
          setIsTyping(false);
          addMessage(successMsg);
        }, 500);
        timersRef.current.push(t4);
      }, 3200);

      timersRef.current.push(t1, t2, t3);
    }, 2000);
    timersRef.current.push(tid);
  }, [t, addMessage, updateSetupPayload]);

  // ─── Handle Onboarding Complete ───
  const handleComplete = useCallback(() => {
    setIsActive(false);
    return {
      walletId,
      agentId,
      policy: {
        singleTxLimit: 10,
        dailyLimit: 50,
      },
    };
  }, [walletId, agentId]);

  const resetOnboarding = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setIsActive(false);
    setMessages([]);
    setCurrentStep(null);
    setIsTyping(false);
    setInviteCode(null);
    setWaitingPhase(null);
    setWalletId(null);
    setAgentId(null);
  }, []);

  return {
    isOnboardingActive: isActive,
    onboardingMessages: messages,
    isOnboardingTyping: isTyping,
    currentStep,
    startOnboarding,
    handleInviteVerify,
    handleInviteFromChat,
    handleCommandCopy,
    handleComplete,
    resetOnboarding,
  };
}
