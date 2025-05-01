'use client';

import { Button } from '@/components/ui/button';
import { ReloadIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

interface SubmitButtonProps {
  /** Whether the button is in a loading/pending state */
  isPending: boolean;
  /** Button text when not in pending state */
  text: string;
  /** Button text when in pending state */
  pendingText?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Function to call when button is clicked */
  onClick: () => void;
  /** Additional class names to apply to the button */
  className?: string;
}

/**
 * Submit button component with loading state
 */
export default function SubmitButton({
  isPending,
  text,
  pendingText = 'Processing...',
  disabled = false,
  onClick,
  className,
}: SubmitButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={isPending || disabled}
      className={cn("w-full", className)}
    >
      {isPending && (
        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
      )}
      {isPending ? pendingText : text}
    </Button>
  );
} 