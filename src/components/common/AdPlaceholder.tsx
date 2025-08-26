import { cn } from '@/lib/utils';
import { Megaphone } from 'lucide-react';

type AdPlaceholderProps = {
  className?: string;
};

export function AdPlaceholder({ className }: AdPlaceholderProps) {
  return (
    <div
      className={cn(
        'flex w-full min-h-[100px] items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 p-4 text-center',
        className
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Megaphone className="h-5 w-5" />
        <p className="text-sm font-medium">Advertisement</p>
      </div>
    </div>
  );
}
