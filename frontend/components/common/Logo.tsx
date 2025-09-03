import { BriefcaseBusinessIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <BriefcaseBusinessIcon className={cn('h-8 w-8 text-primary-500', className)} />
  );
}