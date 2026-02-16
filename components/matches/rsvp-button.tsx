/**
 * RSVP Button Component
 * Three-state button for IN/OUT/Maybe responses
 */

'use client';

import { Check, X, HelpCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RSVPStatus } from '@/hooks/use-rsvps';

interface RSVPButtonProps {
  currentStatus: RSVPStatus | null;
  onChange: (status: RSVPStatus) => void;
  disabled?: boolean;
  isLoading?: boolean;
  labels?: {
    in: string;
    out: string;
    maybe: string;
  };
}

export function RSVPButton({ 
  currentStatus, 
  onChange, 
  disabled,
  isLoading,
  labels = { in: 'Ci sono!', out: 'Non posso', maybe: 'Forse' }
}: RSVPButtonProps) {
  const buttons: { status: RSVPStatus; label: string; icon: React.ReactNode; colors: string }[] = [
    {
      status: 'in',
      label: labels.in,
      icon: <Check className="h-4 w-4" />,
      colors: 'bg-green-600 hover:bg-green-700 text-white border-green-600'
    },
    {
      status: 'out',
      label: labels.out,
      icon: <X className="h-4 w-4" />,
      colors: 'bg-red-600 hover:bg-red-700 text-white border-red-600'
    },
    {
      status: 'maybe',
      label: labels.maybe,
      icon: <HelpCircle className="h-4 w-4" />,
      colors: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500'
    }
  ];

  return (
    <div className="flex w-full gap-2">
      {buttons.map(({ status, label, icon, colors }) => {
        const isSelected = currentStatus === status;
        const isSubmitting = isLoading && isSelected;
        
        return (
          <Button
            key={status}
            type="button"
            variant="outline"
            disabled={disabled || isLoading}
            onClick={() => onChange(status)}
            className={cn(
              'flex-1 min-h-[48px] text-sm font-medium transition-all',
              isSelected ? colors : 'bg-background hover:bg-muted',
              isSelected ? 'border-2' : 'border'
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span className="mr-2">{icon}</span>
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">
                  {status === 'in' ? 'Sì' : status === 'out' ? 'No' : '?'}
                </span>
              </>
            )}
          </Button>
        );
      })}
    </div>
  );
}

/**
 * Compact RSVP Button for list items
 */
interface CompactRSVPButtonProps {
  status: RSVPStatus;
  onChange: (status: RSVPStatus) => void;
  disabled?: boolean;
}

export function CompactRSVPButton({ status, onChange, disabled }: CompactRSVPButtonProps) {
  const statusConfig = {
    in: { icon: Check, color: 'text-green-600 bg-green-50 border-green-200' },
    out: { icon: X, color: 'text-red-600 bg-red-50 border-red-200' },
    maybe: { icon: HelpCircle, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <button
      onClick={() => onChange(status)}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        config.color,
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <Icon className="h-3 w-3" />
      {status === 'in' ? 'Ci sono' : status === 'out' ? 'Non posso' : 'Forse'}
    </button>
  );
}
