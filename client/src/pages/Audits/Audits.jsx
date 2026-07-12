import { useState } from 'react';
import AuditCyclesList from './AuditCyclesList';
import CycleDetail from './CycleDetail';

export default function Audits() {
  const [selectedCycleId, setSelectedCycleId] = useState(null);

  if (selectedCycleId) {
    return (
      <CycleDetail
        cycleId={selectedCycleId}
        onBack={() => setSelectedCycleId(null)}
      />
    );
  }

  return <AuditCyclesList onSelectCycle={setSelectedCycleId} />;
}
