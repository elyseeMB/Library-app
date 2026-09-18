import { css, html, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Wrapper Lit autour de <wa-drawer> (panneau latéral) : mêmes conventions
 * que `app-dialog`, avec une position (`start` = gauche, `end` = droite).
 */
@customElement('app-drawer')
export class AppDrawer extends LitElement {
  static styles = css``;

  @property({ type: Boolean })
  open = false;

  @property({ type: String })
  label = '';

  @property({ type: String })
  placement = 'end';

  private onHide = () => {
    this.open = false;
  };

  render(): TemplateResult {
    return html`
      <wa-drawer
        label=${this.label}
        placement=${this.placement}
        ?open=${this.open}
        @wa-after-hide=${this.onHide}
      >
        <slot></slot>
        <slot name="footer" slot="footer"></slot>
      </wa-drawer>
    `;
  }
}
