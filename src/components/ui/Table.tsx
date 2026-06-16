import { cn } from '../../lib/cn';

export function Table({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('app-table-wrap overflow-x-auto', className)} {...props}>
      <table className="app-table w-full">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return <thead className="app-table-head">{children}</thead>;
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TR({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn('app-table-row', className)}>{children}</tr>;
}

export function TH({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn('app-table-th', className)} scope="col">
      {children}
    </th>
  );
}

export function TD({ children, className }: { children: React.ReactNode; className?: string }) {
  return <td className={cn('app-table-td', className)}>{children}</td>;
}
