import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { OnboardingData, OnboardingStep } from '../components/onboarding-cards/OnboardingMessageRenderer';

const API_URL = 'https://api-agent-wallet-core.sandbox.cobo.com';

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

export function useOnboardingChat(isFirstWallet: boolean) {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Internal state
  const [inviteCode, setInviteCode] = useState('');
  const [perTxLimit, setPerTxLimit] = useState('10');
  const [dailyLimit, setDailyLimit] = useState('50');
  const [setupToken, setSetupToken] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [walletId, setWalletId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const [waitingPhase, setWaitingPhase] = useState<WaitingPhase>('waiting');

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Countdown timer for setup command
  useEffect(() => {
    if (currentStep !== 'setup-command' || timeRemaining <= 0) return;
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          const newToken = generateSetupToken();
          setSetupToken(newToken);
          updateCommandMessage(newToken, 15 * 60);
          return 15 * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // Sync timeRemaining into setup-command message payload
  useEffect(() => {
    if (currentStep !== 'setup-command') return;
    setMessages(prev => prev.map(msg => {
      if (msg.onboardingData?.step === 'setup-command' && msg.onboardingData.status === 'active') {
        return {
          ...msg,
          onboardingData: {
            ...msg.onboardingData,
            payload: { ...msg.onboardingData.payload, timeRemaining },
          },
        };
      }
      return msg;
    }));
  }, [timeRemaining, currentStep]);

  const updateCommandMessage = (token: string, time: number) => {
    setMessages(prev => prev.map(msg => {
      if (msg.onboardingData?.step === 'setup-command') {
        return {
          ...msg,
          onboardingData: {
            ...msg.onboardingData,
            payload: {
              ...msg.onboardingData.payload,
              command: buildPromptText(token),
              timeRemaining: time,
            },
          },
        };
      }
      return msg;
    }));
  };

  const buildPromptText = useCallback((token?: string) => {
    const tok = token || setupToken;
    const cmdSuffix = isFirstWallet && inviteCode ? ` --COBO-${inviteCode}` : '';
    if (language === 'zh') {
      return `请帮我配置 Cobo Pact，按以下步骤执行：

1. 安装 CLI 工具（如果没安装）：
pip install /path/to/cobo-agent-wallet/sdk

2. 运行配对命令：
caw --api-url ${API_URL} onboard provision${cmdSuffix} --token ${tok}`;
    }
    return `Please help me set up Cobo Pact by following these steps:

1. Install the CLI tool (if not installed):
pip install /path/to/cobo-agent-wallet/sdk

2. Run the pairing command:
caw --api-url ${API_URL} onboard provision${cmdSuffix} --token ${tok}`;
  }, [language, setupToken, isFirstWallet, inviteCode]);

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
      content: language === 'zh' ? '我想创建一个 Cobo Pact 钱包' : 'I want to create a Cobo Pact wallet',
      timestamp: new Date(),
    };
    addMessage(userMsg);

    // AI welcomes
    const welcomeMsg: OnboardingMessage = {
      id: addId(),
      role: 'assistant',
      content: t('onboarding.chat.welcome'),
      timestamp: new Date(),
    };
    setIsTyping(true);
    const t1 = setTimeout(() => {
      setIsTyping(false);
      addMessage(welcomeMsg);

      if (isFirstWallet) {
        const inviteMsg: OnboardingMessage = {
          id: addId(),
          role: 'onboarding',
          content: t('onboarding.chat.invitePrompt'),
          timestamp: new Date(),
          onboardingData: { step: 'invite-code', status: 'active' },
        };
        showTypingThenMessage(inviteMsg, 600);
        setCurrentStep('invite-code');
      } else {
        const limitsMsg: OnboardingMessage = {
          id: addId(),
          role: 'onboarding',
          content: t('onboarding.chat.limitsPrompt'),
          timestamp: new Date(),
          onboardingData: { step: 'wallet-limits', status: 'active' },
        };
        showTypingThenMessage(limitsMsg, 600);
        setCurrentStep('wallet-limits');
      }
    }, 600 + Math.random() * 400);
    timersRef.current.push(t1);
  }, [isFirstWallet, t, language, addMessage, showTypingThenMessage]);

  // ─── Handle Invite Code Verify ───
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

    // Success — add user message, then mark card completed, then AI responds
    setInviteCode(code);
    addUserMessage(`COBO-${code}`);

    setMessages(prev => prev.map(msg => {
      if (msg.onboardingData?.step === 'invite-code') {
        return { ...msg, onboardingData: { ...msg.onboardingData, status: 'completed' as const, payload: { verifiedCode: code } } };
      }
      return msg;
    }));

    // AI responds with limits step
    const limitsMsg: OnboardingMessage = {
      id: addId(),
      role: 'onboarding',
      content: t('onboarding.chat.limitsPrompt'),
      timestamp: new Date(),
      onboardingData: { step: 'wallet-limits', status: 'active' },
    };
    showTypingThenMessage(limitsMsg, 600);
    setCurrentStep('wallet-limits');
  }, [t, addUserMessage, showTypingThenMessage]);

  // ─── Handle Limits Confirm ───
  const handleLimitsConfirm = useCallback((perTx: string, daily: string) => {
    setPerTxLimit(perTx);
    setDailyLimit(daily);

    // User message
    addUserMessage(
      language === 'zh'
        ? `单笔限额 $${perTx}，每日限额 $${daily}`
        : `Per-tx limit $${perTx}, daily limit $${daily}`
    );

    // Mark card completed
    setMessages(prev => prev.map(msg => {
      if (msg.onboardingData?.step === 'wallet-limits') {
        return { ...msg, onboardingData: { ...msg.onboardingData, status: 'completed' as const, payload: { perTx, daily } } };
      }
      return msg;
    }));

    // Generate token and AI responds with setup command
    const token = generateSetupToken();
    setSetupToken(token);
    setTimeRemaining(15 * 60);

    const cmdMsg: OnboardingMessage = {
      id: addId(),
      role: 'onboarding',
      content: t('onboarding.chat.commandPrompt'),
      timestamp: new Date(),
      onboardingData: {
        step: 'setup-command',
        status: 'active',
        payload: {
          command: (() => {
            const cmdSuffix = isFirstWallet && inviteCode ? ` --COBO-${inviteCode}` : '';
            if (language === 'zh') {
              return `请帮我配置 Cobo Pact，按以下步骤执行：

1. 安装 CLI 工具（如果没安装）：
pip install /path/to/cobo-agent-wallet/sdk

2. 运行配对命令：
caw --api-url ${API_URL} onboard provision${cmdSuffix} --token ${token}`;
            }
            return `Please help me set up Cobo Pact by following these steps:

1. Install the CLI tool (if not installed):
pip install /path/to/cobo-agent-wallet/sdk

2. Run the pairing command:
caw --api-url ${API_URL} onboard provision${cmdSuffix} --token ${token}`;
          })(),
          inviteCode: isFirstWallet ? inviteCode : undefined,
          timeRemaining: 15 * 60,
        },
      },
    };
    showTypingThenMessage(cmdMsg, 600);
    setCurrentStep('setup-command');
  }, [t, language, isFirstWallet, inviteCode, addUserMessage, showTypingThenMessage]);

  // ─── Handle Command Copy ───
  const handleCommandCopy = useCallback(() => {
    // Mark as copied
    setMessages(prev => prev.map(msg => {
      if (msg.onboardingData?.step === 'setup-command') {
        return { ...msg, onboardingData: { ...msg.onboardingData, status: 'completed' as const, payload: { ...msg.onboardingData.payload, copied: true } } };
      }
      return msg;
    }));

    // Directly start pairing
    const tid = setTimeout(() => {
      const pairingMsg: OnboardingMessage = {
        id: addId(),
        role: 'onboarding',
        content: t('onboarding.chat.pairingWaiting'),
        timestamp: new Date(),
        onboardingData: {
          step: 'pairing-status',
          status: 'active',
          payload: { phase: 'waiting' },
        },
      };
      addMessage(pairingMsg);
      setCurrentStep('pairing-status');
      setWaitingPhase('waiting');

      // Simulate pairing phases
      const t1 = setTimeout(() => {
        setWaitingPhase('connected');
        setMessages(prev => prev.map(msg => {
          if (msg.onboardingData?.step === 'pairing-status') {
            return { ...msg, onboardingData: { ...msg.onboardingData, payload: { phase: 'connected' } } };
          }
          return msg;
        }));
      }, 1200);

      const t2 = setTimeout(() => {
        setWaitingPhase('configuring');
        setMessages(prev => prev.map(msg => {
          if (msg.onboardingData?.step === 'pairing-status') {
            return { ...msg, onboardingData: { ...msg.onboardingData, payload: { phase: 'configuring' } } };
          }
          return msg;
        }));
      }, 2200);

      const t3 = setTimeout(() => {
        setWaitingPhase('success');
        const wId = generateShortId();
        const aId = generateShortId();
        setWalletId(wId);
        setAgentId(aId);

        setMessages(prev => prev.map(msg => {
          if (msg.onboardingData?.step === 'pairing-status') {
            return { ...msg, onboardingData: { ...msg.onboardingData, status: 'completed' as const, payload: { phase: 'success' } } };
          }
          return msg;
        }));

        // AI shows success card
        const successMsg: OnboardingMessage = {
          id: addId(),
          role: 'onboarding',
          content: t('onboarding.chat.successMessage'),
          timestamp: new Date(),
          onboardingData: {
            step: 'success',
            status: 'active',
            payload: { walletId: wId, agentId: aId },
          },
        };

        setIsTyping(true);
        const t4 = setTimeout(() => {
          setIsTyping(false);
          addMessage(successMsg);
          setCurrentStep('success');
        }, 500);
        timersRef.current.push(t4);
      }, 3200);

      timersRef.current.push(t1, t2, t3);
    }, 2000);
    timersRef.current.push(tid);
  }, [t, language, addMessage, addUserMessage]);

  // ─── Handle Token Refresh ───
  const handleCommandRefresh = useCallback(() => {
    const newToken = generateSetupToken();
    setSetupToken(newToken);
    setTimeRemaining(15 * 60);
    updateCommandMessage(newToken, 15 * 60);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Handle Onboarding Complete ───
  const handleComplete = useCallback(() => {
    setIsActive(false);
    return {
      walletId,
      agentId,
      policy: {
        singleTxLimit: Number(perTxLimit),
        dailyLimit: Number(dailyLimit),
      },
    };
  }, [walletId, agentId, perTxLimit, dailyLimit]);

  return {
    isOnboardingActive: isActive,
    onboardingMessages: messages,
    isOnboardingTyping: isTyping,
    startOnboarding,
    handleInviteVerify,
    handleLimitsConfirm,
    handleCommandCopy,
    handleCommandRefresh,
    handleComplete,
  };
}
