import React, { useState, useRef, useEffect } from "react";

const MultiSelectDropdown = ({
  name,
  options,
  value,
  onChange,
  placeholder = "Select options...",
  label,
  onClear,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const selectRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle selection of options
  const handleSelectChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(
      (option) => option.value
    );
    onChange({
      target: {
        name: name,
        value: selectedOptions,
      },
    });
  };

  // Toggle dropdown
  const toggleDropdown = (e) => {
    e.preventDefault();
    setIsOpen(!isOpen);

    // Focus the select when opening
    if (!isOpen && selectRef.current) {
      setTimeout(() => selectRef.current.focus(), 10);
    }
  };

  // Format display text based on selected values
  const getDisplayText = () => {
    if (!value || value.length === 0) {
      return placeholder;
    }

    if (value.length === 1) {
      const option = options.find((opt) => opt.value === value[0]);
      return option ? option.label : placeholder;
    }

    return `${value.length} items selected`;
  };

  // Clear selection handler
  const handleClear = (e) => {
    e.stopPropagation();
    if (onClear) {
      onClear(name);
    }
  };

  return (
    <div className="filter-item">
      <label htmlFor={name}>{label}</label>
      <div
        ref={containerRef}
        className={`filter-select-container ${isOpen ? "open" : ""}`}
      >
        <div className="filter-select-dropdown" onClick={toggleDropdown}>
          <span className="filter-select-dropdown-text">
            {getDisplayText()}
          </span>

          {/* Show clear button only when there are selected items */}
          {value && value.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="clear-filter-button"
              title="Clear selection"
            >
              &times;
            </button>
          )}

          {/* Dropdown indicator */}
          <span className="dropdown-indicator">▼</span>
        </div>

        {/* Actual select element */}
        <select
          ref={selectRef}
          id={name}
          name={name}
          multiple
          value={value}
          onChange={handleSelectChange}
          className="filter-select"
          size={5}
        >
          {options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Helper text */}
        <div className="filter-select-help">
          Hold Ctrl/Cmd key to select multiple items
        </div>
      </div>
    </div>
  );
};

export default MultiSelectDropdown;
