import Fuse from 'fuse.js';
import { PLACES_INDEX_URL } from '../config.js';

let places = null;
let fuse = null;

/**
 * Load the places index from the remote URL
 * @returns {Promise<Array>} Array of place objects with {geoid, name, stusps, statefp}
 */
export async function loadPlacesIndex() {
  if (places) {
    return places;
  }
  
  try {
    console.log('Loading places index from:', PLACES_INDEX_URL);
    const response = await fetch(PLACES_INDEX_URL);
    if (!response.ok) {
      const errorMsg = `Failed to load places index (${response.status}): ${response.statusText}. URL: ${PLACES_INDEX_URL}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    places = await response.json();
    console.log(`Loaded ${places.length} places`);
    buildSearchIndex(places);
    return places;
  } catch (error) {
    console.error('Error loading places index:', error);
    console.error('Please verify the URL in src/config.js is correct:', PLACES_INDEX_URL);
    throw error;
  }
}

/**
 * Build a Fuse.js search index from the places array
 * @param {Array} placesArray - Array of place objects
 */
function buildSearchIndex(placesArray) {
  fuse = new Fuse(placesArray, {
    keys: ['name', 'stusps'],
    threshold: 0.4,
    includeScore: true,
  });
}

/**
 * Search places using Fuse.js fuzzy search
 * @param {string} query - Search query string
 * @param {number} limit - Maximum number of results to return (default: 10)
 * @returns {Array} Array of matching place objects
 */
export function searchPlaces(query, limit = 10) {
  if (!fuse) {
    console.warn('Search index not built yet. Call loadPlacesIndex() first.');
    return [];
  }
  
  if (!query || query.trim() === '') {
    return [];
  }
  
  const results = fuse.search(query, { limit });
  return results.map(result => result.item);
}

/**
 * Find a place by geoid
 * @param {string} geoid - Place geoid to find
 * @returns {Object|null} Place object or null if not found
 */
export function findPlaceByGeoid(geoid) {
  if (!places) {
    return null;
  }
  return places.find(p => p.geoid === geoid) || null;
}
