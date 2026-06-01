import { html } from "@nativefragments/core/server";
import { codeBlock } from "../code.js";

const installExample = `npm create @nativefragments/app@latest my-app
cd my-app
npm run dev`;

const routeExample = `import { html, route } from "@nativefragments/core/server";

export const routes = [
  route("/", {
    meta: () => ({
      title: "Dashboard",
      description: "A fast HTML-first dashboard.",
      canonical: "https://example.com/",
    }),
    render: () => html\`
      <h1>Revenue</h1>
      <metric-card value="$42k"></metric-card>
    \`,
  }),
];`;

const fragmentExample = `import { fragment, html, route } from "@nativefragments/core/server";

const settingsPanel = fragment("settings-panel", renderSettingsPanel);

export const settingsRoute = route("/settings/profile", {
  render: () => html\`
    <a href="/settings/profile"\${settingsPanel.prefetchAttrs("intent")}>
      Profile
    </a>
    <section\${settingsPanel.attrs()}>
      \${renderSettingsPanel()}
    </section>
  \`,
  fragments: [settingsPanel],
});`;

const componentExample = `import { shadow, sheet } from "/nativefragments/component.js";

const styles = sheet(\`
  button {
    border: 1px solid currentColor;
  }
\`);

class ThemeSwitch extends HTMLElement {
  connectedCallback() {
    shadow(this, {
      styles: [styles],
      html: \`<button type="button">Switch theme</button>\`,
    });
  }
}

customElements.define("theme-switch", ThemeSwitch);`;

const apiExample = `import { createCloudflareHandler } from "@nativefragments/core/cloudflare";
import { Hono } from "hono";

const api = new Hono();

api.get("/api/health", (context) => context.json({ ok: true }));

export default createCloudflareHandler({ api, routes, shell });`;

const signalsExample = `import { bindText, computed, state } from "/nativefragments/signals.js";

const count = state(0);
const label = computed(() => \`Count \${count.get()}\`);

bindText(root.querySelector("[data-count]"), label);`;

export const homePage = () => html`<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow">Native Fragments</p>
    <h1>The tiny web framework built for coding agents.</h1>
    <p class="lede">
      Native Fragments helps agents create fast, maintainable web apps without
      a compile pipeline. The app stays readable at runtime: server HTML, real
      links, browser ES modules, Custom Elements, Shadow DOM, and Cloudflare
      Workers.
    </p>
    <div class="hero-actions">
      <a class="primary-action" href="https://docs.nativefragments.org/getting-started">Start building</a>
      <a class="secondary-action" href="https://docs.nativefragments.org/reference">API reference</a>
    </div>
  </div>
  <nf-runtime-map></nf-runtime-map>
</section>

<section class="proof-strip" aria-label="Framework goals">
  <strong>Zero dependencies</strong>
  <strong>Zero build</strong>
  <strong>Blazing fast</strong>
  <strong>Built for agents</strong>
  <strong>AI-friendly apps</strong>
  <strong>Signals when needed</strong>
  <strong>Free to deploy</strong>
</section>

<section class="landing-section intro-section">
  <div>
    <p class="eyebrow">The bet</p>
    <h2>Use the Web Platform as the framework.</h2>
  </div>
  <div class="section-copy">
    <p>
      Most frontend stacks hide the thing agents need to reason about: the
      actual HTML, links, styles, and behavior. Native Fragments keeps those
      surfaces explicit, so generated apps are easy to read, debug, click,
      scrape, and extend.
    </p>
    <p>
      The framework adds the small contracts an app needs: route manifests,
      escaped HTML templates, fragment responses, metadata updates, and Shadow
      DOM helpers. Everything else is ordinary browser code.
    </p>
  </div>
</section>

<section class="landing-section install-section">
  <div>
    <p class="eyebrow">No build step</p>
    <h2>Create an app, then run the Worker.</h2>
  </div>
  <div class="section-copy">
    <p>
      The default development loop has no bundler. The scaffold ships browser
      modules directly and runs on Wrangler, so agents do not have to edit a
      build graph before they can make a visible change.
    </p>
    ${codeBlock(installExample, "shell")}
  </div>
</section>

<section class="landing-section route-section">
  <div>
    <p class="eyebrow">HTML first</p>
    <h2>Routes are files agents can understand.</h2>
  </div>
  <div class="section-copy">
    <p>
      A route is a path, metadata, and a render function. Normal requests return
      the full document. Fragment requests return only the page body and the
      metadata the browser needs to update the head.
    </p>
    ${codeBlock(routeExample)}
  </div>
</section>

<section class="landing-section fragment-section">
  <div>
    <p class="eyebrow">Declarative fragments</p>
    <h2>Fast transitions without hiding the page.</h2>
  </div>
  <div class="section-copy">
    <p>
      Mark the part of the page that can update, then let the route expose the
      same fragment on the server. The Worker can emit a fragment manifest, and
      the browser router can prefetch intent, visible, or load-time links.
    </p>
    <p>
      The contract stays in the markup: <code>data-fragment-slot</code> names
      the target, and <code>data-fragment-prefetch</code> describes when a link
      should warm the cache.
    </p>
    ${codeBlock(fragmentExample)}
  </div>
</section>

<section class="landing-section route-section">
  <div>
    <p class="eyebrow">Worker native</p>
    <h2>APIs belong beside pages.</h2>
  </div>
  <div class="section-copy">
    <p>
      Mount Hono under <code>/api/*</code> while the same Worker renders pages.
      The adapter only needs a Web Standards <code>fetch</code> method, so the
      core package stays small.
    </p>
    ${codeBlock(apiExample)}
  </div>
</section>

<section class="landing-section component-section">
  <div>
    <p class="eyebrow">Native islands</p>
    <h2>Interactive pieces are Custom Elements.</h2>
  </div>
  <div class="section-copy">
    <p>
      Components use Shadow DOM for scoped CSS, but still expose normal DOM that
      browsers and agents know how to inspect. Shared theme values can stay in
      CSS custom properties.
    </p>
    ${codeBlock(componentExample)}
  </div>
</section>

<section class="landing-section component-section">
  <div>
    <p class="eyebrow">Reactive islands</p>
    <h2>Signals are optional, not the whole app.</h2>
  </div>
  <div class="section-copy">
    <p>
      Add signal-powered bindings where an island needs local state. Keep the
      first payload as server-rendered HTML, then hydrate the parts that need
      client interaction.
    </p>
    ${codeBlock(signalsExample)}
  </div>
</section>

<section class="landing-section agent-section">
  <div>
    <p class="eyebrow">AI-friendly output</p>
    <h2>Better for agents to build. Better for agents to browse.</h2>
  </div>
  <div class="section-copy">
    <p>
      Native Fragments is not just a framework agents can use. It produces apps
      that are easier for agents to operate: real anchors, server-rendered
      content, small modules, readable source, and minimal framework magic.
    </p>
    <ul class="agent-list">
      <li>Route manifests expose the app map.</li>
      <li>Fragment navigation keeps links crawlable.</li>
      <li>Fragment manifests expose navigable page regions.</li>
      <li>Shadow DOM keeps component styling local.</li>
      <li>Generated docs and skills live inside the package.</li>
    </ul>
  </div>
</section>

<section class="cta-section">
  <p class="eyebrow">Start small</p>
  <h2>Install the scaffold and inspect every line.</h2>
  <div class="hero-actions">
    <a class="primary-action" href="https://docs.nativefragments.org/getting-started">Get started</a>
    <a class="secondary-action" href="https://github.com/somedudeokay/nativefragments">View GitHub</a>
  </div>
</section>`;
