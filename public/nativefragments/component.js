/**
 * Create a constructable stylesheet for Shadow DOM components.
 *
 * @param {string} cssText CSS source.
 * @returns {CSSStyleSheet} Constructable stylesheet.
 */
export const sheet = (cssText) => {
  const styleSheet = new CSSStyleSheet();
  styleSheet.replaceSync(cssText);
  return styleSheet;
};

/**
 * @typedef {object} ShadowOptions
 * @property {CSSStyleSheet[]} [styles=[]] Constructable stylesheets to adopt.
 * @property {string} [html=""] Shadow root HTML.
 * @property {boolean} [hydrate=true] Preserve an existing declarative shadow
 * root on the first render so server-rendered components do not flash.
 */

const hydrated = new WeakSet();

/**
 * Attach or reuse an open shadow root, adopt stylesheets, and set its HTML.
 *
 * If the element already has a declarative shadow root from server HTML, the
 * first call preserves that DOM by default. Later calls update the HTML as
 * usual, which keeps stateful components simple while avoiding refresh FOUC.
 *
 * @param {HTMLElement} element Custom element receiving the shadow root.
 * @param {ShadowOptions} [options={}] Shadow render options.
 * @returns {ShadowRoot} The element's shadow root.
 */
export const shadow = (element, { styles = [], html = "", hydrate = true } = {}) => {
  const root = element.shadowRoot ?? element.attachShadow({ mode: "open" });
  root.adoptedStyleSheets = styles;
  const shouldHydrate = hydrate && root.childNodes.length > 0 && !hydrated.has(root);
  hydrated.add(root);
  if (!shouldHydrate) root.innerHTML = html;
  return root;
};
