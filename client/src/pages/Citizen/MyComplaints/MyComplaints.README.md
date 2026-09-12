
# MyComplaints Component - Technical Documentation

## Overview

The **MyComplaints** component is a React-based page that displays all civic issue complaints reported by an authenticated user. It provides a comprehensive interface with filtering capabilities, responsive card-based layout, and real-time state management.

---

## Component Location

```
client/src/pages/Citizen/MyComplaints.jsx
```

**Route:** `/citizen/my-complaints`

---

## Architecture

### 1. Data Flow

```
User Clicks "My Complaints" Sidebar Link
         ↓
React Router navigates to /citizen/my-complaints
         ↓
MyComplaints component mounts
         ↓
useEffect hook triggers on mount
         ↓
fetchComplaints() function executes
         ↓
Axios sends GET request to backend API
         ↓
Backend validates JWT token via checkToken middleware
         ↓
Database query retrieves all user's complaints
         ↓
Response returned to component
         ↓
State updated: setComplaints() & setFilteredComplaints()
         ↓
Component re-renders with complaint data
         ↓
UI displays complaint cards in grid layout
```

---

## State Management

The component uses React's `useState` hook to manage the following states:

### Primary States

| State Variable | Type | Initial Value | Purpose |
|---------------|------|---------------|---------|
| `complaints` | Array | `[]` | Stores all fetched complaints from API |
| `filteredComplaints` | Array | `[]` | Stores complaints after applying filters |
| `loading` | Boolean | `true` | Tracks data fetching status |
| `statusFilter` | String | `"all"` | Current status filter selection |
| `categoryFilter` | String | `"all"` | Current category filter selection |
| `severityFilter` | String | `"all"` | Current severity filter selection |

---

## API Integration

### Endpoint

```
GET http://localhost:5000/api/reports/user
```

### Authentication

- **Method:** JWT Token via HTTP-only cookies
- **Middleware:** `checkToken` validates token before query execution
- **Credentials:** `withCredentials: true` sent with every request

### Request Configuration

```javascript
const response = await axios.get(
  "http://localhost:5000/api/reports/user",
  {
    withCredentials: true,
  }
);
```

### Response Structure

```json
{
  "success": true,
  "reports": [
    {
      "report_id": "uuid",
      "title": "Pothole on Main Street",
      "description": "Large pothole causing damage",
      "category": "Pothole",
      "location_short_label": "Main St",
      "location_full_label": "123 Main Street, City, State",
      "latitude": 27.7172,
      "longitude": 85.3240,
      "image_url": "/uploads/reports/user-id_timestamp.jpg",
      "status": "pending",
      "severity_level": "High",
      "severity_score": 75,
      "created_at": "2026-09-10T10:30:00.000Z",
      "updated_at": "2026-09-10T10:30:00.000Z"
    }
  ]
}
```

---

## Backend Implementation

### Controller: `getUserComplaints()`

**Location:** `server/controllers/reportControllers.js`

```javascript
export const getUserComplaints = async (req, res) => {
  try {
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated. Please log in.",
      });
    }

    const reportsQuery = `
      SELECT
        report_id, title, description, category,
        location_short_label, location_full_label,
        latitude, longitude, image_url,
        status, severity_level, severity_score,
        created_at, updated_at
      FROM reports
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const reportsResult = await pool.query(reportsQuery, [user_id]);
    const reports = reportsResult.rows;

    return res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("❌ Error in getUserComplaints:", error);
    return res.status(500).json({
      success: false,
      error: "An error occurred while fetching complaints.",
      details: error.message,
    });
  }
};
```

### Route Configuration

**Location:** `server/routes/reportRoutes.js`

```javascript
router.get("/user", checkToken, getUserComplaints);
```

**Full Route:** `GET /api/reports/user`

---

## Filtering System

### Filter Logic

The component uses a second `useEffect` hook that watches for changes in filter states:

```javascript
useEffect(() => {
  let filtered = complaints;

  // Apply Status Filter
  if (statusFilter !== "all") {
    filtered = filtered.filter((c) => c.status === statusFilter);
  }

  // Apply Category Filter
  if (categoryFilter !== "all") {
    filtered = filtered.filter((c) => c.category === categoryFilter);
  }

  // Apply Severity Filter
  if (severityFilter !== "all") {
    filtered = filtered.filter(
      (c) => c.severity_level?.toLowerCase() === severityFilter
    );
  }

  setFilteredComplaints(filtered);
}, [statusFilter, categoryFilter, severityFilter, complaints]);
```

### Filter Behavior

- **Client-Side Filtering:** All filtering happens in the browser after initial data fetch
- **No Additional API Calls:** Changing filters doesn't trigger new requests
- **Instant Updates:** Filter changes immediately update the displayed complaints
- **Combinable Filters:** All three filters can be applied simultaneously
- **Case-Insensitive:** Severity matching converts to lowercase for comparison

### Available Filter Options

#### Status Filter
- All Status (default)
- Pending
- Verified
- In Progress
- Resolved

#### Category Filter
- All Categories (default)
- Pothole
- Garbage / Waste
- Water Supply
- Drainage
- Road Damage

#### Severity Filter
- All Severity (default)
- Critical
- High
- Medium
- Low

---

## UI Components

### Layout Structure

```
MyComplaints Container
├── Header Section
│   ├── Title: "My Complaints"
│   └── Subtitle: "Track and manage all your reported civic issues."
│
├── Filter Section (3 Dropdowns)
│   ├── Status Filter
│   ├── Category Filter
│   └── Severity Filter
│
└── Complaints Grid
    └── Complaint Cards (2 columns on desktop, 1 on mobile)
        ├── Card Top Section
        │   ├── Image Thumbnail (96x96px)
        │   └── Content Area
        │       ├── Title
        │       ├── Category with Icon
        │       ├── Location with Pin Icon
        │       └── Status & Severity Badges
        │
        └── Card Footer
            ├── Submission Date
            └── "View Details" Button
```

### Card Component Breakdown

Each complaint card contains:

1. **Image Section**
   - Size: 96px × 96px
   - Border radius: 8px (rounded-lg)
   - Object-fit: cover (maintains aspect ratio)
   - Source: `http://localhost:5000${complaint.image_url}`

2. **Content Section**
   - **Title:** Truncated to 1 line with ellipsis
   - **Category:** Displayed with package icon
   - **Location:** Displayed with map pin icon
   - **Badges:**
     - Status badge (color-coded by status)
     - Severity badge (color-coded by level)

3. **Footer Section**
   - Submission date with calendar icon
   - "View Details" button (teal on hover)

---

## Color Scheme

### Status Colors

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Pending | `bg-yellow-50` | `text-yellow-600` | `border-yellow-200` |
| Verified | `bg-blue-50` | `text-blue-600` | `border-blue-200` |
| In Progress | `bg-cyan-50` | `text-cyan-600` | `border-cyan-200` |
| Resolved | `bg-green-50` | `text-green-600` | `border-green-200` |

### Severity Colors

| Severity | Background | Text | Border |
|----------|-----------|------|--------|
| Critical | `bg-red-600` | `text-white` | `border-red-700` |
| High | `bg-red-50` | `text-red-600` | `border-red-200` |
| Medium | `bg-orange-50` | `text-orange-600` | `border-orange-200` |
| Low | `bg-blue-50` | `text-blue-600` | `border-blue-200` |

**Note:** Critical severity uses solid dark red background with white text to emphasize urgency.

---

## Responsive Design

### Breakpoints

| Screen Size | Layout | Grid Columns |
|------------|--------|--------------|
| Desktop (≥ 1024px) | 2-column grid | `lg:grid-cols-2` |
| Mobile (< 1024px) | Single column stack | `grid-cols-1` |

### Mobile Optimization

- Filters remain horizontal and wrap on narrow screens
- Images maintain fixed 96×96px size on all devices
- Text truncates with ellipsis when too long
- Cards stack vertically below 1024px
- Padding adjusts for smaller screens (p-6 on desktop, maintains readability on mobile)

---

## Helper Functions

### `formatDate(dateString)`

Converts ISO timestamp to readable format.

```javascript
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
```

**Example:** `"2026-09-10T10:30:00.000Z"` → `"Sep 10, 2026"`

### `getStatusLabel(status)`

Maps database status values to display labels.

```javascript
const getStatusLabel = (status) => {
  const labels = {
    pending: "Pending",
    verified: "Verified",
    "in-progress": "In Progress",
    resolved: "Resolved",
  };
  return labels[status] || status;
};
```

### `getStatusStyles(status)`

Returns Tailwind CSS classes for status badges.

```javascript
const getStatusStyles = (status) => {
  switch (status) {
    case "in-progress":
      return "bg-cyan-50 text-cyan-600 border-cyan-200";
    case "verified":
      return "bg-blue-50 text-blue-600 border-blue-200";
    case "resolved":
      return "bg-green-50 text-green-600 border-green-200";
    case "pending":
      return "bg-yellow-50 text-yellow-600 border-yellow-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};
```

### `getSeverityStyles(severity)`

Returns Tailwind CSS classes for severity badges.

```javascript
const getSeverityStyles = (severity) => {
  const level = severity?.toLowerCase();
  switch (level) {
    case "critical":
      return "bg-red-600 text-white border-red-700";
    case "high":
      return "bg-red-50 text-red-600 border-red-200";
    case "medium":
      return "bg-orange-50 text-orange-600 border-orange-200";
    case "low":
      return "bg-blue-50 text-blue-600 border-blue-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};
```

### `getStatusIcon(status)`

Returns appropriate React Icon component.

```javascript
const getStatusIcon = (status) => {
  switch (status) {
    case "in-progress":
      return <FiRefreshCw className="h-4 w-4" />;
    case "verified":
      return <FiCheckCircle className="h-4 w-4" />;
    case "resolved":
      return <FiCheckCircle className="h-4 w-4" />;
    case "pending":
      return <FiClock className="h-4 w-4" />;
    default:
      return <FiClock className="h-4 w-4" />;
  }
};
```

---

## Empty States

### Loading State

```jsx
<div className="flex items-center justify-center py-20">
  <div className="text-slate-500">Loading complaints...</div>
</div>
```

Displayed while `loading === true`

### No Results State

```jsx
<div className="flex flex-col items-center justify-center py-20">
  <div className="mb-4 text-slate-400">
    <FiAlertTriangle className="h-12 w-12" />
  </div>
  <p className="text-lg font-medium text-slate-600">
    No complaints found
  </p>
  <p className="text-sm text-slate-500">
    Try adjusting your filters or report a new issue
  </p>
</div>
```

Displayed when `filteredComplaints.length === 0` after loading completes

---

## Performance Considerations

### Optimizations

1. **Single API Call**
   - All complaints fetched once on component mount
   - No pagination implemented yet
   - All filtering happens client-side

2. **React Keys**
   - Each card uses `complaint.report_id` as key
   - Ensures efficient re-rendering when data changes

3. **Memoization Opportunity**
   - Filter logic could be memoized with `useMemo`
   - Currently acceptable for small-to-medium datasets

4. **Image Loading**
   - Images load asynchronously
   - Browser handles caching automatically

### Potential Improvements

- **Pagination:** Implement server-side pagination for large datasets
- **Virtual Scrolling:** For very long lists (100+ complaints)
- **Lazy Loading:** Load images as they enter viewport
- **Debounced Search:** Add text search with debouncing

---

## Security

### Authentication Flow

1. User must be logged in with valid JWT token
2. Token stored in HTTP-only cookie (secure)
3. Every API request includes `withCredentials: true`
4. Backend `checkToken` middleware validates JWT before database access
5. Database query filters by `user_id` extracted from token
6. Users can only see their own complaints

### Data Protection

- JWT tokens are HTTP-only (not accessible via JavaScript)
- Credentials automatically sent with cross-origin requests
- Backend enforces user isolation at database level
- No sensitive data exposed in URLs or client-side storage

---

## Error Handling

### API Error Handling

```javascript
try {
  const response = await axios.get(
    "http://localhost:5000/api/reports/user",
    { withCredentials: true }
  );
  
  if (response.data.success) {
    setComplaints(response.data.reports);
    setFilteredComplaints(response.data.reports);
  }
} catch (error) {
  console.error("Error fetching complaints:", error);
  // Error displayed in console
  // User sees empty state
} finally {
  setLoading(false);
}
```

### Graceful Degradation

- API failure shows empty state (not error message)
- Missing data fields handled with fallbacks (e.g., `|| "Location not specified"`)
- Optional chaining prevents crashes (`complaint.severity_level?.toLowerCase()`)

---

## Dependencies

### External Libraries

```json
{
  "react": "^18.x",
  "react-icons": "^5.x",
  "axios": "^1.x"
}
```

### Icons Used

- `FiClock` - Pending status
- `FiRefreshCw` - In Progress status
- `FiCheckCircle` - Verified/Resolved status
- `FiAlertTriangle` - Severity indicator, empty state
- `FiMapPin` - Location indicator
- `FiCalendar` - Submission date
- `FiPackage` - Category indicator

---

## Integration with Routing

### Route Configuration

**File:** `client/src/App.jsx`

```javascript
import MyComplaints from "./pages/Citizen/MyComplaints";

const router = createBrowserRouter([
  {
    path: "/citizen",
    element: <CitizenLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "report",
        element: <ReportIssue />,
      },
      {
        path: "my-complaints",
        element: <MyComplaints />,
      },
    ],
  },
]);
```

### Sidebar Navigation

**File:** `client/src/pages/Citizen/CitizenLayout.jsx`

```javascript
const navItems = [
  { path: "/citizen/dashboard", icon: FiHome, label: "Dashboard" },
  { path: "/citizen/report", icon: FiPlusCircle, label: "Report Issue" },
  { path: "/citizen/my-complaints", icon: FiFileText, label: "My Complaints" },
  { path: "/citizen/nearby", icon: FiMapPin, label: "Nearby Complaints" },
  { path: "/citizen/notifications", icon: FiBell, label: "Notifications" },
];
```

---

## Database Schema

### Reports Table Structure

```sql
CREATE TABLE reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    location_short_label VARCHAR(200),
    location_full_label TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    image_url TEXT NOT NULL,
    severity_score INTEGER,
    severity_level VARCHAR(20) CHECK (severity_level IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'verified', 'in-progress', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Relevant Constraints

- **Status Values:** `pending`, `verified`, `in-progress`, `resolved`
- **Severity Levels:** `Low`, `Medium`, `High`, `Critical`
- **User Isolation:** Foreign key to `users` table ensures data separation

---

## Future Enhancements

### Planned Features

1. **Search Functionality**
   - Text search across titles and descriptions
   - Search by location

2. **Advanced Sorting**
   - Sort by date (newest/oldest)
   - Sort by severity level
   - Sort by status

3. **Pagination**
   - Server-side pagination for performance
   - "Load More" button or infinite scroll

4. **Detail View**
   - Modal or separate page for full complaint details
   - Display full description, larger images
   - Show update history

5. **Edit Capability**
   - Allow users to edit pending complaints
   - Update title, description, or category

6. **Bulk Actions**
   - Select multiple complaints
   - Delete or export selected items

7. **Export**
   - Export complaints as PDF or CSV
   - Generate report summaries

8. **Real-Time Updates**
   - WebSocket connection for live status changes
   - Notifications when status updates

9. **Map View**
   - Display complaints on interactive map
   - Filter by geographic area

10. **Statistics**
    - Personal complaint statistics
    - Resolution time tracking
    - Severity distribution charts

---

## Troubleshooting

### Common Issues

#### 1. Empty Complaint List

**Symptoms:** Page loads but shows "No complaints found"

**Possible Causes:**
- User hasn't submitted any complaints yet
- API authentication failure
- Backend database connection issue

**Debug Steps:**
```javascript
// Check console for errors
console.log("API Response:", response.data);
console.log("Complaints State:", complaints);
```

#### 2. Filters Not Working

**Symptoms:** Selecting filters doesn't update displayed complaints

**Possible Causes:**
- Filter state not updating
- useEffect dependencies missing
- Case sensitivity mismatch

**Debug Steps:**
```javascript
// Log filter states
console.log("Status Filter:", statusFilter);
console.log("Filtered Complaints:", filteredComplaints);
```

#### 3. Images Not Loading

**Symptoms:** Broken image icons instead of complaint photos

**Possible Causes:**
- Incorrect image URL construction
- Backend static file serving not configured
- Image file doesn't exist on server

**Debug Steps:**
```javascript
// Check constructed image URL
console.log("Image URL:", `http://localhost:5000${complaint.image_url}`);
```

#### 4. Authentication Errors

**Symptoms:** 401 Unauthorized responses

**Possible Causes:**
- JWT token expired
- User not logged in
- Cookie not being sent

**Debug Steps:**
- Check browser DevTools → Application → Cookies
- Verify `withCredentials: true` in axios config
- Check token expiration time

---

## Testing

### Manual Testing Checklist

- [ ] Component loads without errors
- [ ] API call succeeds and data displays
- [ ] All three filters work independently
- [ ] Combining multiple filters works correctly
- [ ] Empty state shows when no matches
- [ ] Loading state appears during fetch
- [ ] Images load correctly
- [ ] Status badges display with correct colors
- [ ] Severity badges display with correct colors
- [ ] "View Details" buttons are clickable
- [ ] Layout is responsive on mobile
- [ ] Component works with 0 complaints
- [ ] Component works with 100+ complaints
- [ ] Logout/re-login maintains functionality

---

## Conclusion

The MyComplaints component provides a robust, user-friendly interface for viewing and filtering civic issue complaints. Its client-side filtering approach ensures fast, responsive interactions while maintaining security through JWT authentication. The component follows React best practices and is ready for future enhancements like pagination, search, and real-time updates.

For questions or contributions, refer to the main project documentation.
