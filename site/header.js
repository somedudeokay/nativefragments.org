import { declarativeShadow, html, raw } from "@nativefragments/core/server";

const headerStyles = `
  :host {
    display: block;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  header {
    align-items: center;
    backdrop-filter: blur(18px);
    background: color-mix(in srgb, #f7f3e8 86%, transparent);
    border-bottom: 1px solid #171717;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    min-height: 64px;
    padding: 0 1rem;
  }

  .brand {
    align-items: center;
    color: #111111;
    display: inline-flex;
    font-family: Georgia, "Times New Roman", serif;
    font-size: clamp(1.05rem, 3vw, 1.45rem);
    font-weight: 800;
    text-decoration: none;
  }

  .brand::before {
    background: #1ed760;
    border: 1px solid #111111;
    content: "";
    display: inline-block;
    height: 0.75rem;
    margin-right: 0.55rem;
    transform: rotate(45deg);
    width: 0.75rem;
  }

  nav,
  .header-links,
  .icon-links,
  .icon-link,
  .npm-mark {
    align-items: center;
    display: flex;
  }

  nav {
    gap: clamp(0.4rem, 2vw, 1rem);
  }

  .header-links {
    gap: clamp(0.6rem, 2vw, 1.15rem);
  }

  .icon-links {
    border-left: 1px solid #111111;
    gap: 0.35rem;
    padding-left: 0.75rem;
  }

  a {
    color: #111111;
    font-size: 0.82rem;
    font-weight: 800;
    text-decoration: none;
    text-transform: uppercase;
  }

  a[aria-current="page"] {
    background: #111111;
    color: #f7f3e8;
    padding: 0.35rem 0.55rem;
  }

  .icon-link {
    height: 2.1rem;
    justify-content: center;
    width: 2.1rem;
  }

  .icon-link svg {
    display: block;
    height: 1.1rem;
    width: 1.1rem;
  }

  .npm-mark {
    border: 1px solid currentColor;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.62rem;
    height: 1.05rem;
    justify-content: center;
    line-height: 1;
    width: 1.55rem;
  }

  @media (max-width: 560px) {
    header {
      align-items: flex-start;
      flex-direction: column;
      gap: 0.35rem;
      padding: 0.75rem 1rem;
    }

    .header-links {
      align-items: flex-start;
      flex-direction: column;
      gap: 0.45rem;
    }

    nav {
      flex-wrap: wrap;
    }

    .icon-links {
      border-left: 0;
      padding-left: 0;
    }
  }
`;

const githubIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
  <path d="M12 .5a12 12 0 0 0-3.8 23.38c.6.11.82-.26.82-.58v-2.08c-3.34.73-4.04-1.41-4.04-1.41-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.08 1.84 2.82 1.31 3.51 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.45 11.45 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z"/>
</svg>`;

const links = [
  { href: "https://docs.nativefragments.org", label: "Docs" },
  { href: "/examples", label: "Examples" },
  { href: "/demos", label: "Demos" },
  { href: "/manifesto", label: "Manifesto" },
];

const headerHtml = (activePath) => `<header>
  <a class="brand" href="/">Native Fragments</a>
  <div class="header-links">
    <nav aria-label="Primary">
      ${links
        .map(
          ({ href, label }) =>
            `<a href="${href}" ${
              href === activePath ? 'aria-current="page"' : ""
            }>${label}</a>`,
        )
        .join("")}
    </nav>
    <div class="icon-links" aria-label="Package links">
      <a class="icon-link" href="https://github.com/somedudeokay/nativefragments" aria-label="GitHub" title="GitHub">${githubIcon}</a>
      <a class="icon-link" href="https://www.npmjs.com/package/@nativefragments/core" aria-label="npm" title="npm"><span class="npm-mark">npm</span></a>
    </div>
  </div>
</header>`;

export const siteHeader = ({ activePath = "/" } = {}) =>
  raw(html`<nf-site-header>${declarativeShadow({
    styles: [headerStyles],
    html: headerHtml(activePath),
  })}</nf-site-header>`);
