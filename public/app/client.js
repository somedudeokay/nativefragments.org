import { installFragmentNavigation } from "/nativefragments/router.js";
import "./components/site-header.js";
import "./components/runtime-map.js";

installFragmentNavigation({
  afterNavigate() {
    document.querySelector("nf-site-header")?.sync?.();
  },
});
