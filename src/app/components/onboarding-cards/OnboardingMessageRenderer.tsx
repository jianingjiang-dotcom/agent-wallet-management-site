import InviteCodeCard from './InviteCodeCard';
import WalletLimitsCard from './WalletLimitsCard';
import SetupCommandCard from './SetupCommandCard';
import PairingStatusCard from './PairingStatusCard';
import SuccessCard from './SuccessCard';

export type OnboardingStep =
  | 'welcome'
  | 'invite-code'
  | 'wallet-limits'
  | 'setup-command'
  | 'pairing-status'
  | 'success';

export interface OnboardingData {
  step: OnboardingStep;
  status: 'active' | 'completed' | 'error';
  payload?: Record<string, any>;
}

export interface OnboardingCallbacks {
  onInviteVerify: (code: string) => Promise<void>;
  onLimitsConfirm: (perTx: string, daily: string) => void;
  onCommandCopy: () => void;
  onCommandRefresh: () => void;
  onComplete: () => void;
}

interface Props {
  data: OnboardingData;
  callbacks: OnboardingCallbacks;
}

export default function OnboardingMessageRenderer({ data, callbacks }: Props) {
  switch (data.step) {
    case 'welcome':
      return null; // Pure text message, no card

    case 'invite-code':
      return (
        <div className="mt-3 animate-reveal-up">
          <InviteCodeCard
            status={data.status === 'error' ? 'active' : data.status}
            onVerify={callbacks.onInviteVerify}
            error={data.payload?.error}
            verifiedCode={data.payload?.verifiedCode}
          />
        </div>
      );

    case 'wallet-limits':
      return (
        <div className="mt-3 animate-reveal-up">
          <WalletLimitsCard
            status={data.status}
            onConfirm={callbacks.onLimitsConfirm}
            confirmedPerTx={data.payload?.perTx}
            confirmedDaily={data.payload?.daily}
          />
        </div>
      );

    case 'setup-command':
      return (
        <div className="mt-3 animate-reveal-up">
          <SetupCommandCard
            command={data.payload?.command || ''}
            inviteCode={data.payload?.inviteCode}
            timeRemaining={data.payload?.timeRemaining || 0}
            onCopy={callbacks.onCommandCopy}
            onRefresh={callbacks.onCommandRefresh}
            status={data.payload?.copied ? 'copied' : 'active'}
          />
        </div>
      );

    case 'pairing-status':
      return (
        <div className="mt-3 animate-reveal-up">
          <PairingStatusCard phase={data.payload?.phase || 'waiting'} />
        </div>
      );

    case 'success':
      return (
        <div className="mt-3 animate-reveal-up">
          <SuccessCard
            walletId={data.payload?.walletId || ''}
            agentId={data.payload?.agentId || ''}
            onComplete={callbacks.onComplete}
          />
        </div>
      );

    default:
      return null;
  }
}
