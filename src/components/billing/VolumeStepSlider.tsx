import { useMemo } from 'react';
import { Slider } from '@/components/ui/slider';
import { formatVolumeLabel, VOLUME_STEPS } from '@/content/marketing/pricing';
import { cn } from '@/lib/utils';

type VolumeStepSliderProps = {
  stepIndex: number;
  onStepChange: (index: number) => void;
  className?: string;
  'data-testid'?: string;
};

/**
 * Discrete volume slider with tick labels aligned to the thumb
 * (same % positions as Radix: i / (n - 1)).
 */
export function VolumeStepSlider({
  stepIndex,
  onStepChange,
  className,
  'data-testid': testId = 'volume-slider',
}: VolumeStepSliderProps) {
  const last = VOLUME_STEPS.length - 1;

  const labels = useMemo(
    () => VOLUME_STEPS.map((v) => formatVolumeLabel(v)),
    [],
  );

  return (
    <div className={cn('relative', className)}>
      {/* Match half thumb width (w-4) so label centers sit under thumb centers. */}
      <div className="px-2">
        <Slider
          min={0}
          max={last}
          step={1}
          value={[stepIndex]}
          onValueChange={([value]) => onStepChange(value)}
          data-testid={testId}
        />
        <div className="relative mt-3 h-4">
          {labels.map((label, i) => (
            <button
              key={`${label}-${i}`}
              type="button"
              onClick={() => onStepChange(i)}
              className={cn(
                'absolute top-0 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] sm:text-[10px] transition-colors',
                i === stepIndex
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              style={{ left: `${last === 0 ? 0 : (i / last) * 100}%` }}
              aria-label={`Set volume to ${label}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
