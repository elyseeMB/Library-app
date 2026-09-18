import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { uiStyles } from '../styles/ui';

/**
 * Navigation de pagination : émet un événement `page-change` (détail : `page`).
 */
@customElement('app-pagination')
export class AppPagination extends LitElement {
  static styles = [uiStyles];

  @property({ type: Number })
  page = 1;

  @property({ type: Number })
  totalPages = 1;

  @property({ type: Number })
  total = 0;

  private onPage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.page) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<{ page: number }>('page-change', {
        detail: { page },
        bubbles: true,
        composed: true,
      }),
    );
  }

  render(): TemplateResult {
    return html`
      <div class="pagination">
        <button class="btn btn-ghost btn-sm" ?disabled=${this.page <= 1} @click=${() => this.onPage(this.page - 1)}>
          ← Précédent
        </button>
        <span>Page ${this.page} sur ${this.totalPages} · ${this.total} résultat${this.total > 1 ? 's' : ''}</span>
        <button
          class="btn btn-ghost btn-sm"
          ?disabled=${this.page >= this.totalPages}
          @click=${() => this.onPage(this.page + 1)}
        >
          Suivant →
        </button>
      </div>
    `;
  }
}
