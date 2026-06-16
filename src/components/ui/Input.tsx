import { cn } from '../../lib/cn';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export default function Input({ label, hint, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-200">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'app-input',
          error && 'border-red-500/50 focus:border-red-400 focus:ring-red-500/20',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...props}
      />
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-slate-400">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-red-300" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
