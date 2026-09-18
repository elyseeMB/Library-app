import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { BooksApi } from '../api/books';
import { LoansApi } from '../api/loans';
import { MembersApi } from '../api/members';
import { ApiError } from '../helpers/http';
import { uiStyles } from '../styles/ui';
import type { Book, Loan, LoanFilter, Member } from '../types';

/**
 * Emprunts : onglets "En cours" / "En retard", retour d'un emprunt et création (drawer).
 */
@customElement('loans-page')
export class LoansPage extends LitElement {
  static styles = [
    uiStyles,
    css`
      .tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 20px;
      }

      .tab-btn {
        padding: 8px 16px;
        border: 1px solid var(--separator, #edeff2);
        border-radius: 999px;
        background: transparent;
        color: var(--color-500, #6d7380);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
      }

      .tab-btn[aria-selected='true'] {
        background: var(--accent, #683ffc);
        border-color: var(--accent, #683ffc);
        color: #fff;
      }

      .due-overdue {
        color: var(--red-500);
        font-weight: 600;
      }
    `,
  ];

  @state()
  private filter: LoanFilter = 'current';

  @state()
  private loans: Loan[] = [];

  @state()
  private loading = true;

  @state()
  private error = '';

  @state()
  private actionError = '';

  @state()
  private returningId = '';

  @state()
  private returningError = '';

  @state()
  private createOpen = false;

  @state()
  private members: Member[] = [];

  @state()
  private availableBooks: Book[] = [];

  @state()
  private memberId = '';

  @state()
  private bookId = '';

  @state()
  private dueDate = '';

  @state()
  private createError = '';

  @state()
  private creating = false;

  connectedCallback() {
    super.connectedCallback();
    void this.load();
    void this.loadOptions();
  }

  async loadOptions() {
    try {
      const [members, books] = await Promise.all([MembersApi.list(), BooksApi.list()]);
      this.members = members;
      this.availableBooks = books.filter((book) => book.status === 'available');
    } catch {
      this.members = [];
      this.availableBooks = [];
    }
  }

  async load() {
    this.loading = true;
    this.error = '';
    try {
      this.loans = await LoansApi.list({ filter: this.filter });
    } catch (e) {
      this.error = e instanceof ApiError ? e.message : 'Erreur inattendue';
    } finally {
      this.loading = false;
    }
  }

  async switchFilter(filter: LoanFilter) {
    if (filter === this.filter) {
      return;
    }
    this.filter = filter;
    this.actionError = '';
    await this.load();
  }

  async returnLoan(loan: Loan) {
    this.returningId = loan.id;
    this.returningError = '';
    try {
      await LoansApi.return(loan.id);
      this.actionError = '';
      await this.load();
    } catch (e) {
      this.returningError = e instanceof ApiError ? e.message : 'Erreur inattendue';
    } finally {
      this.returningId = '';
    }
  }

  openCreate() {
    this.memberId = '';
    this.bookId = '';
    this.dueDate = '';
    this.createError = '';
    this.createOpen = true;
  }

  onMember(event: Event) {
    this.memberId = (event.target as HTMLSelectElement).value;
  }

  onBook(event: Event) {
    this.bookId = (event.target as HTMLSelectElement).value;
  }

  onDueDate(event: Event) {
    this.dueDate = (event.target as HTMLInputElement).value;
  }

  async createLoan() {
    if (!this.memberId || !this.bookId || !this.dueDate) {
      this.createError = 'Adhérent, livre et date de retour sont requis.';
      return;
    }

    this.creating = true;
    this.createError = '';
    try {
      await LoansApi.store({
        member_id: this.memberId,
        book_id: this.bookId,
        due_date: new Date(this.dueDate).toISOString(),
      });
      this.createOpen = false;
      await this.load();
      await this.loadOptions();
    } catch (e) {
      this.createError = e instanceof ApiError ? e.message : 'Erreur inattendue';
    } finally {
      this.creating = false;
    }
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('fr-FR');
  }

  render(): TemplateResult {
    const tabLabel = this.filter === 'overdue' ? 'En retard' : 'En cours';

    return html`
      <div class="toolbar">
        <h1>Emprunts</h1>
        <button class="btn btn-primary" @click=${this.openCreate}>+ Nouvel emprunt</button>
      </div>

      <div class="tabs" role="tablist">
        <button
          class="tab-btn"
          role="tab"
          aria-selected=${this.filter === 'current'}
          @click=${() => this.switchFilter('current')}
        >
          En cours
        </button>
        <button
          class="tab-btn"
          role="tab"
          aria-selected=${this.filter === 'overdue'}
          @click=${() => this.switchFilter('overdue')}
        >
          En retard
        </button>
      </div>

      ${this.error ? html`<p class="alert alert-error">${this.error}</p>` : ''}
      ${this.actionError ? html`<p class="alert alert-error">${this.actionError}</p>` : ''}
      ${this.returningError ? html`<p class="alert alert-error">${this.returningError}</p>` : ''}

      ${
        this.loading
          ? html`<p class="empty">Chargement…</p>`
          : this.loans.length === 0
            ? html`<p class="empty">Aucun emprunt ${tabLabel.toLowerCase()}.</p>`
            : html`
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Livre</th>
                      <th>Adhérent</th>
                      <th>Emprunté le</th>
                      <th>Retour prévu</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.loans.map(
                      (loan) => html`
                        <tr>
                          <td>${loan.book_title}</td>
                          <td>${loan.member_name}</td>
                          <td>${this.formatDate(loan.borrowed_at)}</td>
                          <td>
                            ${
                              this.filter === 'overdue'
                                ? html`<span class="due-overdue">${this.formatDate(loan.due_date)}</span>`
                                : this.formatDate(loan.due_date)
                            }
                          </td>
                          <td><app-status-badge status=${loan.state}></app-status-badge></td>
                          <td>
                            <button
                              class="btn btn-ghost btn-sm"
                              ?disabled=${this.returningId === loan.id}
                              @click=${() => this.returnLoan(loan)}
                            >
                              ${this.returningId === loan.id ? '…' : 'Marquer rendu'}
                            </button>
                          </td>
                        </tr>
                      `,
                    )}
                  </tbody>
                </table>
              </div>
            `
      }

      <app-drawer label="Nouvel emprunt" ?open=${this.createOpen} placement="end" @wa-after-hide=${() => (this.createOpen = false)}>
        ${this.createError ? html`<p class="alert alert-error">${this.createError}</p>` : ''}

        <app-field label="Adhérent">
          <select .value=${this.memberId} @change=${this.onMember}>
            <option value="">Choisir un adhérent</option>
            ${this.members.map((member) => html`<option value=${member.id}>${member.name}</option>`)}
          </select>
        </app-field>

        <app-field label="Livre">
          <select .value=${this.bookId} @change=${this.onBook}>
            <option value="">Choisir un livre</option>
            ${this.availableBooks.map(
              (book) =>
                html`<option value=${book.id}>${book.title}</option>
              `,
            )}
          </select>
        </app-field>

        <app-field label="Date de retour">
          <input type="date" .value=${this.dueDate} @input=${this.onDueDate} />
        </app-field>
        
        <div slot="footer" class="row" style="justify-content: flex-end;">
          <button class="btn btn-secondary" ?disabled=${this.creating} @click=${() => (this.createOpen = false)}>
            Annuler
          </button>
          <button class="btn btn-primary" ?disabled=${this.creating} @click=${this.createLoan}>
            ${this.creating ? '…' : 'Créer'}
          </button>
        </div>
      </app-drawer>
    `;
  }
}
