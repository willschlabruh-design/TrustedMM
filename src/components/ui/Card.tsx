import { cn } from '../../lib/cn';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
};

const paddingMap = { sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' };

export default function Card({
  className,
  hover,
  padding = 'md',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'app-card',
        paddingMap[padding],
        hover && 'app-card-hover',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-white', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-slate-400 mt-1', className)} {...props}>
      {children}
    </p>
  );
}
