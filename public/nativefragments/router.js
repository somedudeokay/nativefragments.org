const defaultSlot = "#content-slot";
let currentController = null;
const cache = new Map();

const fragmentUrl = (url) => `${url.pathname}${url.search}`;

const isSelectorSlot = (slot) =>
  slot.startsWith("#") || slot.startsWith(".") || slot.startsWith("[");

const escapeSlot = (value) => String(value).replace(/["\\]/g, "\\$&");

const slotTarget = (slot) =>
  isSelectorSlot(slot)
    ? document.querySelector(slot)
    : document.querySelector(`[data-fragment-slot="${escapeSlot(slot)}"]`);

const slotHeader = (slot) => (isSelectorSlot(slot) ? null : slot);

const sameRoute = (url) =>
  url.pathname === window.location.pathname && url.search === window.location.search;

const consumeMeta = (fragment) => {
  const node = fragment.querySelector("script[data-fragment-meta]");
  if (!node?.textContent) return null;
  const meta = JSON.parse(node.textContent);
  node.remove();
  return meta;
};

const setHead = (meta) => {
  if (!meta) return;
  if (meta.title) document.title = meta.title;

  const description = document.head.querySelector('meta[name="description"]');
  if (description && meta.description) {
    description.setAttribute("content", meta.description);
  }

  const canonical = document.head.querySelector('link[rel="canonical"]');
  if (canonical && meta.canonical) canonical.setAttribute("href", meta.canonical);
};

const fetchFragment = async (url, signal, ttl, slot) => {
  const requestedSlot = slotHeader(slot);
  const key = requestedSlot ? `${fragmentUrl(url)}::${requestedSlot}` : fragmentUrl(url);
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) return cached.html;

  const response = await fetch(fragmentUrl(url), {
    headers: {
      "x-fragment": "true",
      ...(requestedSlot ? { "x-fragment-slot": requestedSlot } : {}),
    },
    signal,
  });
  if (!response.ok) throw new Error(`Fragment request failed: ${response.status}`);

  const html = await response.text();
  cache.set(key, { html, timestamp: Date.now() });
  return html;
};

/**
 * @typedef {object} FragmentNavigationOptions
 * @property {string} [slot="#content-slot"] Selector for the element replaced
 * by fragment responses.
 * @property {number} [ttl=30000] Fragment cache time in milliseconds.
 * @property {(event: { meta: object | null, url: URL, slot: string }) => void} [afterNavigate]
 * Callback fired after a successful client-side navigation.
 */

/**
 * Install same-origin fragment navigation.
 *
 * Clicked links are fetched with `x-fragment: true`, the configured content
 * slot is replaced, document metadata is updated, and history state is pushed.
 * Links with `data-fragment-slot="name"` replace only the matching
 * `[data-fragment-slot="name"]` container and send `x-fragment-slot: name`.
 * External links and modified clicks keep normal browser behavior.
 *
 * @param {FragmentNavigationOptions} [options={}] Navigation options.
 * @returns {((href: string, pushState?: boolean, nextSlot?: string) => Promise<void>) | undefined}
 * Navigate function, or `undefined` if the slot does not exist.
 */
export const installFragmentNavigation = ({
  slot = defaultSlot,
  ttl = 30_000,
  afterNavigate = () => {},
} = {}) => {
  if (!slotTarget(slot)) return;

  const navigate = async (href, pushState = true, nextSlot = slot) => {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) {
      window.location.href = url.href;
      return;
    }
    if (pushState && sameRoute(url)) return;

    const root = slotTarget(nextSlot);
    if (!root) {
      window.location.href = fragmentUrl(url);
      return;
    }

    currentController?.abort();
    currentController = new AbortController();

    try {
      const html = await fetchFragment(url, currentController.signal, ttl, nextSlot);
      const template = document.createElement("template");
      template.innerHTML = html;
      const meta = consumeMeta(template.content);

      if (pushState) history.pushState({ fragmentSlot: nextSlot }, "", fragmentUrl(url));
      root.replaceChildren(template.content);
      setHead(meta);
      afterNavigate({ meta, url, slot: nextSlot });
      if (nextSlot === slot) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch (error) {
      if (error.name !== "AbortError") window.location.href = fragmentUrl(url);
    }
  };

  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    const link = event
      .composedPath()
      .find((item) => item instanceof Element && item.matches?.("a[href]"));
    if (!link || link.target || link.hasAttribute("download")) return;

    const url = new URL(link.href);
    if (url.origin !== window.location.origin) return;

    event.preventDefault();
    navigate(fragmentUrl(url), true, link.dataset.fragmentSlot ?? slot);
  });

  window.addEventListener("popstate", (event) => {
    navigate(
      fragmentUrl(new URL(window.location.href)),
      false,
      event.state?.fragmentSlot ?? slot,
    );
  });

  window.nativeFragmentsNavigate = navigate;
  return navigate;
};
