# Places Chart

A web application for exploring US Census Places with interactive Chart.js visualizations. Search for places by name and view detailed demographic and economic attributes from the American Community Survey (ACS) data.

## Features

- **Typeahead Search**: Fuzzy search for US Census Places using Fuse.js
- **Interactive Charts**: Two bar charts displaying:
  - Demographics & Economics (population, income, rent, home values)
  - Social Indicators (unemployment, poverty, education, work from home, homeownership)
- **Population Density KPI**: Prominent display of population density per square mile
- **Deep Linking**: Support for URL parameters (`?q=PlaceName` or `?geoid=0846465`)
- **Smart Caching**: State-level attribute caching to minimize API calls

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

## Usage

1. **Search for a place**: Type a place name in the search box (e.g., "Loveland" or "Loveland, CO")
2. **Select a result**: Click on a place from the search results
3. **View charts**: The selected place's attributes will be displayed in two interactive charts
4. **Deep linking**: 
   - Use `?q=Loveland` to search for a place by name
   - Use `?geoid=0846465` to load a place directly by its GEOID

## Data Sources

The application fetches data from:

- **Places Index**: `https://data.storypath.studio/index/places/places_index_2024_min.json`
- **Attributes**: `https://data.storypath.studio/attrs/places/acs5_2024/attrs_by_state/attrs_places_acs5_2024_{statefp}.json`
- **Manifest**: `https://data.storypath.studio/attrs/places/acs5_2024/manifest.json`

Data is cached per state to optimize performance and reduce API calls.

## Technologies

- **Vite**: Build tool and development server
- **Chart.js**: Chart visualization library
- **Fuse.js**: Fuzzy search library for typeahead functionality
- **Vanilla JavaScript**: No framework dependencies

## Project Structure

```
chartjs-places/
├── src/
│   ├── config.js          # Data source URLs
│   ├── main.js            # Application entry point
│   ├── data/
│   │   ├── placesIndex.js # Places index loading and search
│   │   └── attrsClient.js # Attributes fetching and caching
│   ├── charts/
│   │   └── charts.js      # Chart creation and updates
│   └── style.css          # Application styles
├── index.html             # Main HTML file
├── package.json           # Dependencies and scripts
└── vite.config.js         # Vite configuration
```
