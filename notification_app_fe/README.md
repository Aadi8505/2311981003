# Campus Notification System - Frontend

Production-grade React + TypeScript frontend with Material UI for the Campus Notification System.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Backend running on http://localhost:5000

### Installation

```bash
cd notification_app_fe

# Install dependencies
npm install

# Create .env file (if not exists)
touch .env

# Copy environment variables
# REACT_APP_API_URL=http://localhost:5000/api
# REACT_APP_ACCESS_TOKEN=your_token
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Open http://localhost:3000 in browser
```

### Production Build

```bash
# Build for production
npm run build

# Output in dist/ folder
# Serve with: npx http-server dist
```

## 📱 Features

✅ **Responsive Design** - Works on mobile, tablet, and desktop  
✅ **Real-time Updates** - Auto-refresh every 30 seconds  
✅ **Priority Sorting** - Displays notifications by importance  
✅ **Type Filtering** - Filter by Placement, Result, Event, or All  
✅ **Dark Mode** - Toggle between light and dark themes  
✅ **Statistics** - View notification analytics  
✅ **Material UI** - Professional, accessible UI components  
✅ **Error Handling** - Graceful error messages

## 📁 Project Structure

```
src/
├── App.tsx                          # Main app component
├── main.tsx                         # Vite entry point
├── index.css                        # Global styles
├── types.ts                         # TypeScript interfaces
├── services/
│   └── notificationService.ts       # API communication
└── components/
    ├── NotificationCard.tsx         # Individual notification
    ├── NotificationList.tsx         # Notification list view
    └── FilterBar.tsx                # Filter controls
```

## 🎨 UI Components

### FilterBar

- Toggle between notification types
- Adjust result limit (1-100)
- Shows loading state during fetch

### NotificationCard

- Displays notification details
- Shows priority score and type
- Relative timestamps (e.g., "2h ago")
- Mark as read functionality

### NotificationList

- Shows statistics (total, unread, by type)
- Displays notifications in priority order
- Empty state message
- Loading and error states

## 🔌 API Integration

### Endpoints Used

```typescript
// Get top priority notifications
GET /api/notifications/priority?limit=10

// Get notifications by type
GET /api/notifications/priority/Placement?limit=10

// Get statistics
GET /api/notifications/stats
```

### Example API Call

```typescript
// From notificationService.ts
const response = await axios.get(`${API_BASE_URL}/notifications/priority`, {
  params: { limit: 10 },
  headers: { "Content-Type": "application/json" },
});
```

## 🌈 Theming

### Light Mode (Default)

- Clean, bright interface
- Easy on the eyes during day
- High contrast for accessibility

### Dark Mode

- Reduced eye strain
- Modern appearance
- Better battery life on OLED

**Toggle Theme:**
Click the brightness icon in the top-right corner

## 📊 Notification Priority

Visual indicators show priority:

```
Priority Score = (Type Weight × 10) + Recency Score

High Priority (Red):
- Placement from 0-6 hours: Score 50+
- Score badge shows exact value

Medium Priority (Orange):
- Result from recent hours: Score 30-50

Low Priority (Green):
- Old or less important notifications: Score <30
```

## 🔄 Auto-Refresh

Frontend automatically refreshes every 30 seconds:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    fetchNotifications();
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, [fetchNotifications]);
```

## 📱 Responsive Breakpoints

```typescript
// Mobile: < 600px (sm)
// Tablet: 600px - 1024px (md)
// Desktop: > 1024px (lg)

// Example usage
const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
```

## 🎯 Performance Optimizations

1. **Memoization** - Components memoized to prevent unnecessary re-renders
2. **Lazy Loading** - Notifications loaded on-demand
3. **Debouncing** - Limit filter/limit change frequency
4. **Efficient State** - Only re-render affected components
5. **Asset Optimization** - Minified CSS/JS in production

## 🔐 Environment Variables

```env
# Backend API
REACT_APP_API_URL=http://localhost:5000/api

# Logging
REACT_APP_LOG_API_URL=http://20.207.122.201/evaluation-service/logs
REACT_APP_ACCESS_TOKEN=your_token_here
```

## 🚨 Error Handling

The frontend handles various error scenarios:

1. **Backend Unavailable**
   - Shows error message
   - Suggests checking if backend is running
   - Allows retry

2. **Invalid Response**
   - Displays API error message
   - Logs full error to console

3. **Network Timeout**
   - Shows timeout error
   - Allows manual refresh

## 📊 Statistics Panel

Shows real-time stats:

- **Total**: Total number of notifications
- **Unread**: Count of unread notifications
- **Placements**: Placement notification count
- **Results**: Result notification count
- **Avg Score**: Average priority score

## 🎨 Material UI Customization

### Theme Colors

```typescript
const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" }, // Blue
    secondary: { main: "#dc004e" }, // Pink
    success: { main: "#4caf50" }, // Green
    warning: { main: "#ff9800" }, // Orange
    info: { main: "#2196f3" }, // Light Blue
    error: { main: "#f44336" }, // Red
  },
});
```

### Component Styling

- AppBar with gradient
- Card with hover effects
- Responsive grid layout
- Smooth transitions

## 📝 Code Examples

### Fetch and Display Notifications

```typescript
const [notifications, setNotifications] = useState<PriorityNotification[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await notificationApi.getPriorityNotifications(10);
      setNotifications(data);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

### Filter by Type

```typescript
const handleTypeChange = (type: "All" | NotificationType) => {
  setSelectedType(type);
};

useEffect(() => {
  filterNotifications();
}, [selectedType]);
```

## 🧪 Testing

### Manual Testing

1. Start backend: `npm run dev` (in notification_app_be)
2. Start frontend: `npm run dev` (in notification_app_fe)
3. Open http://localhost:3000
4. Test filtering and refreshing

### Test Cases

- [ ] Load notifications on page start
- [ ] Filter by notification type
- [ ] Change result limit
- [ ] Toggle theme
- [ ] Refresh manually
- [ ] Auto-refresh every 30 seconds
- [ ] Handle API errors gracefully
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop

## 📸 Screenshots

### Desktop View

- Full-width layout
- Side-by-side panels
- Detailed information

### Mobile View

- Single column
- Touch-friendly buttons
- Condensed information

### Dark Mode

- Dark background
- Light text
- Reduced contrast

## 🚀 Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
npm run build

# Deploy dist/ folder to Netlify
```

### Docker

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm i -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## 🐛 Troubleshooting

### "Cannot reach backend"

- Verify backend is running on port 5000
- Check REACT_APP_API_URL in .env
- Check browser console for CORS errors

### "Notifications not loading"

- Open browser DevTools
- Check Network tab for failed requests
- Check backend logs for errors

### "Theme not persisting"

- Clear browser localStorage
- Refresh page
- Check browser privacy settings

### Slow performance

- Check DevTools Performance tab
- Look for memory leaks
- Monitor API response times

## 📚 Additional Resources

- [Architecture Design](../notification_system_design.md)
- [Backend Documentation](../notification_app_be/README.md)
- [Logging Middleware](../logging_middleware/README.md)
- [Material UI Docs](https://mui.com/material-ui/getting-started/)
- [React Docs](https://react.dev/)

---

**Version:** 1.0.0  
**Last Updated:** May 5, 2026  
**Status:** Production Ready
