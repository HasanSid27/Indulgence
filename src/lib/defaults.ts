import manifest from "./image-manifest.json";
import { defaultTabs } from "./defaultTabs";
import { buildSiteData, type ImageManifest } from "./sheet";
import { config } from "./config";
import type { SiteData } from "./types";

/** Built-in menu: produced by the very same parser the spreadsheet goes through. */
const built = buildSiteData(defaultTabs, manifest as ImageManifest, undefined, config.bundledMenuPdf);
if (built.fatal || built.warnings.length) {
  // A mistake in defaultTabs.ts would otherwise surface as a half-empty site; fail loudly instead.
  throw new Error(`Built-in menu is invalid: ${built.fatal ?? ""} ${built.warnings.join("; ")}`);
}
export const defaultData: SiteData = { ...built.data, source: "default" };
export const imageManifest = manifest as ImageManifest;
