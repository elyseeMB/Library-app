import { html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { uiStyles } from '../styles/ui';

/**
 * Champ de formulaire : libellé + contenu (slot) + message d'erreur optionnel.
 */
@customElement('app-field')
export class AppField extends LitElement {
  static styles = [uiStyles];

  @property({ type: String })
  label = '';

  @property({ type: String })
  error = '';

  render(): TemplateResult {
    return html`
      <div class="field">
        <label part="label">${this.label}</label>
        <slot></slot>
        ${this.error ? html`<p class="error-text">${this.error}</p>` : ''}
      </div>
    `;
  }
}
