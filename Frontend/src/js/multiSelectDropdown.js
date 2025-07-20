/**
 * Custom Dropdown Functionality for Multi-Select Filters
 *
 * This script enhances the multi-select dropdowns in the Market Year Data component
 * by providing a custom dropdown UI while maintaining the native multi-select functionality.
 */

document.addEventListener("DOMContentLoaded", function () {
  // Initialize dropdowns when DOM is loaded
  initMultiSelectDropdowns();
});

function initMultiSelectDropdowns() {
  // Find all filter elements with multiple attribute
  const multiSelects = document.querySelectorAll(".filter-select[multiple]");

  multiSelects.forEach((multiSelect) => {
    // Create the dropdown wrapper and components
    setupDropdownUI(multiSelect);

    // Initialize event handlers
    initializeEventHandlers(multiSelect);
  });
}

function setupDropdownUI(multiSelect) {
  // Get parent filter item
  const filterItem = multiSelect.closest(".filter-item");

  // Create container with dropdown elements
  const container = document.createElement("div");
  container.className = "filter-select-container";

  // Create the dropdown toggle button
  const dropdownToggle = document.createElement("div");
  dropdownToggle.className = "filter-select-dropdown";

  // Add text element for selected options display
  const dropdownText = document.createElement("span");
  dropdownText.className = "filter-select-dropdown-text";
  dropdownText.textContent = "Select options...";
  dropdownToggle.appendChild(dropdownText);

  // Add overlay for closing dropdown when clicking outside
  const overlay = document.createElement("div");
  overlay.className = "filter-select-overlay";

  // Create helper text
  const helperText = document.createElement("div");
  helperText.className = "filter-select-help";
  helperText.textContent = "Hold Ctrl/Cmd key to select multiple items";

  // Replace the original multi-select with our custom UI
  const parent = multiSelect.parentElement;

  // Wrap the original select with our container
  parent.insertBefore(container, multiSelect);
  container.appendChild(dropdownToggle);
  container.appendChild(multiSelect);
  container.appendChild(overlay);
  container.appendChild(helperText);

  // Find and move the multi-select-info inside the dropdown
  const infoElement = filterItem.querySelector(".multi-select-info");
  if (infoElement) {
    dropdownToggle.appendChild(infoElement);
  }

  // Move the clear button inside the dropdown toggle
  const clearButton = filterItem.querySelector(".clear-filter-button");
  if (clearButton) {
    dropdownToggle.appendChild(clearButton);
  }

  // Update the dropdown text based on current selection
  updateDropdownText(multiSelect, dropdownText);
}

function initializeEventHandlers(multiSelect) {
  const container = multiSelect.closest(".filter-select-container");
  const dropdownToggle = container.querySelector(".filter-select-dropdown");
  const dropdownText = container.querySelector(".filter-select-dropdown-text");
  const overlay = container.querySelector(".filter-select-overlay");

  // Toggle dropdown open/close
  dropdownToggle.addEventListener("click", function (e) {
    if (
      e.target.classList.contains("clear-filter-button") ||
      e.target.closest(".clear-filter-button")
    ) {
      return; // Don't toggle if clear button was clicked
    }

    // Toggle dropdown visibility
    container.classList.toggle("open");

    // Focus the select element when opened
    if (container.classList.contains("open")) {
      multiSelect.focus();
    }
  });

  // Close dropdown when clicking outside
  overlay.addEventListener("click", function () {
    container.classList.remove("open");
  });

  // Update dropdown text on selection change
  multiSelect.addEventListener("change", function () {
    updateDropdownText(multiSelect, dropdownText);
  });

  // Handle keyboard navigation
  multiSelect.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      container.classList.remove("open");
      dropdownToggle.focus();
    }
  });
}

function updateDropdownText(multiSelect, dropdownText) {
  const selectedOptions = Array.from(multiSelect.selectedOptions);

  if (selectedOptions.length === 0) {
    // No selection
    dropdownText.textContent = "Select options...";
    return;
  }

  if (selectedOptions.length === 1) {
    // Single selection
    dropdownText.textContent = selectedOptions[0].textContent;
    return;
  }

  // Multiple selections
  dropdownText.textContent = `${selectedOptions.length} items selected`;
}
