# Events Frontend UI

This document provides an overview of the events frontend UI implementation with pagination, year-wise filtering, and single event view functionality.

## Features

### 1. Events List View (`/events`)

- **Grid Layout**: Responsive grid displaying event cards
- **Pagination**: Server-side pagination with configurable items per page
- **Year Filter**: Dropdown filter to view events by specific year
- **Search & Sort**: Events sorted by date (newest first)
- **Loading States**: Smooth loading transitions with spinner
- **Error Handling**: User-friendly error messages with retry options

### 2. Single Event View (`/events/:eventId`)

- **Detailed View**: Complete event information display
- **Image Gallery**: Support for multiple event images
- **Social Sharing**: Native share API with clipboard fallback
- **Download Feature**: Download event details as text file
- **Navigation**: Easy navigation back to events list
- **Responsive Design**: Mobile-friendly layout

### 3. Interactive Components

- **Event Cards**: Hover effects and click navigation
- **Pagination Controls**: Previous/Next with page numbers
- **Year Filter**: Dynamic year selection based on available data
- **Loading UI**: Consistent loading states across components

## Component Structure

```
events/
├── index.jsx           # Main routing component
├── EventsList.jsx      # Events list with pagination
├── EventDetail.jsx     # Single event view
├── EventCard.jsx       # Individual event card component
├── Pagination.jsx      # Pagination controls
├── YearFilter.jsx      # Year filtering dropdown
└── Events.css          # Component-specific styles
```

## API Endpoints

### Backend Endpoints (Updated)

- `GET /api/events` - Get paginated events with optional year filter
- `GET /api/events/:id` - Get single event by ID
- `GET /api/events/years` - Get available years for filtering
- `POST /api/events` - Create new event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)
- `year`: Filter by year (optional)

## Usage Examples

### Creating Sample Events

Use the sample data creation script:

```javascript
// In browser console or testing environment
const sampleEvents = createSampleEvents();
// Then create events via API calls
```

### Navigation Examples

```javascript
// Navigate to events list
navigate("/events");

// Navigate to specific event
navigate("/events/event-id-here");

// Navigate with page parameter
navigate("/events?page=2");

// Navigate with year filter
navigate("/events?year=2024");
```

## Styling

The events UI uses:

- **Tailwind CSS**: For responsive design and utilities
- **Custom CSS**: Additional animations and interactions
- **React Icons**: Consistent iconography
- **Gradient Backgrounds**: Modern visual appeal

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators
- **Skip Links**: Skip to main content functionality
- **Color Contrast**: WCAG compliant color schemes

## Mobile Responsiveness

- **Grid Layout**: Responsive from 1-4 columns based on screen size
- **Touch Interactions**: Optimized for mobile touch
- **Viewport Adaptation**: Scales appropriately on all devices
- **Performance**: Lazy loading and optimized images

## Performance Optimizations

- **Server-side Pagination**: Reduces initial load time
- **Image Optimization**: Fallback for missing images
- **Error Boundaries**: Graceful error handling
- **Code Splitting**: Lazy-loaded components

## Testing Data

Sample events include:

- Various date ranges (2023-2024)
- Different event types
- Multiple image configurations
- Diverse content lengths

## Installation & Setup

1. Ensure all dependencies are installed:

   ```bash
   npm install
   ```

2. The following packages are required:

   - `react-router-dom` - Routing
   - `react-icons` - Icons
   - `react-toastify` - Notifications
   - `axios` - API calls

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Navigate to `/events` to view the events list

## Configuration

### Pagination Settings

```javascript
const eventsPerPage = 12; // Adjust in EventsList.jsx
```

### Date Formatting

```javascript
// Customize date formats in utility functions
const formatDate = (dateString) => {
  // Your custom formatting logic
};
```

## Backend Requirements

Ensure your backend supports:

1. Pagination parameters in event queries
2. Year-based filtering
3. Proper CORS configuration
4. Error handling for invalid requests

## Troubleshooting

### Common Issues

1. **Events not loading**: Check API endpoint configuration
2. **Images not displaying**: Verify image URLs and CORS settings
3. **Pagination not working**: Ensure backend supports pagination
4. **Year filter empty**: Check if events exist in database

### Debug Steps

1. Check browser console for errors
2. Verify API responses in Network tab
3. Test backend endpoints independently
4. Confirm routing configuration

## Future Enhancements

Potential improvements:

- Search functionality
- Event categories/tags
- Calendar view
- Export options
- Event reminders
- Social media integration
- Map integration for event locations
