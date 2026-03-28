import PactApprovalCard from './PactApprovalCard';
import PactModifyCard from './PactModifyCard';
import type { PactApproval } from '../../data/mockPacts';

export interface PactCallbacks {
  onApprove: (pactId: string) => void;
  onReject: (pactId: string) => void;
  onModify: (pactId: string) => void;
  onSelectModifications: (pactId: string, selections: string[]) => void;
  onSubmitValues: (pactId: string, modifications: Record<string, string>) => void;
  onConfirmModified: (pactId: string) => void;
}

interface PactApprovalData {
  pactId: string;
  status: 'pending' | 'approved' | 'rejected' | 'modified';
}

interface PactModifyData {
  pactId: string;
  step: 'select-what' | 'input-values' | 'confirm';
  selections?: string[];
  modifications?: Record<string, string>;
  status: 'active' | 'completed';
}

interface PactMessageRendererProps {
  pactApprovalData?: PactApprovalData;
  pactModifyData?: PactModifyData;
  pact?: PactApproval;
  callbacks: PactCallbacks;
}

export default function PactMessageRenderer({
  pactApprovalData,
  pactModifyData,
  pact,
  callbacks,
}: PactMessageRendererProps) {
  if (!pact) return null;

  if (pactApprovalData) {
    return (
      <div className="mt-3 animate-reveal-up">
        <PactApprovalCard
          pact={pact}
          status={pactApprovalData.status}
          onApprove={callbacks.onApprove}
          onReject={callbacks.onReject}
          onModify={callbacks.onModify}
        />
      </div>
    );
  }

  if (pactModifyData) {
    return (
      <div className="mt-3 animate-reveal-up">
        <PactModifyCard
          pact={pact}
          step={pactModifyData.step}
          cardStatus={pactModifyData.status}
          selections={pactModifyData.selections}
          modifications={pactModifyData.modifications}
          onSelectModifications={callbacks.onSelectModifications}
          onSubmitValues={callbacks.onSubmitValues}
          onConfirmModified={callbacks.onConfirmModified}
        />
      </div>
    );
  }

  return null;
}
