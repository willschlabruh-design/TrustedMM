import Button from './Button';
import Card from './Card';

type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
};

export default function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <Card className="text-center py-12 px-6">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-white/10 text-2xl">
        {icon ?? '📋'}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">{description}</p>
      {actionLabel && actionHref && (
        <div className="mt-6">
          <a href={actionHref}>
            <Button>{actionLabel}</Button>
          </a>
        </div>
      )}
      {actionLabel && onAction && !actionHref && (
        <div className="mt-6">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </Card>
  );
}
