import { cn } from '@/lib/utils';
import type { BookingStatus } from '@/types';

interface StatusBadgeProps {
  status?: BookingStatus | string;   // status kan vara undefined
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  Booked: {
    label: 'Bokad',
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  Completed: {
    label: 'Slutförd',
    className: 'bg-success/10 text-success border-success/20',
  },
  Cancelled: {
    label: 'Avbokad',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
};

// fallback om status är undefined eller okänd
const DEFAULT_STATUS = statusConfig['Booked'];

export function StatusBadge({ status, className }: StatusBadgeProps) {
 
  const config = statusConfig[status ?? ''] ?? DEFAULT_STATUS;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
