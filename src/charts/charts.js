import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  ArcElement,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  ArcElement,
  DoughnutController,
  Title,
  Tooltip,
  Legend
);

let coloradoChart = null;
let demographicsPercentChart = null;
let commutePercentChart = null;
let demographicDoughnutChart = null;
let commuteDoughnutChart = null;

/**
 * HTML Legend Plugin for Chart.js
 * Creates an HTML-based legend instead of the default canvas legend
 */
const htmlLegendPlugin = {
  id: 'htmlLegend',
  afterInit(chart, args, options) {
    // Also run on initial chart creation
    this.afterUpdate(chart, args, options);
  },
  afterUpdate(chart, args, options) {
    // Access plugin options from chart configuration
    // Try multiple ways to get the options
    const pluginOptions = chart.options?.plugins?.htmlLegend || 
                         chart.config?.options?.plugins?.htmlLegend || 
                         {};
    const containerID = pluginOptions.containerID;
    
    if (!containerID) {
      console.warn('htmlLegend plugin: containerID not specified. Available plugins:', Object.keys(chart.options?.plugins || {}));
      return;
    }

    const container = document.getElementById(containerID);
    if (!container) {
      console.warn(`htmlLegend plugin: Container with ID "${containerID}" not found. Checking DOM...`);
      // Try to find it with a delay in case it's not rendered yet
      setTimeout(() => {
        const delayedContainer = document.getElementById(containerID);
        if (delayedContainer) {
          this.afterUpdate(chart, args, options);
        } else {
          console.error(`htmlLegend plugin: Container still not found after delay`);
        }
      }, 100);
      return;
    }

    // Ensure we have chart data
    if (!chart.data || !chart.data.labels || !chart.data.datasets || chart.data.datasets.length === 0) {
      console.warn('htmlLegend plugin: Chart data not available', chart.data);
      return;
    }

    let ul = container.querySelector('ul');
    if (!ul) {
      ul = document.createElement('ul');
      container.appendChild(ul);
    }

    ul.innerHTML = '';

    // Generate legend labels from chart data
    const meta = chart.getDatasetMeta(0);
    const dataset = chart.data.datasets[0];
    
    const items = chart.data.labels.map((label, i) => {
      const backgroundColor = Array.isArray(dataset.backgroundColor) 
        ? dataset.backgroundColor[i] 
        : dataset.backgroundColor;
      const borderColor = Array.isArray(dataset.borderColor)
        ? dataset.borderColor[i]
        : dataset.borderColor;
      
      // Check if the data point is hidden - meta.data[i] exists and has hidden property
      const dataPoint = meta.data[i];
      // Chart.js stores hidden state as a boolean on the data point
      const isHidden = dataPoint && dataPoint.hidden === true;
      
      return {
        text: label,
        fillStyle: backgroundColor,
        strokeStyle: borderColor,
        hidden: isHidden,
        index: i,
      };
    });

    items.forEach((item) => {
      const li = document.createElement('li');

      li.onclick = () => {
        chart.toggleDataVisibility(item.index);
        chart.update();
      };

      const box = document.createElement('span');
      box.className = 'box';
      box.style.background = item.fillStyle;
      box.style.borderColor = item.strokeStyle;

      const text = document.createElement('span');
      text.textContent = item.text;
      text.className = 'legend-text';
      
      // Check hidden state using Chart.js's built-in method
      // getDataVisibility returns true if visible, false if hidden
      const isVisible = chart.getDataVisibility(item.index);
      const isCurrentlyHidden = !isVisible;
      
      if (isCurrentlyHidden) {
        li.classList.add('legend-item-hidden');
      } else {
        li.classList.remove('legend-item-hidden');
      }

      li.appendChild(box);
      li.appendChild(text);
      ul.appendChild(li);
    });
  }
};

/**
 * Get label color based on current theme
 * @returns {string} Color hex code for labels
 */
function getLabelColor() {
  const container = document.querySelector('.container');
  if (container && container.classList.contains('dark')) {
    return '#e0e0e0'; // Light color for dark theme
  }
  return '#666666'; // Dark color for light theme
}

/**
 * Format number with commas
 */
function formatNumber(num) {
  if (num == null || num === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Format currency
 */
function formatCurrency(num) {
  if (num == null || num === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format percentage
 */
function formatPercent(num) {
  if (num == null || num === undefined) return 'N/A';
  return `${num.toFixed(1)}%`;
}

/**
 * Safely get numeric value or return 0
 */
function safeNumber(value) {
  if (value == null || value === undefined || isNaN(value)) {
    return 0;
  }
  return Number(value);
}

/**
 * Create Colorado Top 10 Cities chart
 * @param {HTMLCanvasElement} canvas - Canvas element for the chart
 * @param {Array} data - Array of {name, geoid, pop_total, stusps} objects
 */
export function createColoradoTop10Chart(canvas, data) {
  if (!canvas) {
    console.error('Colorado chart: Canvas element not found');
    return null;
  }
  
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.error('Colorado chart: Invalid or empty data');
    return null;
  }

  try {
    // Destroy existing chart if it exists
    if (coloradoChart) {
      coloradoChart.destroy();
      coloradoChart = null;
    }

    // Prepare chart data
    const labels = data.map(city => city.name);
    const populations = data.map(city => safeNumber(city.pop_total));

    const chartData = {
      labels: labels,
      datasets: [{
        label: 'Population',
        data: populations,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    };

    coloradoChart = new Chart(canvas, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Top 10 Colorado Cities by Population',
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.parsed.y;
                return `Population: ${formatNumber(value)}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: getLabelColor(),
              callback: function(value) {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(1)}M`;
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`;
                }
                return formatNumber(value);
              },
            },
          },
          x: {
            ticks: {
              color: getLabelColor(),
              maxRotation: 45,
              minRotation: 0,
            },
          },
        },
      },
    });

    return coloradoChart;
  } catch (error) {
    console.error('Error creating Colorado chart:', error);
    return null;
  }
}

/**
 * Create Demographics by Percentage chart (horizontal bar chart)
 * @param {HTMLCanvasElement} canvas - Canvas element for the chart
 * @param {Object} attrs - Place attributes object
 */
export function createDemographicsPercentChart(canvas, attrs) {
  if (!canvas) {
    console.error('Demographics Percent chart: Canvas element not found');
    return null;
  }
  
  if (!attrs) {
    console.error('Demographics Percent chart: Attributes object is null or undefined');
    return null;
  }

  try {
    // Update existing chart if it exists, otherwise create new one
    if (demographicsPercentChart) {
      updateDemographicsPercentChart(attrs);
      return demographicsPercentChart;
    }

    // Define first 5 metrics (demographic/ethnicity) and remaining 8 metrics
    // Calculate "Other Non-Hispanic" as remainder to make demographic/ethnicity categories add up to 100%
    const pctNonhispWhite = safeNumber(attrs.pct_nonhisp_white);
    const pctHispanic = safeNumber(attrs.pct_hispanic);
    const pctNonhispBlack = safeNumber(attrs.pct_nonhisp_black);
    const pctNonhispAsian = safeNumber(attrs.pct_nonhisp_asian);
    const otherNonHispanic = Math.max(0, 100 - (pctNonhispWhite + pctHispanic + pctNonhispBlack + pctNonhispAsian));

    const first5Metrics = [
      { label: 'Non-Hispanic White', value: pctNonhispWhite, attr: 'pct_nonhisp_white' },
      { label: 'Hispanic', value: pctHispanic, attr: 'pct_hispanic' },
      { label: 'Black', value: pctNonhispBlack, attr: 'pct_nonhisp_black' },
      { label: 'Asian', value: pctNonhispAsian, attr: 'pct_nonhisp_asian' },
      { label: 'Other Non-Hispanic', value: otherNonHispanic, attr: 'other_non_hispanic' },
    ];

    const remainingMetrics = [
      { label: 'Under 18', value: safeNumber(attrs.pct_under18), attr: 'pct_under18' },
      { label: 'Over 65', value: safeNumber(attrs.pct_over65), attr: 'pct_over65' },
      { label: 'High School Graduate', value: safeNumber(attrs.pct_hs_grad), attr: 'pct_hs_grad' },
      { label: 'Bachelor\'s or Higher', value: safeNumber(attrs.pct_bach_plus), attr: 'pct_bach_plus' },
      { label: 'Owner Occupied', value: safeNumber(attrs.pct_owner_occ), attr: 'pct_owner_occ' },
      { label: 'Vacant', value: safeNumber(attrs.pct_vacant), attr: 'pct_vacant' },
      { label: 'In Labor Force', value: safeNumber(attrs.pct_in_labor_force), attr: 'pct_in_labor_force' },
      { label: 'Poverty', value: safeNumber(attrs.pct_poverty), attr: 'pct_poverty' },
    ];

    // Sort first 5 metrics by value (descending)
    const sortedFirst5 = [...first5Metrics].sort((a, b) => b.value - a.value);

    // Combine sorted first 5 with remaining 8
    const allMetrics = [...sortedFirst5, ...remainingMetrics];

    const data = {
      labels: allMetrics.map(m => m.label),
      datasets: [{
        label: 'Percentage',
        data: allMetrics.map(m => m.value),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      }],
    };

    demographicsPercentChart = new Chart(canvas, {
      type: 'bar',
      data: data,
      options: {
        indexAxis: 'y', // Horizontal bars
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${formatPercent(context.parsed.x)}`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: getLabelColor(),
              callback: function(value) {
                return `${value}%`;
              },
            },
          },
          y: {
            ticks: {
              color: getLabelColor(),
              maxRotation: 45,
              minRotation: 0,
            },
          },
        },
      },
    });

    return demographicsPercentChart;
  } catch (error) {
    console.error('Error creating Demographics Percent chart:', error);
    return null;
  }
}

/**
 * Update Demographics Percent chart with new data
 */
export function updateDemographicsPercentChart(attrs) {
  if (!demographicsPercentChart) return;
  if (!attrs) {
    console.warn('Demographics Percent chart: Cannot update with null attributes');
    return;
  }
  
  try {
    // Define first 5 metrics (demographic/ethnicity) and remaining 8 metrics
    // Calculate "Other Non-Hispanic" as remainder to make demographic/ethnicity categories add up to 100%
    const pctNonhispWhite = safeNumber(attrs.pct_nonhisp_white);
    const pctHispanic = safeNumber(attrs.pct_hispanic);
    const pctNonhispBlack = safeNumber(attrs.pct_nonhisp_black);
    const pctNonhispAsian = safeNumber(attrs.pct_nonhisp_asian);
    const otherNonHispanic = Math.max(0, 100 - (pctNonhispWhite + pctHispanic + pctNonhispBlack + pctNonhispAsian));

    const first5Metrics = [
      { label: 'Non-Hispanic White', value: pctNonhispWhite, attr: 'pct_nonhisp_white' },
      { label: 'Hispanic', value: pctHispanic, attr: 'pct_hispanic' },
      { label: 'Black', value: pctNonhispBlack, attr: 'pct_nonhisp_black' },
      { label: 'Asian', value: pctNonhispAsian, attr: 'pct_nonhisp_asian' },
      { label: 'Other Non-Hispanic', value: otherNonHispanic, attr: 'other_non_hispanic' },
    ];

    const remainingMetrics = [
      { label: 'Under 18', value: safeNumber(attrs.pct_under18), attr: 'pct_under18' },
      { label: 'Over 65', value: safeNumber(attrs.pct_over65), attr: 'pct_over65' },
      { label: 'High School Graduate', value: safeNumber(attrs.pct_hs_grad), attr: 'pct_hs_grad' },
      { label: 'Bachelor\'s or Higher', value: safeNumber(attrs.pct_bach_plus), attr: 'pct_bach_plus' },
      { label: 'Owner Occupied', value: safeNumber(attrs.pct_owner_occ), attr: 'pct_owner_occ' },
      { label: 'Vacant', value: safeNumber(attrs.pct_vacant), attr: 'pct_vacant' },
      { label: 'In Labor Force', value: safeNumber(attrs.pct_in_labor_force), attr: 'pct_in_labor_force' },
      { label: 'Poverty', value: safeNumber(attrs.pct_poverty), attr: 'pct_poverty' },
    ];

    // Sort first 5 metrics by value (descending)
    const sortedFirst5 = [...first5Metrics].sort((a, b) => b.value - a.value);

    // Combine sorted first 5 with remaining 8
    const allMetrics = [...sortedFirst5, ...remainingMetrics];

    // Update chart labels and data
    demographicsPercentChart.data.labels = allMetrics.map(m => m.label);
    demographicsPercentChart.data.datasets[0].data = allMetrics.map(m => m.value);
    
    demographicsPercentChart.update();
  } catch (error) {
    console.error('Error updating Demographics Percent chart:', error);
  }
}

/**
 * Create Commute by Percentage chart (horizontal bar chart)
 * @param {HTMLCanvasElement} canvas - Canvas element for the chart
 * @param {Object} attrs - Place attributes object
 */
export function createCommutePercentChart(canvas, attrs) {
  if (!canvas) {
    console.error('Commute Percent chart: Canvas element not found');
    return null;
  }
  
  if (!attrs) {
    console.error('Commute Percent chart: Attributes object is null or undefined');
    return null;
  }

  try {
    // Update existing chart if it exists, otherwise create new one
    if (commutePercentChart) {
      updateCommutePercentChart(attrs);
      return commutePercentChart;
    }

    // Calculate "Other commute modes" as remainder to make main commute modes add up to 100%
    const pctDriveAlone = safeNumber(attrs.pct_drive_alone);
    const pctCarpool = safeNumber(attrs.pct_carpool);
    const pctTransit = safeNumber(attrs.pct_transit);
    const pctWfh = safeNumber(attrs.pct_wfh);
    const otherCommuteModes = Math.max(0, 100 - (pctDriveAlone + pctCarpool + pctTransit + pctWfh));

    const data = {
      labels: [
        'Drive Alone',
        'Carpool',
        'Transit',
        'Work From Home',
        'Other commute modes',
      ],
      datasets: [{
        label: 'Percentage',
        data: [
          pctDriveAlone,
          pctCarpool,
          pctTransit,
          pctWfh,
          otherCommuteModes,
        ],
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      }],
    };

    commutePercentChart = new Chart(canvas, {
      type: 'bar',
      data: data,
      options: {
        indexAxis: 'y', // Horizontal bars
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${formatPercent(context.parsed.x)}`;
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: getLabelColor(),
              callback: function(value) {
                return `${value}%`;
              },
            },
          },
          y: {
            ticks: {
              color: getLabelColor(),
              maxRotation: 45,
              minRotation: 0,
            },
          },
        },
      },
    });

    return commutePercentChart;
  } catch (error) {
    console.error('Error creating Commute Percent chart:', error);
    return null;
  }
}

/**
 * Update Commute Percent chart with new data
 */
export function updateCommutePercentChart(attrs) {
  if (!commutePercentChart) return;
  if (!attrs) {
    console.warn('Commute Percent chart: Cannot update with null attributes');
    return;
  }
  
  try {
    // Calculate "Other commute modes" as remainder to make main commute modes add up to 100%
    const pctDriveAlone = safeNumber(attrs.pct_drive_alone);
    const pctCarpool = safeNumber(attrs.pct_carpool);
    const pctTransit = safeNumber(attrs.pct_transit);
    const pctWfh = safeNumber(attrs.pct_wfh);
    const otherCommuteModes = Math.max(0, 100 - (pctDriveAlone + pctCarpool + pctTransit + pctWfh));

    commutePercentChart.data.labels = [
      'Drive Alone',
      'Carpool',
      'Transit',
      'Work From Home',
      'Other commute modes',
    ];
    
    commutePercentChart.data.datasets[0].data = [
      pctDriveAlone,
      pctCarpool,
      pctTransit,
      pctWfh,
      otherCommuteModes,
    ];
    
    commutePercentChart.update();
  } catch (error) {
    console.error('Error updating Commute Percent chart:', error);
  }
}

/**
 * Create Demographics Doughnut chart
 * @param {HTMLCanvasElement} canvas - Canvas element for the chart
 * @param {Object} attrs - Place attributes object
 */
export function createDemographicDoughnutChart(canvas, attrs) {
  if (!canvas) {
    console.error('Demographic Doughnut chart: Canvas element not found');
    return null;
  }
  
  if (!attrs) {
    console.error('Demographic Doughnut chart: Attributes object is null or undefined');
    return null;
  }

  try {
    // Update existing chart if it exists, otherwise create new one
    if (demographicDoughnutChart) {
      updateDemographicDoughnutChart(attrs);
      return demographicDoughnutChart;
    }

    // Calculate demographic/ethnicity percentages (same as Demographics by % chart)
    const pctNonhispWhite = safeNumber(attrs.pct_nonhisp_white);
    const pctHispanic = safeNumber(attrs.pct_hispanic);
    const pctNonhispBlack = safeNumber(attrs.pct_nonhisp_black);
    const pctNonhispAsian = safeNumber(attrs.pct_nonhisp_asian);
    const otherNonHispanic = Math.max(0, 100 - (pctNonhispWhite + pctHispanic + pctNonhispBlack + pctNonhispAsian));

    const data = {
      labels: [
        'Non-Hispanic White',
        'Hispanic',
        'Black',
        'Asian',
        'Other Non-Hispanic',
      ],
      datasets: [{
        label: 'Percentage',
        data: [
          pctNonhispWhite,
          pctHispanic,
          pctNonhispBlack,
          pctNonhispAsian,
          otherNonHispanic,
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 2,
      }],
    };

    demographicDoughnutChart = new Chart(canvas, {
      type: 'doughnut',
      data: data,
      plugins: [htmlLegendPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // Disable default legend, using HTML legend instead
          },
          htmlLegend: {
            containerID: 'demographic-doughnut-legend',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${formatPercent(value)}`;
              },
            },
          },
        },
      },
    });

    return demographicDoughnutChart;
  } catch (error) {
    console.error('Error creating Demographic Doughnut chart:', error);
    return null;
  }
}

/**
 * Update Demographic Doughnut chart with new data
 */
export function updateDemographicDoughnutChart(attrs) {
  if (!demographicDoughnutChart) return;
  if (!attrs) {
    console.warn('Demographic Doughnut chart: Cannot update with null attributes');
    return;
  }
  
  try {
    // Calculate demographic/ethnicity percentages (same as Demographics by % chart)
    const pctNonhispWhite = safeNumber(attrs.pct_nonhisp_white);
    const pctHispanic = safeNumber(attrs.pct_hispanic);
    const pctNonhispBlack = safeNumber(attrs.pct_nonhisp_black);
    const pctNonhispAsian = safeNumber(attrs.pct_nonhisp_asian);
    const otherNonHispanic = Math.max(0, 100 - (pctNonhispWhite + pctHispanic + pctNonhispBlack + pctNonhispAsian));

    demographicDoughnutChart.data.datasets[0].data = [
      pctNonhispWhite,
      pctHispanic,
      pctNonhispBlack,
      pctNonhispAsian,
      otherNonHispanic,
    ];
    
    demographicDoughnutChart.update();
  } catch (error) {
    console.error('Error updating Demographic Doughnut chart:', error);
  }
}

/**
 * Create Commute Doughnut chart
 * @param {HTMLCanvasElement} canvas - Canvas element for the chart
 * @param {Object} attrs - Place attributes object
 */
export function createCommuteDoughnutChart(canvas, attrs) {
  if (!canvas) {
    console.error('Commute Doughnut chart: Canvas element not found');
    return null;
  }
  
  if (!attrs) {
    console.error('Commute Doughnut chart: Attributes object is null or undefined');
    return null;
  }

  try {
    // Update existing chart if it exists, otherwise create new one
    if (commuteDoughnutChart) {
      updateCommuteDoughnutChart(attrs);
      return commuteDoughnutChart;
    }

    // Calculate commute percentages (same as Commute by % chart)
    const pctDriveAlone = safeNumber(attrs.pct_drive_alone);
    const pctCarpool = safeNumber(attrs.pct_carpool);
    const pctTransit = safeNumber(attrs.pct_transit);
    const pctWfh = safeNumber(attrs.pct_wfh);
    const otherCommuteModes = Math.max(0, 100 - (pctDriveAlone + pctCarpool + pctTransit + pctWfh));

    const data = {
      labels: [
        'Drive Alone',
        'Carpool',
        'Transit',
        'Work From Home',
        'Other commute modes',
      ],
      datasets: [{
        label: 'Percentage',
        data: [
          pctDriveAlone,
          pctCarpool,
          pctTransit,
          pctWfh,
          otherCommuteModes,
        ],
        backgroundColor: [
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(201, 203, 207, 0.8)',
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(201, 203, 207, 1)',
        ],
        borderWidth: 2,
      }],
    };

    commuteDoughnutChart = new Chart(canvas, {
      type: 'doughnut',
      data: data,
      plugins: [htmlLegendPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // Disable default legend, using HTML legend instead
          },
          htmlLegend: {
            containerID: 'commute-doughnut-legend',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${formatPercent(value)}`;
              },
            },
          },
        },
      },
    });

    return commuteDoughnutChart;
  } catch (error) {
    console.error('Error creating Commute Doughnut chart:', error);
    return null;
  }
}

/**
 * Update Commute Doughnut chart with new data
 */
export function updateCommuteDoughnutChart(attrs) {
  if (!commuteDoughnutChart) return;
  if (!attrs) {
    console.warn('Commute Doughnut chart: Cannot update with null attributes');
    return;
  }
  
  try {
    // Calculate commute percentages (same as Commute by % chart)
    const pctDriveAlone = safeNumber(attrs.pct_drive_alone);
    const pctCarpool = safeNumber(attrs.pct_carpool);
    const pctTransit = safeNumber(attrs.pct_transit);
    const pctWfh = safeNumber(attrs.pct_wfh);
    const otherCommuteModes = Math.max(0, 100 - (pctDriveAlone + pctCarpool + pctTransit + pctWfh));

    commuteDoughnutChart.data.datasets[0].data = [
      pctDriveAlone,
      pctCarpool,
      pctTransit,
      pctWfh,
      otherCommuteModes,
    ];
    
    commuteDoughnutChart.update();
  } catch (error) {
    console.error('Error updating Commute Doughnut chart:', error);
  }
}

/**
 * Update all chart label colors based on current theme
 */
export function updateChartLabelColors() {
  const labelColor = getLabelColor();
  const charts = [coloradoChart, demographicsPercentChart, commutePercentChart];
  
  charts.forEach(chart => {
    if (chart && chart.options && chart.options.scales) {
      Object.keys(chart.options.scales).forEach(scaleKey => {
        if (chart.options.scales[scaleKey].ticks) {
          chart.options.scales[scaleKey].ticks.color = labelColor;
        }
      });
      chart.update();
    }
  });
}

/**
 * Destroy charts (cleanup)
 */
export function destroyCharts() {
  if (coloradoChart) {
    coloradoChart.destroy();
    coloradoChart = null;
  }
  if (demographicsPercentChart) {
    demographicsPercentChart.destroy();
    demographicsPercentChart = null;
  }
  if (commutePercentChart) {
    commutePercentChart.destroy();
    commutePercentChart = null;
  }
  if (demographicDoughnutChart) {
    demographicDoughnutChart.destroy();
    demographicDoughnutChart = null;
  }
  if (commuteDoughnutChart) {
    commuteDoughnutChart.destroy();
    commuteDoughnutChart = null;
  }
}
