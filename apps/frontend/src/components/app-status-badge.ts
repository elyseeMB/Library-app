import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { uiStyles } from '../styles/ui';

type Variant = 'badge-success' | 'badge-warning' | 'badge-danger' | 'badge-neutral';

const STATUS_MAP: Record<string, { variant: Variant; label: string }> = {
  available: { variant: 'badge-success', label: 'Disponible' },
  borrowed: { variant: 'badge-warning', label: 'Emprunté' },
  current: { variant: 'badge-success', label: 'En cours' },
  overdue: { variant: 'badge-danger', label: 'En retard' },
  returned: { variant: 'badge-neutral', label: 'Rendu' },
};

/**
 * Pastille colorée de statut. `label` override le libellé par défaut du statut.
 */
@customElement('app-status-badge')
export class AppStatusBadge extends LitElement {
  static styles = [uiStyles];

  @property({ type: String })
  status = '';

  @property({ type: String })
  label = '';

  render(): TemplateResult {
    const { variant, label } = STATUS_MAP[this.status] ?? {
      variant: 'badge-neutral',
      label: this.status,
    };
    return html`<span class="badge ${variant}">${this.label || label}</span>`;
  }
}
