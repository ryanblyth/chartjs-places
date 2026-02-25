import { loadPlacesIndex, searchPlaces, findPlaceByGeoid } from './data/placesIndex.js';
import { loadManifest, getPlaceAttrs } from './data/attrsClient.js';
import { updateCharts, createColoradoTop10Chart } from './charts/charts.js';
import { getTopColoradoCities } from './data/coloradoCities.js';

// DOM elements
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const placeSection = document.getElementById('place-section');
const placeName = document.getElementById('place-name');
const kpiValue = document.getElementById('kpi-value');
const noAttrsMessage = document.getElementById('no-attrs-message');
const errorMessage = document.getElementById('error-message');
const vintageInfo = document.getElementById('vintage-info');
const chart1Canvas = document.getElementById('chart1');
const chart2Canvas = document.getElementById('chart2');
const coloradoSection = document.getElementById('colorado-section');
const coloradoChartCanvas = document.getElementById('colorado-chart');
const loadColoradoBtn = document.getElementById('load-colorado-btn');
const coloradoLoading = document.getElementById('colorado-loading');
const coloradoError = document.getElementById('colorado-error');

// State
let currentPlace = null;
let searchDebounceTimer = null;

/**
 * Debounce function
 */
function debounce(func, wait) {
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(searchDebounceTimer);
      func(...args);
    };
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(later, wait);
  };
}

/**
 * Display vintage information from manifest
 */
async function displayVintage() {
  const manifest = await loadManifest();
  if (manifest && manifest.vintage) {
    vintageInfo.textContent = `Data vintage: ${manifest.vintage}`;
  } else {
    vintageInfo.textContent = 'Data vintage: Unknown';
  }
}

/**
 * Render search results
 */
function renderSearchResults(results) {
  if (!results || results.length === 0) {
    searchResults.classList.remove('show');
    return;
  }

  searchResults.innerHTML = results
    .map(place => {
      const displayName = place.stusps 
        ? `${place.name}, ${place.stusps}`
        : place.name;
      return `
        <div class="search-result-item" data-geoid="${place.geoid}">
          <div class="search-result-name">${place.name}</div>
          <div class="search-result-location">${place.stusps || ''} (${place.geoid})</div>
        </div>
      `;
    })
    .join('');

  // Attach click handlers
  searchResults.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const geoid = item.dataset.geoid;
      selectPlace(geoid);
    });
  });

  searchResults.classList.add('show');
}

/**
 * Handle search input
 */
const handleSearch = debounce(async (query) => {
  if (!query || query.trim() === '') {
    searchResults.classList.remove('show');
    return;
  }

  const results = searchPlaces(query.trim(), 10);
  renderSearchResults(results);
}, 250);

/**
 * Select a place and load its data
 */
async function selectPlace(geoid) {
  // Find place in index
  const place = findPlaceByGeoid(geoid);
  if (!place) {
    console.error(`Place not found: ${geoid}`);
    return;
  }

  currentPlace = place;

  // Update URL
  const url = new URL(window.location);
  url.searchParams.set('geoid', geoid);
  window.history.pushState({ geoid }, '', url);

  // Hide search results
  searchResults.classList.remove('show');
  searchInput.value = '';

  // Update place header
  const displayName = place.stusps 
    ? `${place.name}, ${place.stusps} (${place.geoid})`
    : `${place.name} (${place.geoid})`;
  placeName.textContent = displayName;

  // Show place section
  placeSection.style.display = 'block';

  // Load attributes
  const attrs = await getPlaceAttrs(geoid);

  if (!attrs) {
    // No attributes found
    noAttrsMessage.style.display = 'block';
    kpiValue.textContent = '—';
    return;
  }

  // Hide no-attrs message
  noAttrsMessage.style.display = 'none';

  // Update KPI
  if (attrs.pop_density_sqmi != null) {
    kpiValue.textContent = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 1,
    }).format(attrs.pop_density_sqmi);
  } else {
    kpiValue.textContent = '—';
  }

  // Update charts
  updateCharts(chart1Canvas, chart2Canvas, attrs);
}

/**
 * Handle URL parameters on load
 */
async function handleUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const geoid = urlParams.get('geoid');
  const query = urlParams.get('q');

  if (geoid) {
    // Load place directly by geoid
    await selectPlace(geoid);
  } else if (query) {
    // Populate search and trigger search
    searchInput.value = query;
    handleSearch(query);
  }
}

/**
 * Load and display Colorado top 10 cities chart
 */
async function loadColoradoChart() {
  try {
    // Show loading state
    loadColoradoBtn.disabled = true;
    coloradoLoading.style.display = 'block';
    coloradoError.style.display = 'none';
    loadColoradoBtn.textContent = 'Loading...';

    // Fetch top 10 Colorado cities
    const topCities = await getTopColoradoCities(10);

    if (!topCities || topCities.length === 0) {
      throw new Error('No Colorado cities data available');
    }

    // Create chart
    createColoradoTop10Chart(coloradoChartCanvas, topCities);

    // Hide loading, show success
    coloradoLoading.style.display = 'none';
    loadColoradoBtn.textContent = 'Refresh Chart';
    loadColoradoBtn.disabled = false;

  } catch (error) {
    console.error('Error loading Colorado chart:', error);
    coloradoLoading.style.display = 'none';
    coloradoError.innerHTML = `
      <h3>Error Loading Colorado Chart</h3>
      <p>${error.message}</p>
    `;
    coloradoError.style.display = 'block';
    loadColoradoBtn.disabled = false;
    loadColoradoBtn.textContent = 'Try Again';
  }
}

/**
 * Initialize the application
 */
async function init() {
  try {
    // Load manifest (non-blocking)
    displayVintage();

    // Load places index
    await loadPlacesIndex();
    
    // Enable search input after index loads
    searchInput.disabled = false;

    // Handle URL params
    await handleUrlParams();

    // Set up search input handler
    searchInput.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('show');
      }
    });

    // Handle browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.geoid) {
        selectPlace(e.state.geoid);
      } else {
        placeSection.style.display = 'none';
        currentPlace = null;
      }
    });

    // Set up Colorado chart button
    loadColoradoBtn.addEventListener('click', loadColoradoChart);

  } catch (error) {
    console.error('Error initializing app:', error);
    const errorMsg = error.message || 'Unknown error';
    
    if (errorMsg.includes('places index') || errorMsg.includes('404')) {
      // Show error in UI
      errorMessage.innerHTML = `
        <h3>Failed to Load Places Index</h3>
        <p><strong>Error:</strong> ${errorMsg}</p>
        <p><strong>URL attempted:</strong> <code id="error-url"></code></p>
        <p><strong>Possible solutions:</strong></p>
        <ul style="margin-left: 20px; margin-top: 8px;">
          <li>Verify the URL in <code>src/config.js</code> is correct</li>
          <li>Check if the data source is accessible</li>
          <li>Try alternative URL patterns (e.g., without <code>_min</code> suffix)</li>
          <li>Check your network connection</li>
        </ul>
      `;
      const errorUrlEl = errorMessage.querySelector('#error-url');
      if (errorUrlEl) {
        import('./config.js').then(module => {
          errorUrlEl.textContent = module.PLACES_INDEX_URL;
        });
      }
      errorMessage.style.display = 'block';
      searchInput.placeholder = 'Search unavailable - places index failed to load';
    } else {
      errorMessage.innerHTML = `
        <h3>Application Error</h3>
        <p>${errorMsg}</p>
        <p>Please refresh the page to try again.</p>
      `;
      errorMessage.style.display = 'block';
    }
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
