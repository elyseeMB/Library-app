import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Wrapper Lit autour de <wa-dialog> : expose les propriétés `open` et `label`
 * et propage la fermeture (Échap / clic extérieur) en remettant `open` à false.
 */
@customElement('app-dialog')
export class AppDialog extends LitElement {
  static styles = css``;

  @property({ type: Boolean })
  open = false;

  @property({ type: String })
  label = '';

  private onHide = () => {
    this.open = false;
  };

  render(): TemplateResult {
    return html`
      <wa-dialog label=${this.label} ?open=${this.open} @wa-after-hide=${this.onHide}>
        <slot></slot>
        <slot name="footer" slot="footer"></slot>
      </wa-dialog>
    `;
  }
}
