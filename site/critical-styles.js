export const criticalStyles = `
  :root {
    color-scheme: light;
    --paper: #f7f3e8;
    --surface: #fffdf6;
    --ink: #141414;
    --muted: #5f5a50;
    --green: #1ed760;
    --orange: #ff6b35;
    --line: rgba(20, 20, 20, 0.1);
    --line-strong: rgba(20, 20, 20, 0.24);
    --container: 1160px;
    --pad: clamp(1.25rem, 5vw, 2.5rem);
    --radius: 14px;
    --radius-pill: 999px;
    --shadow-md: 0 10px 30px -12px rgba(20, 20, 20, 0.18);
    --shadow-lg: 0 30px 60px -20px rgba(20, 20, 20, 0.25);
    --ease: cubic-bezier(0.16, 1, 0.3, 1);
    --display: "Space Grotesk", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --sans: "Geist", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
    --accent: var(--green);
  }

  * {
    box-sizing: border-box;
  }

  html {
    background: var(--paper);
    color: var(--ink);
    font-family: var(--sans);
    font-size: 16px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    touch-action: manipulation;
  }

  body {
    margin: 0;
    overflow-x: hidden;
  }

  a {
    color: inherit;
  }

  .skip-link {
    background: var(--green);
    border-radius: var(--radius);
    color: var(--ink);
    font-weight: 600;
    left: 1rem;
    padding: 0.5rem 0.75rem;
    position: fixed;
    top: -4rem;
    z-index: 20;
  }

  .skip-link:focus {
    top: 1rem;
  }

  :focus-visible {
    outline: 2px solid var(--ink);
    outline-offset: 3px;
  }

  #content-slot {
    min-height: calc(100vh - 64px);
  }

  h1 {
    font-family: var(--display);
    font-size: clamp(2.3rem, 4.4vw, 3.4rem);
    font-weight: 700;
    letter-spacing: -0.035em;
    line-height: 1.03;
    margin: 0;
    max-width: 18ch;
  }

  h1 .accent {
    color: var(--green);
  }

  .hero {
    align-items: center;
    display: grid;
    gap: clamp(2rem, 5vw, 4.5rem);
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    isolation: isolate;
    overflow: hidden;
    padding-block: clamp(3.5rem, 7vw, 6rem);
    padding-inline: max(var(--pad), calc((100% - var(--container)) / 2));
    position: relative;
  }

  .hero::before {
    background:
      radial-gradient(40% 55% at 12% 18%, color-mix(in srgb, var(--green) 26%, transparent), transparent 70%),
      radial-gradient(38% 50% at 88% 8%, color-mix(in srgb, var(--orange) 18%, transparent), transparent 72%);
    content: "";
    filter: blur(8px);
    inset: -10% -5% auto -5%;
    height: 70%;
    pointer-events: none;
    position: absolute;
    z-index: -2;
  }

  .hero::after {
    background-image: radial-gradient(color-mix(in srgb, var(--ink) 14%, transparent) 1px, transparent 1.4px);
    background-size: 22px 22px;
    content: "";
    inset: 0;
    -webkit-mask-image: radial-gradient(70% 60% at 30% 30%, #000, transparent 75%);
    mask-image: radial-gradient(70% 60% at 30% 30%, #000, transparent 75%);
    opacity: 0.5;
    pointer-events: none;
    position: absolute;
    z-index: -1;
  }

  .hero-copy {
    max-width: 640px;
  }

  .eyebrow {
    align-items: center;
    background: color-mix(in srgb, var(--ink) 4%, transparent);
    border: 1px solid var(--line);
    border-radius: var(--radius-pill);
    color: var(--muted);
    display: inline-flex;
    font-family: var(--mono);
    font-size: 0.68rem;
    font-weight: 500;
    gap: 0.5rem;
    letter-spacing: 0.16em;
    margin: 0 0 1.25rem;
    padding: 0.3rem 0.7rem 0.3rem 0.6rem;
    text-transform: uppercase;
  }

  .eyebrow::before {
    background: var(--accent);
    border-radius: var(--radius-pill);
    content: "";
    display: inline-block;
    height: 0.45rem;
    width: 0.45rem;
  }

  .lede {
    color: var(--muted);
    font-size: clamp(1.05rem, 1.5vw, 1.2rem);
    line-height: 1.6;
    margin: 0;
    max-width: 60ch;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 2.25rem;
  }

  .primary-action,
  .secondary-action {
    align-items: center;
    border-radius: var(--radius-pill);
    display: inline-flex;
    font-family: var(--sans);
    font-size: 0.95rem;
    font-weight: 600;
    gap: 0.55rem;
    padding: 0.7rem 0.85rem 0.7rem 1.25rem;
    text-decoration: none;
  }

  .secondary-action {
    background: color-mix(in srgb, var(--surface) 70%, transparent);
    border: 1px solid var(--line-strong);
    color: var(--ink);
    padding: 0.7rem 1.25rem;
  }

  .primary-action {
    background: var(--ink);
    box-shadow: var(--shadow-md);
    color: var(--paper);
  }

  .primary-action:hover {
    box-shadow: var(--shadow-lg);
  }

  .secondary-action:hover {
    background: var(--surface);
  }

  .cta-arrow {
    align-items: center;
    background: color-mix(in srgb, var(--green) 90%, transparent);
    border-radius: 50%;
    color: var(--ink);
    display: inline-flex;
    height: 1.5rem;
    justify-content: center;
    width: 1.5rem;
  }

  @media (max-width: 900px) {
    .hero {
      grid-template-columns: 1fr;
    }
  }
`;
