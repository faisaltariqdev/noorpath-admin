import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PortalGrid({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`portal-grid ${className}`.trim()}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="portal-page-header">
      <div>
        {eyebrow && <p className="portal-eyebrow">{eyebrow}</p>}
        <h1 className="portal-page-title">{title}</h1>
        {description && <p className="portal-page-description">{description}</p>}
      </div>
      {actions && <div className="portal-page-actions">{actions}</div>}
    </header>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  tone = "green",
}: {
  label: string;
  value: ReactNode;
  helper?: string;
  icon: LucideIcon;
  tone?: "green" | "blue" | "gold" | "violet" | "red";
}) {
  return (
    <article className="portal-metric-card">
      <div className={`portal-metric-icon portal-metric-icon--${tone}`}>
        <Icon size={18} aria-hidden="true" />
      </div>
      <div>
        <p className="portal-metric-label">{label}</p>
        <p className="portal-metric-value">{value}</p>
        {helper && <p className="portal-metric-helper">{helper}</p>}
      </div>
    </article>
  );
}

export function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`portal-section-card ${className}`.trim()}>
      <header className="portal-section-header">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </header>
      <div className="portal-section-body">{children}</div>
    </section>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="portal-state" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="portal-state">
      <span className="portal-empty-icon"><Icon size={20} aria-hidden="true" /></span>
      <strong>{title}</strong>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  return <span className={`portal-status portal-status--${tone}`}>{children}</span>;
}
