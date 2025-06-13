import type { ReactNode } from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string | ReactNode;
  actions?: ReactNode;
}

export function PageTitle({ title, subtitle, actions }: PageTitleProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-4xl font-headline text-primary">{title}</h1>
        {actions && <div className="mt-4 sm:mt-0">{actions}</div>}
      </div>
      {subtitle && (
        <p className="mt-2 text-lg text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}
