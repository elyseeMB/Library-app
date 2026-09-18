import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { StatsApi } from '../api/stats';
import { ApiError } from '../helpers/http';
import { uiStyles } from '../styles/ui';
import type { DashboardStats } from '../types';

/**
 * Tableau de bord : agrégats de l'API `/stats` (compteurs + tops).
 */
@customElement('dashboard-page')
export class DashboardPage extends LitElement {
  static styles = [
    uiStyles,
    css`
      .stat-value {
        margin: 0;
        font-size: 36px;
        font-weight: 700;
        letter-spacing: -1px;
      }

      .stat-label {
        margin: 0;
        color: var(--color-500);
        font-size: 14px;
      }

      .accent-green .stat-value {
        color: var(--green-500);
      }

      .accent-red .stat-value {
        color: var(--red-500);
      }

      .top-name {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--color-title);
      }

      .top-count {
        margin: 4px 0 0;
        color: var(--color-500);
        font-size: 13px;
      }
    `,
  ];

  @state()
  private stats: DashboardStats | undefined;

  @state()
  private loading = true;

  @state()
  private error = '';

  connectedCallback() {
    super.connectedCallback();
    void this.load();
  }

  async load() {
    this.loading = true;
    this.error = '';
    try {
      this.stats = await StatsApi.dashboard();
    } catch (e) {
      this.error = e instanceof ApiError ? e.message : 'Erreur inattendue';
    } finally {
      this.loading = false;
    }
  }

  render(): TemplateResult {
    if (this.loading) {
      return html`<p class="empty">Chargement des statistiques…</p>`;
    }
    if (this.error) {
      return html`<p class="alert alert-error">${this.error}</p>`;
    }

    const s = this.stats;
    if (!s) {
      return html``;
    }
    return html`
      <div class="grid">
        <div class="card">
          <p class="stat-value">${s.books}</p>
          <p class="stat-label">Livres au catalogue</p>
        </div>
        <div class="card">
          <p class="stat-value">${s.members}</p>
          <p class="stat-label">Adhérents</p>
        </div>
        <div class="card accent-green">
          <p class="stat-value">${s.loans_current}</p>
          <p class="stat-label">Emprunts en cours</p>
        </div>
        <div class="card accent-red">
          <p class="stat-value">${s.loans_overdue}</p>
          <p class="stat-label">Emprunts en retard</p>
        </div>
      </div>

      <div class="grid grid-2">
        <div class="card">
          <h2>Livre le plus emprunté</h2>
          ${
            s.most_borrowed_book
              ? html`
                <p class="top-name">${s.most_borrowed_book.title}</p>
                <p class="top-count">${s.most_borrowed_book.count} emprunt(s)</p>
              `
              : html`<p class="muted">Aucun emprunt enregistré pour l'instant.</p>`
          }
        </div>
        <div class="card">
          <h2>Adhérent le plus actif</h2>
          ${
            s.most_active_member
              ? html`
                <p class="top-name">${s.most_active_member.name}</p>
                <p class="top-count">${s.most_active_member.count} emprunt(s)</p>
              `
              : html`<p class="muted">Aucun emprunt enregistré pour l'instant.</p>`
          }
        </div>
      </div>
    `;
  }
}
