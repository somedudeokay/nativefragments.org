const defaultSlot = "#content-slot";
const cache = new Map();
const inFlight = new Map();

const fragmentUrl = (url) => `${url.pathname}${url.search}`;

const isSelectorSlot = (slot) =>
  slot.startsWith("#") || slot.startsWith(".") || slot.startsWith("[");

const escapeSlot = (value) => String(value).replace(/["\\]/g, "\\$&");

const slotTarget = (slot) =>
  isSelectorSlot(slot)
    ? document.querySelector(slot)
    : document.querySelector(`[data-fragment-slot="${escapeSlot(slot)}"]`);

const slotHeader = (slot) => (isSelectorSlot(slot) ? null : slot);

const fragmentCacheKey = (url, slot) => {
  const requestedSlot = slotHeader(slot);
  return requestedSlot ? `${fragmentUrl(url)}::${requestedSlot}` : fragmentUrl(url);
};

const sameRoute = (url) =>
  url.pathname === window.location.pathname && url.search === window.location.search;

const shouldSkipNavigation = (url, slot, defaultNavigationSlot, pushState) =>
  pushState && slot === defaultNavigationSlot && sameRoute(url);

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

const readFragmentManifest = () => {
  const node = document.querySelector("script[data-fragment-manifest]");
  if (!node?.textContent) return { slots: [], links: [] };

  try {
    return JSON.parse(node.textContent);
  } catch {
    return { slots: [], links: [] };
  }
};

const cachedFragment = (url, ttl, slot) => {
  const cached = cache.get(fragmentCacheKey(url, slot));
  return cached && Date.now() - cached.timestamp < ttl ? cached.html : null;
};

const writeFragmentCache = (url, slot, html) => {
  cache.set(fragmentCacheKey(url, slot), { html, timestamp: Date.now() });
};

const requestFragment = async (url, signal, slot) => {
  const requestedSlot = slotHeader(slot);
  const response = await fetch(fragmentUrl(url), {
    headers: {
      "x-fragment": "true",
      ...(requestedSlot ? { "x-fragment-slot": requestedSlot } : {}),
    },
    signal,
  });
  if (!response.ok) throw new Error(`Fragment request failed: ${response.status}`);
  return response.text();
};

const fetchFragment = async ({ url, signal, ttl, slot }) => {
  const key = fragmentCacheKey(url, slot);
  const cached = cachedFragment(url, ttl, slot);
  if (cached) return cached;
  if (inFlight.has(key)) return inFlight.get(key);

  const request = requestFragment(url, signal, slot)
    .then((html) => {
      writeFragmentCache(url, slot, html);
      return html;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
};

const parseFragment = (html) => {
  const template = document.createElement("template");
  template.innerHTML = html;
  return {
    content: template.content,
    meta: consumeMeta(template.content),
  };
};

const applyFragment = ({ fragment, target, url, slot, pushState, scroll }) => {
  if (pushState) history.pushState({ fragmentSlot: slot }, "", fragmentUrl(url));
  target.replaceChildren(fragment.content);
  setHead(fragment.meta);
  if (scroll) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
};

const routeTo = (href) => new URL(href, window.location.origin);

const shouldHandleLink = (event) =>
  !event.defaultPrevented &&
  !event.metaKey &&
  !event.ctrlKey &&
  !event.shiftKey &&
  !event.altKey &&
  event.button === 0;

const linkFromEvent = (event) =>
  event
    .composedPath()
    .find((item) => item instanceof Element && item.matches?.("a[href]"));

const fallbackToDocument = (url) => {
  window.location.href = fragmentUrl(url);
};

const prefetchMode = (value) => {
  if (value === true || value === undefined) return "intent";
  if (value === false || value === "false" || value === "off") return "none";
  return value;
};

const linkPrefetchMode = (link, fallback) => {
  const value = link.dataset.fragmentPrefetch;
  return prefetchMode(value === undefined ? fallback : value);
};

const shouldPrefetchLink = (link) =>
  link &&
  !link.target &&
  !link.hasAttribute("download") &&
  link.origin === window.location.origin;

/**
 * Prefetch a same-origin fragment into the shared fragment cache.
 *
 * @param {string | URL} href URL to prefetch.
 * @param {{ slot?: string, ttl?: number, signal?: AbortSignal }} [options={}]
 * Prefetch options.
 * @returns {Promise<string | null>} Prefetched fragment HTML, or `null` for
 * skipped cross-origin URLs.
 */
export const prefetchFragment = async (
  href,
  { slot = defaultSlot, ttl = 30_000, signal } = {},
) => {
  const url = routeTo(href);
  if (url.origin !== window.location.origin) return null;
  return fetchFragment({ url, signal, ttl, slot });
};

const installIntentPrefetch = ({ ttl, slot, prefetch }) => {
  const timers = new WeakMap();

  const queue = (link) => {
    if (!shouldPrefetchLink(link) || linkPrefetchMode(link, prefetch) !== "intent") {
      return;
    }
    if (timers.has(link)) return;

    const timer = window.setTimeout(() => {
      timers.delete(link);
      prefetchFragment(link.href, {
        ttl,
        slot: link.dataset.fragmentSlot ?? slot,
      }).catch(() => {});
    }, 65);

    timers.set(link, timer);
  };

  const cancel = (link) => {
    const timer = timers.get(link);
    if (!timer) return;
    window.clearTimeout(timer);
    timers.delete(link);
  };

  document.addEventListener("pointerover", (event) => queue(linkFromEvent(event)));
  document.addEventListener("focusin", (event) => queue(linkFromEvent(event)));
  document.addEventListener("pointerout", (event) => cancel(linkFromEvent(event)));
  document.addEventListener("focusout", (event) => cancel(linkFromEvent(event)));
};

const prefetchLinks = ({ ttl, slot, mode, fallback = "none" }) => {
  for (const link of document.querySelectorAll("a[href]")) {
    if (!shouldPrefetchLink(link) || linkPrefetchMode(link, fallback) !== mode) continue;
    prefetchFragment(link.href, {
      ttl,
      slot: link.dataset.fragmentSlot ?? slot,
    }).catch(() => {});
  }
};

const prefetchManifestLinks = ({ ttl, slot, mode, fallback = "none", manifest }) => {
  for (const link of manifest.links ?? []) {
    if (prefetchMode(link.prefetch ?? fallback) !== mode) continue;
    prefetchFragment(link.href, {
      ttl,
      slot: link.slot ?? slot,
    }).catch(() => {});
  }
};

const installVisiblePrefetch = ({ ttl, slot, fallback = "none" }) => {
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const link = entry.target;
      observer.unobserve(link);
      prefetchFragment(link.href, {
        ttl,
        slot: link.dataset.fragmentSlot ?? slot,
      }).catch(() => {});
    }
  }, { rootMargin: "240px" });

  for (const link of document.querySelectorAll("a[href]")) {
    if (!shouldPrefetchLink(link) || linkPrefetchMode(link, fallback) !== "visible") {
      continue;
    }
    observer.observe(link);
  }
};

/**
 * @typedef {object} FragmentNavigationOptions
 * @property {string} [slot="#content-slot"] Selector for the element replaced
 * by fragment responses.
 * @property {number} [ttl=30000] Fragment cache time in milliseconds.
 * @property {boolean | "none" | "intent" | "visible" | "load"} [prefetch="intent"]
 * Default fragment prefetch behavior. Links can override this with
 * `data-fragment-prefetch="intent|visible|load|none"`.
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
  prefetch = "intent",
  afterNavigate = () => {},
} = {}) => {
  if (!slotTarget(slot)) return;
  let currentController = null;
  const defaultPrefetch = prefetchMode(prefetch);
  const manifest = readFragmentManifest();

  const navigate = async (href, pushState = true, nextSlot = slot) => {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) {
      window.location.href = url.href;
      return;
    }
    if (shouldSkipNavigation(url, nextSlot, slot, pushState)) return;

    const root = slotTarget(nextSlot);
    if (!root) {
      fallbackToDocument(url);
      return;
    }

    currentController?.abort();
    currentController = new AbortController();

    try {
      const html = await fetchFragment({
        url,
        signal: currentController.signal,
        ttl,
        slot: nextSlot,
      });
      const fragment = parseFragment(html);
      applyFragment({
        fragment,
        target: root,
        url,
        slot: nextSlot,
        pushState,
        scroll: nextSlot === slot,
      });
      afterNavigate({ meta: fragment.meta, url, slot: nextSlot });
    } catch (error) {
      if (error.name !== "AbortError") fallbackToDocument(url);
    }
  };

  document.addEventListener("click", (event) => {
    if (!shouldHandleLink(event)) return;

    const link = linkFromEvent(event);
    if (!link || link.target || link.hasAttribute("download")) return;

    const url = routeTo(link.href);
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

  installIntentPrefetch({ ttl, slot, prefetch: defaultPrefetch });
  prefetchManifestLinks({ ttl, slot, mode: "load", fallback: defaultPrefetch, manifest });
  prefetchLinks({ ttl, slot, mode: "load", fallback: defaultPrefetch });
  installVisiblePrefetch({ ttl, slot, fallback: defaultPrefetch });

  window.nativeFragmentsNavigate = navigate;
  window.nativeFragmentsPrefetch = (href, nextSlot = slot) =>
    prefetchFragment(href, { ttl, slot: nextSlot });
  window.nativeFragmentsManifest = manifest;
  return navigate;
};
