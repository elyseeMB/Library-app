import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthorsApi } from '../api/authors';
import { ApiError } from '../helpers/http';
import { uiStyles } from '../styles/ui';
import type { Author, AuthorInput } from '../types';

const FORM_FIELDS = ['name', 'nationality', 'email', 'phone', 'bio', 'website'] as const;

/**
 * Auteurs : liste + création / édition / suppression (409 gérée si auteur associé à des livres).
 */
@customElement('authors-page')
export class AuthorsPage extends LitElement {
  static styles = [uiStyles];

  @state()
  private authors: Author[] = [];

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
  private deleting: Author | null = null;

  @state()
  private deleteError = '';

  connectedCallback() {
    super.connectedCallback();
    void this.load();
  }

  async load() {
    this.loading = true;
    this.error = '';
    try {
      this.authors = await AuthorsApi.all();
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

  openEdit(author: Author) {
    this.editingId = author.id;
    this.form = {
      name: author.name,
      nationality: author.nationality,
      email: author.email,
      phone: author.phone ?? '',
      bio: author.bio ?? '',
      website: author.website ?? '',
    };
    this.fieldErrors = {};
    this.formError = '';
    this.dialogOpen = true;
  }

  onInput(event: Event, key: (typeof FORM_FIELDS)[number]) {
    this.form = { ...this.form, [key]: (event.target as HTMLInputElement).value };
  }

  async submit(event: Event) {
    event.preventDefault();
    this.fieldErrors = {};
    this.formError = '';

    const name = this.form.name?.trim() ?? '';
    const nationality = this.form.nationality?.trim() ?? '';
    const email = this.form.email?.trim() ?? '';
    if (!name || !nationality || !email) {
      this.formError = 'Nom, nationalité et email sont requis.';
      return;
    }

    const payload: AuthorInput = { name, nationality, email };
    const optional: Record<string, string> = {
      phone: this.form.phone?.trim() ?? '',
      bio: this.form.bio?.trim() ?? '',
      website: this.form.website?.trim() ?? '',
    };
    for (const key of ['phone', 'bio', 'website'] as const) {
      if (optional[key]) {
        payload[key] = optional[key];
      }
    }

    try {
      if (this.editingId) {
        await AuthorsApi.update(this.editingId, payload);
      } else {
        await AuthorsApi.store(payload);
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

  confirmDelete(author: Author) {
    this.deleting = author;
    this.deleteError = '';
  }

  async deleteAuthor() {
    const author = this.deleting;
    if (!author) {
      return;
    }
    try {
      await AuthorsApi.remove(author.id);
      this.deleting = null;
      await this.load();
    } catch (e) {
      this.deleteError = e instanceof ApiError ? e.message : 'Erreur inattendue';
    }
  }

  render(): TemplateResult {
    return html`
      <div class="toolbar">
        <h1>Auteurs</h1>
        <button class="btn btn-primary" @click=${this.openCreate}>+ Ajouter un auteur</button>
      </div>

      ${this.error ? html`<p class="alert alert-error">${this.error}</p>` : ''}

      ${
        this.loading
          ? html`<p class="empty">Chargement…</p>`
          : this.authors.length === 0
            ? html`<p class="empty">Aucun auteur.</p>`
            : html`
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Nationalité</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.authors.map(
                      (author) => html`
                        <tr>
                          <td>${author.name}</td>
                          <td>${author.nationality}</td>
                          <td>${author.email}</td>
                          <td>${author.phone ?? '—'}</td>
                          <td>
                            <div class="row">
                              <button class="btn btn-ghost btn-sm" @click=${() => this.openEdit(author)}>Éditer</button>
                              <button class="btn btn-danger btn-sm" @click=${() => this.confirmDelete(author)}>Supprimer</button>
                            </div>
                          </td>
                        </tr>
                      `,
                    )}
                  </tbody>
                </table>
              </div>
            `
      }

      <app-dialog label=${this.editingId ? 'Éditer l’auteur' : 'Ajouter un auteur'} ?open=${this.dialogOpen} @wa-after-hide=${() => (this.dialogOpen = false)}>
        <form @submit=${this.submit}>
          ${
            this.formError
              ? html`<p class="alert alert-error">${this.formError}
          </p>`
              : ''
          }

          <app-field label="Nom" error=${this.fieldErrors.name ?? ''}>
            <input .value=${this.form.name ?? ''} @input=${(e: Event) => this.onInput(e, 'name')} />
          </app-field>

          <app-field label="Nationalité" error=${this.fieldErrors.nationality ?? ''}>
            <input .value=${this.form.nationality ?? ''} @input=${(e: Event) => this.onInput(e, 'nationality')} />
          </app-field>

          <app-field label="Email" error=${this.fieldErrors.email ?? ''}>
            <input type="email" .value=${this.form.email ?? ''} @input=${(e: Event) => this.onInput(e, 'email')} />
          </app-field>

          <app-field label="Téléphone" error=${this.fieldErrors.phone ?? ''}>
            <input .value=${this.form.phone ?? ''} @input=${(e: Event) => this.onInput(e, 'phone')} />
          </app-field>

          <app-field label="Biographie" error=${this.fieldErrors.bio ?? ''}>
            <textarea .value=${this.form.bio ?? ''} @input=${(e: Event) => this.onInput(e, 'bio')}></textarea>
          </app-field>

          <app-field label="Site web" error=${this.fieldErrors.website ?? ''}>
            <input type="url" .value=${this.form.website ?? ''} @input=${(e: Event) => this.onInput(e, 'website')} />
          </app-field>

          <div class="row" style="justify-content: flex-end; margin-top: 20px;">
            <button type="button" class="btn btn-secondary" @click=${() => (this.dialogOpen = false)}>Annuler</button>
            <button type="submit" class="btn btn-primary">Enregistrer</button>
          </div>
        </form>
      </app-dialog>

      <app-dialog label="Supprimer l’auteur" ?open=${this.deleting !== null} @wa-after-hide=${() => (this.deleting = null)}>
        ${
          this.deleteError
            ? html`<p class="alert alert-error">${this.deleteError}</p>`
            : html`<p>Confirmer la suppression de <strong>${this.deleting?.name}</strong> ?</p>`
        }
        <div slot="footer" class="row" style="justify-content: flex-end;">
          <button class="btn btn-secondary" @click=${() => (this.deleting = null)}>Annuler</button>
          <button class="btn btn-danger" @click=${this.deleteAuthor}>Supprimer</button>
        </div>
      </app-dialog>
    `;
  }
}
