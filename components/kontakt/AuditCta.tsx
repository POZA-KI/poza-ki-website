'use client';

import type { ReactNode } from 'react';
import { oeffneAudit } from './dialogStore';

/**
 * Jeder Audit-CTA der Seite. Bewusst ein <button>: Das Ziel ist ein Dialog,
 * keine Adresse — ein <a href="#kontakt"> waere hier gelogen.
 */
export default function AuditCta({
  children,
  className = 'btn btn--primary',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button type="button" className={className} onClick={oeffneAudit}>
      {children}
    </button>
  );
}
