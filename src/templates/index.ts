// Import all template files as raw text
import chartTemplate from './chart.md?raw';
import datePickerTemplate from './date-picker.md?raw';
import tableTemplate from './table.md?raw';

// Export the templates object with keys matching the template names
export const templates = {
  'chart': chartTemplate,
  'date-picker': datePickerTemplate,
  'table': tableTemplate,
};

// You can also export individual templates if needed
export { chartTemplate, datePickerTemplate, tableTemplate };
