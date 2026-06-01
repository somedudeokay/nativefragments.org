import { html, raw } from "@nativefragments/core/server";

const demo = (title, text) => html`<article>
  <span>Coming soon</span>
  <h2>${title}</h2>
  <p>${text}</p>
</article>`;

export const demosPage = () => html`<section class="page-hero compact">
  <p class="eyebrow">Demos</p>
  <h1>Small apps you can inspect.</h1>
  <p>
    The demos will be complete, focused mini apps. Each one should be small
    enough for an agent to read end to end and real enough to copy into a
    product.
  </p>
</section>

<section class="coming-soon-grid">
  ${raw(
    [
      demo("Analytics Dashboard", "Server-rendered metrics with interactive Shadow DOM filters."),
      demo("Nested Routes", "A settings area with parent navigation and focused child pages."),
      demo("Todo App", "Local-first state, form handling, and tiny component islands."),
      demo("Theme Switcher", "CSS custom properties shared across Shadow DOM components."),
      demo("Signal Counter", "Reactive DOM bindings without adding a build step."),
      demo("Worker Search", "Large-list filtering with the browser worker helper."),
      demo("Hono API", "Pages and JSON endpoints running from the same Worker."),
      demo("Form Wizard", "Multi-step forms with progressive enhancement and real links."),
      demo("Activity Feed", "A realtime-looking operational surface with fragment refreshes."),
      demo("Content Site", "Markdown-like pages, metadata, and fast internal navigation."),
      demo("Command Palette", "Keyboard interaction in one Custom Element with scoped CSS."),
    ].join(""),
  )}
</section>`;
