import InviteCodeCard from './InviteCodeCard';
import SetupCommandCard from './SetupCommandCard';

export type OnboardingStep =
  | 'welcome'
  | 'invite-code'
  | 'setup-command'
  | 'pairing-status'
  | 'success';

export interface OnboardingData {
  step: OnboardingStep;
  status: 'active' | 'completed' | 'error' | 'disabled';
  payload?: Record<string, any>;
}

export interface OnboardingCallbacks {
  onInviteVerify: (code: string) => Promise<void>;
  onCommandCopy: () => void;
  onComplete: () => void;
}

interface Props {
  data: OnboardingData;
  callbacks: OnboardingCallbacks;
}

export default function OnboardingMessageRenderer({ data, callbacks }: Props) {
  switch (data.step) {
    case 'welcome':
      return null;

    case 'invite-code':
      return (
        <div className="mt-3 animate-reveal-up lg:pl-[20px]">
          <InviteCodeCard
            status={data.status === 'error' ? 'active' : data.status === 'disabled' ? 'disabled' : data.status}
            onVerify={callbacks.onInviteVerify}
            error={data.payload?.error}
            verifiedCode={data.payload?.verifiedCode}
          />
        </div>
      );

    case 'setup-command':
      return (
        <div className="mt-3 animate-reveal-up lg:pl-[20px]">
          <SetupCommandCard
            command={data.payload?.command || ''}
            onCopy={callbacks.onCommandCopy}
            status={data.payload?.copied ? 'copied' : 'active'}
            pairingPhase={data.payload?.pairingPhase || null}
          />
        </div>
      );

    default:
      return null;
  }
}
