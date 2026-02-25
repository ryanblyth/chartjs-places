// Data source URLs and configuration constants
// If you get 404 errors, verify these URLs are correct and accessible

export const MANIFEST_URL = "https://data.storypath.studio/attrs/places/acs5_2024/manifest.json";

export const ATTRS_BASE = "https://data.storypath.studio/attrs/places/acs5_2024/attrs_by_state";

export const ATTRS_FILE = (statefp) => `${ATTRS_BASE}/attrs_places_acs5_2024_${statefp}.json`;

// Places index URL
export const PLACES_INDEX_URL = "https://data.storypath.studio/index/places/places_index_cb_2024_min.json";
