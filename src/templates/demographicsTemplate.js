/**
 * Template for rendering Demographics by Number section
 * 
 * This file contains the HTML structure for the demographics section.
 * Edit this file to experiment with different layouts and structures.
 * 
 * @param {Array} metrics - Array of {label, value} objects with formatted values
 * @returns {string} HTML string for the demographics section
 */
export function renderDemographicsHTML(metrics) {
  // You can modify the HTML structure below to experiment with different layouts
  // Current structure: Single-column list with label/value pairs
  
  const itemsHTML = metrics
    .map(
      metric => `
      <li class="demographics-item">
        <span class="demographics-label">${metric.label}</span>
        <span class="demographics-value">${metric.value}</span>
      </li>
    `
    )
    .join('');

  return `
    <ul class="demographics-list">
      ${itemsHTML}
    </ul>
  `;
}
