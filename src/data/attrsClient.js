import { MANIFEST_URL, ATTRS_FILE } from '../config.js';

// Cache for state-level attributes
const attrsCache = new Map();

/**
 * Load the manifest JSON for displaying vintage information
 * @returns {Promise<Object|null>} Manifest object or null if fetch fails
 */
export async function loadManifest() {
  try {
    const response = await fetch(MANIFEST_URL);
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading manifest:', error);
    return null;
  }
}

/**
 * Load attributes for a specific state
 * @param {string} statefp - State FIPS code (2-digit string)
 * @returns {Promise<Object>} State attributes object keyed by geoid
 */
export async function loadStateAttrs(statefp) {
  // Check cache first
  if (attrsCache.has(statefp)) {
    return attrsCache.get(statefp);
  }
  
  try {
    const url = ATTRS_FILE(statefp);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load state attrs for ${statefp}: ${response.statusText}`);
    }
    const attrs = await response.json();
    
    // Cache the result
    attrsCache.set(statefp, attrs);
    
    return attrs;
  } catch (error) {
    console.error(`Error loading state attrs for ${statefp}:`, error);
    throw error;
  }
}

/**
 * Get attributes for a specific place by geoid
 * @param {string} geoid - Place geoid (full 7-digit string)
 * @returns {Promise<Object|null>} Place attributes object or null if not found
 */
export async function getPlaceAttrs(geoid) {
  if (!geoid || geoid.length < 2) {
    return null;
  }
  
  // Extract statefp from geoid (first 2 characters)
  const statefp = geoid.slice(0, 2);
  
  try {
    // Load state attrs (will use cache if available)
    const stateAttrs = await loadStateAttrs(statefp);
    
    // Return the specific place's attrs or null if not found
    return stateAttrs[geoid] || null;
  } catch (error) {
    console.error(`Error getting place attrs for ${geoid}:`, error);
    return null;
  }
}
