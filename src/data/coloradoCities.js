import { loadPlacesIndex } from './placesIndex.js';
import { loadStateAttrs } from './attrsClient.js';

// Colorado state FIPS code
const COLORADO_STATEFP = '08';

/**
 * Get all Colorado places from the places index
 * @returns {Promise<Array>} Array of Colorado place objects
 */
export async function getColoradoPlaces() {
  const places = await loadPlacesIndex();
  return places.filter(place => place.statefp === COLORADO_STATEFP);
}

/**
 * Get top N Colorado cities by population
 * @param {number} limit - Number of top cities to return (default: 10)
 * @returns {Promise<Array>} Array of {name, geoid, pop_total, stusps} objects, sorted by population descending
 */
export async function getTopColoradoCities(limit = 10) {
  try {
    // Get all Colorado places
    const coloradoPlaces = await getColoradoPlaces();
    
    if (coloradoPlaces.length === 0) {
      console.warn('No Colorado places found');
      return [];
    }
    
    // Load Colorado state attributes (will use cache if already loaded)
    const coloradoAttrs = await loadStateAttrs(COLORADO_STATEFP);
    
    // Combine place info with population data
    const citiesWithPop = coloradoPlaces
      .map(place => {
        const attrs = coloradoAttrs[place.geoid];
        return {
          name: place.name,
          geoid: place.geoid,
          stusps: place.stusps || 'CO',
          pop_total: attrs && attrs.pop_total != null ? Number(attrs.pop_total) : 0,
        };
      })
      .filter(city => city.pop_total > 0) // Only include cities with population data
      .sort((a, b) => b.pop_total - a.pop_total) // Sort descending by population
      .slice(0, limit); // Take top N
    
    return citiesWithPop;
  } catch (error) {
    console.error('Error getting top Colorado cities:', error);
    throw error;
  }
}
