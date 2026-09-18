import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { AuthorsApi } from '../api/authors';
import { BooksApi } from '../api/books';
import { ApiError } from '../helpers/http';
import { uiStyles } from '../styles/ui';
import type { Author, Book, BookInput } from '../types';

/**
 * Catalogue des livres : liste paginée + recherche + création / édition / suppression.
 */
@customElement('books-page')
export class BooksPage extends LitElement {
  static styles = [
    uiStyles,
    css`
      .search-row {
        display: flex;
        gap: 12px;
        align-items: center;
      }
    `,
  ];

  @state()
  private books: Book[] = [];

  @state()
  private page = 1;

  @state()
  private totalPages = 1;

  @state()
  private total = 0;

  @state()
  private search = '';

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
  private bookTitle = '';

  @state()
  private authorId = '';

  @state()
  private year = '';

  @state()
  private fieldErrors: Record<string, string> = {};

  @state()
  private formError = '';

  @state()
  private deleting: Book | null = null;

  @state()
  private deleteError = '';

  connectedCallback() {
    super.connectedCallback();
    void this.loadAuthors();
    void this.load();
  }

  async loadAuthors() {
    try {
      this.authors = await AuthorsApi.all();
    } catch {
      this.authors = [];
    }
  }

  async load() {
    this.loading = true;
    this.error = '';
    try {
      const result = await BooksApi.list({
        page: this.page,
        limit: 10,
        search: this.search,
      });
      this.books = result.data;
      this.totalPages = result.meta.totalPages;
      this.total = result.meta.total;
      this.page = result.meta.page;
    } catch (e) {
      this.error = e instanceof ApiError ? e.message : 'Erreur inattendue';
    } finally {
      this.loading = false;
    }
  }

  onSearch(event: Event) {
    this.search = (event.target as HTMLInputElement).value;
    this.page = 1;
    void this.load();
  }

  openCreate() {
    this.editingId = '';
    this.bookTitle = '';
    this.authorId = '';
    this.year = '';
    this.fieldErrors = {};
    this.formError = '';
    this.dialogOpen = true;
  }

  openEdit(book: Book) {
    this.editingId = book.id;
    this.bookTitle = book.title;
    this.authorId = book.author_id;
    this.year = String(book.publication_year);
    this.fieldErrors = {};
    this.formError = '';
    this.dialogOpen = true;
  }

  onTitle(event: Event) {
    this.bookTitle = (event.target as HTMLInputElement).value;
  }

  onAuthor(event: Event) {
    this.authorId = (event.target as HTMLSelectElement).value;
  }

  onYear(event: Event) {
    this.year = (event.target as HTMLInputElement).value;
  }

  async submit(event: Event) {
    event.preventDefault();
    this.fieldErrors = {};
    this.formError = '';

    if (!this.bookTitle.trim() || !this.authorId || !this.year) {
      this.formError = 'Tous les champs sont requis.';
      return;
    }

    const payload: BookInput = {
      title: this.bookTitle.trim(),
      author_id: this.authorId,
      publication_year: Number(this.year),
    };

    try {
      if (this.editingId) {
        await BooksApi.update(this.editingId, payload);
      } else {
        await BooksApi.store(payload);
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

  confirmDelete(book: Book) {
    this.deleting = book;
    this.deleteError = '';
  }

  async deleteBook() {
    const book = this.deleting;
    if (!book) {
      return;
    }
    try {
      await BooksApi.remove(book.id);
      this.deleting = null;
      await this.load();
    } catch (e) {
      this.deleteError = e instanceof ApiError ? e.message : 'Erreur inattendue';
    }
  }

  onPageChange(event: CustomEvent<{ page: number }>) {
    this.page = event.detail.page;
    void this.load();
  }

  render(): TemplateResult {
    return html`
      <div class="toolbar">
        <h1>Livres</h1>
        <div class="search-row">
          <input .value=${this.search} placeholder="Rechercher (titre, auteur)…" @input=${this.onSearch} />
          <button class="btn btn-primary" @click=${this.openCreate}>+ Ajouter un livre</button>
        </div>
      </div>

      ${this.error ? html`<p class="alert alert-error">${this.error}</p>` : ''}

      ${
        this.loading
          ? html`<p class="empty">Chargement…</p>`
          : this.books.length === 0
            ? html`<p class="empty">Aucun livre trouvé.</p>`
            : html`
              <div class="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Titre</th>
                      <th>Auteur</th>
                      <th>Année</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.books.map(
                      (book) => html`
                        <tr>
                          <td>${book.title}</td>
                          <td>${book.author_name}</td>
                          <td>${book.publication_year}</td>
                          <td><app-status-badge status=${book.status}></app-status-badge></td>
                          <td>
                            <div class="row">
                              <button class="btn btn-ghost btn-sm" @click=${() => this.openEdit(book)}>Éditer</button>
                              <button class="btn btn-danger btn-sm" @click=${() => this.confirmDelete(book)}>Supprimer</button>
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

      <app-dialog
        label=${this.editingId ? 'Éditer le livre' : 'Ajouter un livre'}
        ?open=${this.dialogOpen}
        @wa-after-hide=${() => (this.dialogOpen = false)}
      >
        <form @submit=${this.submit}>
          ${this.formError ? html`<p class="alert alert-error">${this.formError}</p>` : ''}
          <app-field label="Titre" error=${this.fieldErrors.title ?? ''}>
            <input .value=${this.bookTitle} @input=${this.onTitle} />
          </app-field>
          <app-field label="Auteur" error=${this.fieldErrors.author_id ?? ''}>
            <select .value=${this.authorId} @change=${this.onAuthor}>
              <option value="">Choisir un auteur</option>
              ${this.authors.map((author) => html`<option value=${author.id}>${author.name}</option>`)}
            </select>
          </app-field>
          <app-field label="Année de publication" error=${this.fieldErrors.publication_year ?? ''}>
            <input
              type="number"
              min="0"
              max="2100"
              .value=${this.year}
              @input=${this.onYear}
            />
          </app-field>
          <div class="row" style="justify-content: flex-end; margin-top: 20px;">
            <button type="button" class="btn btn-secondary" @click=${() => (this.dialogOpen = false)}>Annuler</button>
            <button type="submit" class="btn btn-primary">Enregistrer</button>
          </div>
        </form>
      </app-dialog>

      <app-dialog label="Supprimer le livre" ?open=${this.deleting !== null} @wa-after-hide=${() => (this.deleting = null)}>
        ${
          this.deleteError
            ? html`<p class="alert alert-error">${this.deleteError}</p>`
            : html`<p>Confirmer la suppression de <strong>${this.deleting?.title}</strong> ?</p>`
        }
        <div slot="footer" class="row" style="justify-content: flex-end;">
          <button class="btn btn-secondary" @click=${() => (this.deleting = null)}>Annuler</button>
          <button class="btn btn-danger" @click=${this.deleteBook}>Supprimer</button>
        </div>
      </app-dialog>
    `;
  }
}
