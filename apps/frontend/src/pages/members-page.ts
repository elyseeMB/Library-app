import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { MembersApi } from '../api/members';
import { ApiError } from '../helpers/http';
import { uiStyles } from '../styles/ui';
import type { Member, MemberInput, MemberLoan } from '../types';

/**
 * Adhérents : liste paginée + création / édition / suppression + historique des emprunts (drawer).
 */
@customElement('members-page')
export class MembersPage extends LitElement {
  static styles = [
    uiStyles,
    css`
      .history-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }
    `,
  ];

  @state()
  private members: Member[] = [];

  @state()
  private page = 1;

  @state()
  private totalPages = 1;

  @state()
  private total = 0;

  @state()
  private loading = true;

  @state()
  private error = '';

  @state()
  private dialogOpen = false;

  @state()
  private editingId = '';

  @state()
  private form: Record<string, string> = {};

  @state()
  private fieldErrors: Record<string, string> = {};

  @state()
  private formError = '';

  @state()
  private deleting: Member | null = null;

  @state()
  private deleteError = '';

  @state()
  private historyOpen = false;

  @state()
  private selectedMember: Member | null = null;

  @state()
  private history: MemberLoan[] = [];

  @state()
  private historyError = '';

  connectedCallback() {
    super.connectedCallback();
    void this.load();
  }

  async load() {
    this.loading = true;
    this.error = '';
    try {
      const result = await MembersApi.list({ page: this.page, limit: 10 });
      this.members = result.data;
      this.totalPages = result.meta.totalPages;
      this.total = result.meta.total;
      this.page = result.meta.page;
    } catch (e) {
      this.error = e instanceof ApiError ? e.message : 'Erreur inattendue';
    } finally {
      this.loading = false;
    }
  }

  openCreate() {
    this.editingId = '';
    this.form = {};
    this.fieldErrors = {};
    this.formError = '';
    this.dialogOpen = true;
  }

  openEdit(member: Member) {
    this.editingId = member.id;
    this.form = { name: member.name, email: member.email, phone: member.phone ?? '' };
    this.fieldErrors = {};
    this.formError = '';
    this.dialogOpen = true;
  }

  onInput(event: Event, key: 'name' | 'email' | 'phone') {
    this.form = { ...this.form, [key]: (event.target as HTMLInputElement).value };
  }

  async submit(event: Event) {
    event.preventDefault();
    this.fieldErrors = {};
    this.formError = '';

    const name = this.form.name?.trim() ?? '';
    const email = this.form.email?.trim() ?? '';
    if (!name || !email) {
      this.formError = 'Nom et email sont requis.';
      return;
    }

    const payload: MemberInput = { name, email };
    const phone = this.form.phone?.trim() ?? '';
    if (phone) {
      payload.phone = phone;
    }

    try {
      if (this.editingId) {
        await MembersApi.update(this.editingId, payload);
      } else {
        await MembersApi.store(payload);
      }
      this.dialogOpen = false;
      await this.load();
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.errors) {
          this.fieldErrors = this.flattenErrors(e.errors);
          return;
        }
        this.formError = e.message;
      }
    }
  }

  flattenErrors(errors: Record<string, string[]>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, messages] of Object.entries(errors)) {
      const message = Array.isArray(messages) ? messages[0] : String(messages);
      if (message) {
        out[key] = message;
      }
    }
    return out;
  }

  confirmDelete(member: Member) {
    this.deleting = member;
    this.deleteError = '';
  }

  async deleteMember() {
    const member = this.deleting;
    if (!member) {
      return;
    }
    try {
      await MembersApi.remove(member.id);
      this.deleting = null;
      await this.load();
    } catch (e) {
      this.deleteError = e instanceof ApiError ? e.message : 'Erreur inattendue';
    }
  }

  async openHistory(member: Member) {
    this.selectedMember = member;
    this.history = [];
    this.historyError = '';
    this.historyOpen = true;
    try {
      this.history = await MembersApi.loans(member.id);
    } catch (e) {
      this.historyError = e instanceof ApiError ? e.message : 'Erreur inattendue';
    }
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleDateString('fr-FR');
  }

  onPageChange(event: CustomEvent<{ page: number }>) {
    this.page = event.detail.page;
    void this.load();
  }

  render(): TemplateResult {
    return html`
      <div class="toolbar">
        <h1>Adhérents</h1>
        <button class="btn btn-primary" @click=${this.openCreate}>+ Ajouter un adhérent</button>
      </div>

      ${this.error ? html`<p class="alert alert-error">${this.error}</p>` : ''}

      ${
        this.loading
          ? html`<p class="empty">Chargement…</p>`
          : this.members.length === 0
            ? html`<p class="empty">Aucun adhérent.</p>`
            : html`
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.members.map(
                      (member) => html`
                        <tr>
                          <td>${member.name}</td>
                          <td>${member.email}</td>
                          <td>${member.phone ?? '—'}</td>
                          <td>
                            <div class="row">
                              <button class="btn btn-ghost btn-sm" @click=${() => this.openHistory(member)}>Historique</button>
                              <button class="btn btn-ghost btn-sm" @click=${() => this.openEdit(member)}>Éditer</button>
                              <button class="btn btn-danger btn-sm" @click=${() => this.confirmDelete(member)}>Supprimer</button>
                            </div>
                          </td>
                        </tr>
                      `,
                    )}
                  </tbody>
                </table>
              </div>
              <app-pagination
                page=${this.page}
                total-pages=${this.totalPages}
                total=${this.total}
                @page-change=${this.onPageChange}
              ></app-pagination>
            `
      }

      <app-dialog label=${this.editingId ? 'Éditer l’adhérent' : 'Ajouter un adhérent'} ?open=${this.dialogOpen} @wa-after-hide=${() => (this.dialogOpen = false)}>
        <form @submit=${this.submit}>
          ${this.formError ? html`<p class="alert alert-error">${this.formError}</p>` : ''}
          <app-field label="Nom" error=${this.fieldErrors.name ?? ''}>
            <input .value=${this.form.name ?? ''} @input=${(e: Event) => this.onInput(e, 'name')} />
          </app-field>
          <app-field label="Email" error=${this.fieldErrors.email ?? ''}>
            <input type="email" .value=${this.form.email ?? ''} @input=${(e: Event) => this.onInput(e, 'email')} />
          </app-field>
          <app-field label="Téléphone" error=${this.fieldErrors.phone ?? ''}>
            <input .value=${this.form.phone ?? ''} @input=${(e: Event) => this.onInput(e, 'phone')} />
          </app-field>
          <div class="row" style="justify-content: flex-end; margin-top: 20px;">
            <button type="button" class="btn btn-secondary" @click=${() => (this.dialogOpen = false)}>Annuler</button>
            <button type="submit" class="btn btn-primary">Enregistrer</button>
          </div>
        </form>
      </app-dialog>

      <app-dialog label="Supprimer l’adhérent" ?open=${this.deleting !== null} @wa-after-hide=${() => (this.deleting = null)}>
        ${
          this.deleteError
            ? html`<p class="alert alert-error">${this.deleteError}</p>`
            : html`<p>Confirmer la suppression de <strong>${this.deleting?.name}</strong> ?</p>`
        }
        <div slot="footer" class="row" style="justify-content: flex-end;">
          <button class="btn btn-secondary" @click=${() => (this.deleting = null)}>Annuler</button>
          <button class="btn btn-danger" @click=${this.deleteMember}>Supprimer</button>
        </div>
      </app-dialog>

      <app-drawer
        label=${`Historique de ${this.selectedMember?.name ?? ''}`}
        ?open=${this.historyOpen}
        placement="end"
        @wa-after-hide=${() => (this.historyOpen = false)}
      >
        ${
          this.historyError
            ? html`<p class="alert alert-error">${this.historyError}</p>`
            : this.history.length === 0
              ? html`<p class="empty">Aucun emprunt pour cet adhérent.</p>`
              : html`
                <ul class="list">
                  ${this.history.map(
                    (loan) => html`
                      <li class="card history-row">
                        <div>
                          <strong>${loan.book_title}</strong>
                          <p class="muted">Emprunté le ${this.formatDate(loan.borrowed_at)}</p>
                          ${loan.returned_at ? html`<p class="muted">Rendu le ${this.formatDate(loan.returned_at)}</p>` : ''}
                        </div>
                        <app-status-badge status=${loan.state}></app-status-badge>
                      </li>
                    `,
                  )}
                </ul>
              `
        }
      </app-drawer>
    `;
  }
}
