import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
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
  Title,
  Tooltip,
  Legend
);

let chart1 = null;
let chart2 = null;
let coloradoChart = null;

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
 * Create or update Chart 1: Demographics and Economics
 * @param {HTMLCanvasElement} canvas - Canvas element for the chart
 * @param {Object} attrs - Place attributes object
 */
export function createChart1(canvas, attrs) {
  if (!canvas) {
    console.error('Chart 1: Canvas element not found');
    return null;
  }
  
  if (!attrs) {
    console.error('Chart 1: Attributes object is null or undefined');
    return null;
  }

  try {
    if (chart1) {
      updateChart1(attrs);
      return chart1;
    }

    const data = {
      labels: [
        'Population Total',
        'Median HH Income',
        'Median Gross Rent',
        'Median Home Value',
        'Per Capita Income',
      ],
      datasets: [{
        label: 'Value',
        data: [
          safeNumber(attrs.pop_total),
          safeNumber(attrs.median_hh_income),
          safeNumber(attrs.median_gross_rent),
          safeNumber(attrs.median_home_value),
          safeNumber(attrs.per_capita_income),
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      }],
    };

    chart1 = new Chart(canvas, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Demographics & Economics',
        },
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const value = context.parsed.y;
              const label = context.label;
              
              if (label === 'Population Total') {
                return `Population: ${formatNumber(value)}`;
              } else if (label.includes('Income') || label.includes('Rent') || label.includes('Value')) {
                return `${label}: ${formatCurrency(value)}`;
              }
              return `${label}: ${formatNumber(value)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              if (value >= 1000000) {
                return `$${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `$${(value / 1000).toFixed(0)}K`;
              }
              return formatNumber(value);
            },
          },
        },
      },
    },
    });

    return chart1;
  } catch (error) {
    console.error('Error creating Chart 1:', error);
    return null;
  }
}

/**
 * Update Chart 1 with new data
 */
function updateChart1(attrs) {
  if (!chart1) return;
  if (!attrs) {
    console.warn('Chart 1: Cannot update with null attributes');
    return;
  }
  
  try {
    chart1.data.datasets[0].data = [
      safeNumber(attrs.pop_total),
      safeNumber(attrs.median_hh_income),
      safeNumber(attrs.median_gross_rent),
      safeNumber(attrs.median_home_value),
      safeNumber(attrs.per_capita_income),
    ];
    
    chart1.update();
  } catch (error) {
    console.error('Error updating Chart 1:', error);
  }
}

/**
 * Create or update Chart 2: Social Indicators
 * @param {HTMLCanvasElement} canvas - Canvas element for the chart
 * @param {Object} attrs - Place attributes object
 */
export function createChart2(canvas, attrs) {
  if (!canvas) {
    console.error('Chart 2: Canvas element not found');
    return null;
  }
  
  if (!attrs) {
    console.error('Chart 2: Attributes object is null or undefined');
    return null;
  }

  try {
    if (chart2) {
      updateChart2(attrs);
      return chart2;
    }

    const data = {
      labels: [
        'Unemployment Rate',
        'Poverty Rate',
        'Bachelor\'s+',
        'Work from Home',
        'Owner-Occupied',
      ],
      datasets: [{
        label: 'Percentage',
        data: [
          safeNumber(attrs.unemployment_rate),
          safeNumber(attrs.pct_poverty),
          safeNumber(attrs.pct_bach_plus),
          safeNumber(attrs.pct_wfh),
          safeNumber(attrs.pct_owner_occ),
        ],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      }],
    };

    chart2 = new Chart(canvas, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Social Indicators (%)',
        },
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${formatPercent(context.parsed.y)}`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return `${value}%`;
            },
          },
        },
      },
    },
    });

    return chart2;
  } catch (error) {
    console.error('Error creating Chart 2:', error);
    return null;
  }
}

/**
 * Update Chart 2 with new data
 */
function updateChart2(attrs) {
  if (!chart2) return;
  if (!attrs) {
    console.warn('Chart 2: Cannot update with null attributes');
    return;
  }
  
  try {
    chart2.data.datasets[0].data = [
      safeNumber(attrs.unemployment_rate),
      safeNumber(attrs.pct_poverty),
      safeNumber(attrs.pct_bach_plus),
      safeNumber(attrs.pct_wfh),
      safeNumber(attrs.pct_owner_occ),
    ];
    
    chart2.update();
  } catch (error) {
    console.error('Error updating Chart 2:', error);
  }
}

/**
 * Update both charts with new attributes
 * @param {HTMLCanvasElement} canvas1 - Canvas for chart 1
 * @param {HTMLCanvasElement} canvas2 - Canvas for chart 2
 * @param {Object} attrs - Place attributes object
 */
export function updateCharts(canvas1, canvas2, attrs) {
  if (!attrs) {
    console.warn('updateCharts: Attributes object is null or undefined');
    return;
  }
  
  if (!canvas1 || !canvas2) {
    console.error('updateCharts: Canvas elements not found');
    return;
  }
  
  try {
    if (!chart1) {
      createChart1(canvas1, attrs);
    } else {
      updateChart1(attrs);
    }
    
    if (!chart2) {
      createChart2(canvas2, attrs);
    } else {
      updateChart2(attrs);
    }
  } catch (error) {
    console.error('Error updating charts:', error);
  }
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
 * Destroy charts (cleanup)
 */
export function destroyCharts() {
  if (chart1) {
    chart1.destroy();
    chart1 = null;
  }
  if (chart2) {
    chart2.destroy();
    chart2 = null;
  }
  if (coloradoChart) {
    coloradoChart.destroy();
    coloradoChart = null;
  }
}
