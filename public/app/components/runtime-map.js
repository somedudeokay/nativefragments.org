import { shadow, sheet } from "/nativefragments/component.js";

const styles = sheet(`
  :host {
    display: block;
  }

  .shell {
    background: color-mix(in srgb, var(--ink, #141414) 6%, transparent);
    border: 1px solid var(--line, rgba(20, 20, 20, 0.1));
    border-radius: 24px;
    padding: 8px;
  }

  .map {
    background: #16181d;
    border: 1px solid rgba(247, 243, 232, 0.08);
    border-radius: 18px;
    box-shadow:
      0 30px 60px -22px rgba(20, 20, 20, 0.4),
      inset 0 1px 0 rgba(247, 243, 232, 0.06);
    color: #f7f3e8;
    min-height: 430px;
    padding: clamp(1.4rem, 3vw, 1.9rem);
    position: relative;
  }

  .label {
    border-bottom: 1px solid rgba(247, 243, 232, 0.12);
    color: var(--green, #1ed760);
    display: flex;
    font-family: var(--mono, "JetBrains Mono", ui-monospace, SFMono-Regular, monospace);
    font-size: 0.72rem;
    font-weight: 500;
    justify-content: space-between;
    letter-spacing: 0.08em;
    padding-bottom: 0.85rem;
    text-transform: uppercase;
  }

  .flow {
    display: grid;
    gap: 0.85rem;
    margin-top: 1.5rem;
  }

  .node {
    background: rgba(247, 243, 232, 0.03);
    border: 1px solid rgba(247, 243, 232, 0.1);
    border-radius: 12px;
    display: grid;
    gap: 0.4rem;
    padding: 1rem 1.1rem;
  }

  .node:hover {
    background: rgba(247, 243, 232, 0.05);
    border-color: color-mix(in srgb, var(--green, #1ed760) 40%, transparent);
  }

  .node strong {
    color: #ffffff;
    font-family: var(--display, "Space Grotesk", ui-sans-serif, system-ui, sans-serif);
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.2;
  }

  .node span {
    color: #b8b2a4;
    font-family: var(--sans, "Geist", ui-sans-serif, system-ui, sans-serif);
    font-size: 0.88rem;
    line-height: 1.5;
  }

  .arrow {
    color: var(--green, #1ed760);
    font-family: var(--mono, "JetBrains Mono", ui-monospace, SFMono-Regular, monospace);
    font-size: 0.78rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    padding-left: 0.25rem;
  }

  .stamp {
    border: 1px solid rgba(30, 215, 96, 0.5);
    border-radius: 999px;
    bottom: 1.1rem;
    color: var(--green, #1ed760);
    font-family: var(--mono, "JetBrains Mono", ui-monospace, SFMono-Regular, monospace);
    font-size: 0.68rem;
    letter-spacing: 0.04em;
    padding: 0.4rem 0.65rem;
    position: absolute;
    right: 1.1rem;
  }
`);

class RuntimeMap extends HTMLElement {
  connectedCallback() {
    shadow(this, {
      styles: [styles],
      html: `<div class="shell">
        <section class="map" aria-label="Native Fragments request flow">
          <div class="label">
            <span>fragment runtime</span>
            <span>no build</span>
          </div>
          <div class="flow">
            <div class="node">
              <strong>Worker route</strong>
              <span>Match an explicit manifest entry. Render HTML and metadata.</span>
            </div>
            <div class="arrow">↓ x-fragment: true</div>
            <div class="node">
              <strong>Content slot</strong>
              <span>Swap only the page fragment. Keep the document alive.</span>
            </div>
            <div class="arrow">↓ customElements.define()</div>
            <div class="node">
              <strong>Shadow island</strong>
              <span>Native behavior and scoped CSS, with no app-wide style leaks.</span>
            </div>
          </div>
          <div class="stamp">0 deps · 0 build</div>
        </section>
      </div>`,
    });
  }
}

customElements.define("nf-runtime-map", RuntimeMap);
