import { loadPlacesIndex } from './placesIndex.js';
import { loadStateAttrs } from './attrsClient.js';

/**
 * Get all places from a specific state from the places index
 * @param {string} statefp - State FIPS code (2-digit string)
 * @returns {Promise<Array>} Array of place objects for the specified state
 */
export async function getPlacesByState(statefp) {
  const places = await loadPlacesIndex();
  return places.filter(place => place.statefp === statefp);
}

/**
 * Get top N cities by population for a specific state
 * @param {string} statefp - State FIPS code (2-digit string)
 * @param {number} limit - Number of top cities to return (default: 10)
 * @returns {Promise<Array>} Array of {name, geoid, pop_total, stusps} objects, sorted by population descending
 */
export async function getTopCitiesByState(statefp, limit = 10) {
  try {
    // Get all places for the state
    const statePlaces = await getPlacesByState(statefp);
    
    if (statePlaces.length === 0) {
      console.warn(`No places found for state ${statefp}`);
      return [];
    }
    
    // Load state attributes (will use cache if already loaded)
    const stateAttrs = await loadStateAttrs(statefp);
    
    // Get state abbreviation from first place (all places in state should have same stusps)
    const stateAbbr = statePlaces[0]?.stusps || '';
    
    // Combine place info with population data
    const citiesWithPop = statePlaces
      .map(place => {
        const attrs = stateAttrs[place.geoid];
        return {
          name: place.name,
          geoid: place.geoid,
          stusps: place.stusps || stateAbbr,
          pop_total: attrs && attrs.pop_total != null ? Number(attrs.pop_total) : 0,
        };
      })
      .filter(city => city.pop_total > 0) // Only include cities with population data
      .sort((a, b) => b.pop_total - a.pop_total) // Sort descending by population
      .slice(0, limit); // Take top N
    
    return citiesWithPop;
  } catch (error) {
    console.error(`Error getting top cities for state ${statefp}:`, error);
    throw error;
  }
}
