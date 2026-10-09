import type { ReactNode } from 'react';

type BannerKind = 'loading' | 'success' | 'error' | 'info';

interface StatusBannerProps {
  kind: BannerKind;
  children: ReactNode;
}

export function StatusBanner({ kind, children }: StatusBannerProps) {
  return (
    <div className={`banner banner--${kind}`} role="status">
      {children}
    </div>
  );
}
