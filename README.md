# Places Chart

A web application for exploring US Census Places with interactive Chart.js visualizations. Search for places by name and view detailed demographic and economic attributes from the American Community Survey (ACS) data.

## Features

- **Typeahead Search**: Fuzzy search for US Census Places using Fuse.js with 250ms debounce
- **Demographics by Number**: Display of 11 key demographic metrics (population, age, households, housing, income)
- **Demographics by %**: Horizontal bar chart showing 12 percentage metrics with automatic sorting of race/ethnicity categories
- **Race Demographics**: Doughnut chart visualizing 5 race/ethnicity categories
- **Commute by %**: Horizontal bar chart displaying 5 commute mode percentages
- **Commute Modes**: Doughnut chart visualizing commute mode distribution
- **Interactive Charts**: Two vertical bar charts displaying:
  - Demographics & Economics (population, income, rent, home values)
  - Social Indicators (unemployment, poverty, education, work from home, homeownership)
- **Colorado Top 10 Cities**: Chart showing the top 10 Colorado cities by population
- **Population Density KPI**: Prominent display of population density per square mile
- **Deep Linking**: Support for URL parameters (`?q=PlaceName` or `?geoid=0846465`)
- **Smart Caching**: State-level attribute caching to minimize API calls

## Search Functionality

The search feature uses Fuse.js for fuzzy matching with the following characteristics:

- **Debounce**: 250ms delay to limit search operations while typing
- **Search Fields**: Searches across place name and state abbreviation (stusps)
- **Fuzzy Matching**: Threshold of 0.4 for flexible matching
- **Results**: Displays top 10 matching places in a dropdown
- **Result Format**: Shows "Place Name, ST (GEOID)" for each result
- **Index Building**: Search index is built once when the app loads from the places index
- **Interaction**: Click any result to select the place and view its detailed data

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

### Searching for Places

1. **Type in the search box**: Start typing a place name (e.g., "Loveland" or "Loveland, CO")
2. **View results**: A dropdown will appear showing up to 10 matching places
3. **Select a place**: Click on any result to view that place's data

### Viewing Place Data

When you select a place, the following information is displayed:

- **Place Header**: Shows the place name, state abbreviation, and GEOID
- **Population Density KPI**: Large display of population density per square mile
- **Demographics by Number**: List of 11 key metrics including:
  - Pop Total, Pop Density Sq Mile, Median Age
  - Households, Housing Units, Avg Household Size
  - Median Home Value, Median Owner Cost Mortgage, Median Gross Rent
  - Per Capita Income, Median Household Income
- **Demographics by %**: Horizontal bar chart with 12 percentage metrics:
  - Race/ethnicity categories (sorted by value, largest first)
  - Age groups, education, housing, labor force, poverty
- **Race Demographics**: Doughnut chart showing 5 race/ethnicity categories
- **Commute by %**: Horizontal bar chart with 5 commute mode percentages
- **Commute Modes**: Doughnut chart visualizing commute mode distribution
- **Demographics & Economics Chart**: Vertical bar chart with population, income, rent, and home value data
- **Social Indicators Chart**: Vertical bar chart with unemployment, poverty, education, and housing percentages

### Deep Linking

- Use `?q=Loveland` in the URL to automatically search for a place by name
- Use `?geoid=0846465` to load a place directly by its GEOID

### Colorado Top 10 Cities

- Scroll to the Colorado section at the bottom of the page
- Click "Load Chart" to view the top 10 Colorado cities by population
- The chart updates automatically with the latest data

## Charts Overview

### Demographics by Number
A single-column list displaying 11 key demographic metrics with proper formatting:
- Numbers: Comma-separated (population, households, housing units)
- Currency: Formatted as $X,XXX (income and cost metrics)
- Decimals: One decimal place (density, age, household size)

### Demographics by % (Horizontal Bar Chart)
Displays 12 percentage metrics:
- **First 5 categories** (race/ethnicity): Automatically sorted by value (largest to smallest)
  - Non-Hispanic White, Hispanic, Black, Asian, Other Non-Hispanic (calculated)
- **Remaining 8 categories**: Fixed order
  - Under 18, Over 65, High School Graduate, Bachelor's or Higher
  - Owner Occupied, Vacant, In Labor Force, Poverty

### Race Demographics (Doughnut Chart)
Visual representation of 5 race/ethnicity categories with legend:
- Non-Hispanic White, Hispanic, Black, Asian, Other Non-Hispanic

### Commute by % (Horizontal Bar Chart)
Displays 5 commute mode percentages in fixed order:
- Drive Alone, Carpool, Transit, Work From Home, Other commute modes (calculated)

### Commute Modes (Doughnut Chart)
Visual representation of 5 commute mode categories with legend

### Demographics & Economics (Vertical Bar Chart)
Shows 5 economic and demographic metrics:
- Population Total, Median Household Income, Median Gross Rent
- Median Home Value, Per Capita Income

### Social Indicators (Vertical Bar Chart)
Shows 5 percentage-based social metrics:
- Unemployment Rate, Poverty Rate, Bachelor's Degree or Higher
- Work from Home, Owner-Occupied Housing

## Data Attributes

### Standard Attributes
The application uses various ACS attributes including:
- `pop_total`, `pop_density_sqmi`, `median_age`
- `households`, `housing_units`, `avg_household_size`
- `median_home_value`, `median_owner_cost_mortgage`, `median_gross_rent`
- `per_capita_income`, `median_hh_income`
- `pct_nonhisp_white`, `pct_hispanic`, `pct_nonhisp_black`, `pct_nonhisp_asian`
- `pct_under18`, `pct_over65`, `pct_hs_grad`, `pct_bach_plus`
- `pct_owner_occ`, `pct_vacant`, `pct_in_labor_force`, `pct_poverty`
- `pct_drive_alone`, `pct_carpool`, `pct_transit`, `pct_wfh`
- `unemployment_rate`, `pct_wfh`

### Calculated Fields

- **Other Non-Hispanic**: Calculated as `100 - (Non-Hispanic White + Hispanic + Black + Asian)` to ensure race/ethnicity categories add up to exactly 100%
- **Other commute modes**: Calculated as `100 - (Drive Alone + Carpool + Transit + Work From Home)` to ensure commute modes add up to exactly 100%

## Data Sources

The application fetches data from:

- **Places Index**: `https://data.storypath.studio/index/places/places_index_cb_2024_min.json`
  - Format: Array of `{geoid, name, stusps, statefp}` objects
- **Attributes**: `https://data.storypath.studio/attrs/places/acs5_2024/attrs_by_state/attrs_places_acs5_2024_{statefp}.json`
  - State-specific attribute files keyed by GEOID
- **Manifest**: `https://data.storypath.studio/attrs/places/acs5_2024/manifest.json`
  - Contains data vintage information

Data is cached per state to optimize performance and reduce API calls.

## Technologies

- **Vite**: Build tool and development server
- **Chart.js**: Chart visualization library (bar charts, doughnut charts)
- **Fuse.js**: Fuzzy search library for typeahead functionality
- **Vanilla JavaScript**: No framework dependencies

## Project Structure

```
chartjs-places/
├── src/
│   ├── config.js                    # Data source URLs and constants
│   ├── main.js                       # Application entry point and UI orchestration
│   ├── data/
│   │   ├── placesIndex.js           # Places index loading and Fuse.js search
│   │   ├── attrsClient.js            # Attributes fetching and state-level caching
│   │   └── coloradoCities.js         # Colorado cities filtering and top 10 logic
│   ├── charts/
│   │   └── charts.js                 # Chart creation and update functions
│   ├── templates/
│   │   └── demographicsTemplate.js   # HTML template for demographics section
│   └── style.css                     # Application styles
├── index.html                         # Main HTML file
├── package.json                       # Dependencies and scripts
├── vite.config.js                     # Vite configuration
└── README.md                          # This file
```

## Development

### Running the App

```bash
npm install
npm run dev
```

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.
