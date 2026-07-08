import type { ReactElement } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DisabledWithTooltipProps {
  tooltip: string;
  children: ReactElement;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function DisabledWithTooltip({
  tooltip,
  children,
  side = 'bottom',
}: DisabledWithTooltipProps) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-not-allowed items-center">{children}</span>
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs text-center">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
