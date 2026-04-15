import { useState, ReactNode } from 'react';

interface PanelSectionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

export default function PanelSection({ title, children, defaultOpen = true }: PanelSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="panel-section">
      <button
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="uppercase tracking-widest text-[10px] text-muted-foreground">
          {title}
        </span>
        <span className="text-muted-foreground text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-3 pb-3 pt-1 space-y-2">{children}</div>}
    </div>
  );
}
