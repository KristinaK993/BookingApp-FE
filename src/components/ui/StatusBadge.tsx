import { cn } from '@/lib/utils';
import type { BookingStatus } from '@/types';

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const statusConfig: Record<BookingStatus, { label: string; className: string }> = {
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

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

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
