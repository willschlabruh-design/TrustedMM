import Badge, { tradeStatusVariant } from '../ui/Badge';

const STATUS_LABELS: Record<string, string> = {
  WAITING_FOR_MIDDLEMEN: 'Pending',
  PENDING: 'Pending',
  ACTIVE: 'Active',
  IN_VERIFICATION: 'Verification',
  IN_ESCROW: 'Escrow',
  COMPLETED: 'Completed',
  DISPUTED: 'Disputed',
};

export default function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status.toUpperCase()] || status.replace(/_/g, ' ');
  return <Badge variant={tradeStatusVariant(status)}>{label}</Badge>;
}
