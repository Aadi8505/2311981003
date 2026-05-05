# Quick Start Guide - Campus Notification System

This guide will get you up and running in 5 minutes.

## Prerequisites

- Node.js 16+ installed
- Two terminal windows

## Step 1: Backend Setup (Terminal 1)

```bash
# Navigate to backend
cd notification_app_be

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Expected output:**

```
🚀 Notification Backend Server started on http://localhost:5000
```

## Step 2: Frontend Setup (Terminal 2)

```bash
# Navigate to frontend
cd notification_app_fe

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Expected output:**

```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:3000/
  ➜  press h to show help
```

## Step 3: Open Application

Open your browser and go to: **http://localhost:3000**

## Usage

### Filter Notifications

- Click buttons at top: "All", "🏆 Placement", "📊 Result", "📅 Event"
- Notifications update in real-time

### Change Number of Results

- Use the "Limit" input field (1-100)
- Adjust to see more or fewer notifications

### Toggle Dark Mode

- Click the brightness icon (☀️/🌙) in top-right corner

### Automatic Refresh

- Frontend automatically fetches new notifications every 30 seconds

### Manual Refresh

- Click the refresh icon (🔄) in top-right corner

## API Endpoints

Test these directly or through Postman:

### Get Top 10 Notifications (All Types)

```bash
curl http://localhost:5000/api/notifications/priority?limit=10
```

### Get Top 5 Placement Notifications

```bash
curl http://localhost:5000/api/notifications/priority/Placement?limit=5
```

### Get Statistics

```bash
curl http://localhost:5000/api/notifications/stats
```

### Health Check

```bash
curl http://localhost:5000/api/notifications/health
```

## Notification Priority Explained

Notifications are ranked by importance:

**High Priority (Red Badge):**

- Placement news from last 6 hours = Score 50+
- Latest job openings and selections

**Medium Priority (Orange Badge):**

- Results from 6-48 hours ago = Score 30-50
- Academic updates

**Low Priority (Green Badge):**

- Older events and announcements = Score <30
- General campus events

## Example Response

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "ID": "uuid-1",
        "Type": "Placement",
        "Message": "TCS is hiring! Apply now for SDE role",
        "Timestamp": "2026-05-05T10:00:00Z",
        "priorityScore": 59,
        "typeWeight": 5,
        "recencyScore": 9
      },
      {
        "ID": "uuid-2",
        "Type": "Result",
        "Message": "Semester 6 results are now available",
        "Timestamp": "2026-05-04T15:30:00Z",
        "priorityScore": 35,
        "typeWeight": 3,
        "recencyScore": 7
      }
    ],
    "count": 2
  }
}
```

## Troubleshooting

### Backend won't start

```bash
# Check if port 5000 is in use
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Try a different port
PORT=5001 npm run dev
```

### Frontend won't start

```bash
# Check if port 3000 is in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Port will be auto-incremented if busy
```

### Can't connect from frontend to backend

- Verify backend is running on http://localhost:5000
- Check frontend .env file has: `REACT_APP_API_URL=http://localhost:5000/api`
- Check browser console for CORS errors

### No notifications showing

- Verify external API is reachable (http://20.207.122.201/evaluation-service/notifications)
- Check backend logs for errors
- Verify ACCESS_TOKEN in .env is valid

## Environment Variables

### Backend (.env)

```
PORT=5000
LOG_API_URL=http://20.207.122.201/evaluation-service/logs
ACCESS_TOKEN=your_token_here
NOTIFICATION_API_URL=http://20.207.122.201/evaluation-service/notifications
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ACCESS_TOKEN=your_token_here
```

## Project Structure

```
2311981003/
├── notification_system_design.md      ← Read this for detailed architecture
├── README.md                          ← Main project documentation
├── logging_middleware/                ← Reusable logging module
├── notification_app_be/               ← Backend (Express + TypeScript)
│   ├── src/
│   ├── package.json
│   ├── .env
│   └── README.md
└── notification_app_fe/               ← Frontend (React + TypeScript)
    ├── src/
    ├── package.json
    ├── .env
    └── README.md
```

## Key Features

✅ **Real-time Notifications** - Auto-refresh every 30 seconds  
✅ **Priority Sorting** - Notifications ranked by importance  
✅ **Type Filtering** - Filter by Placement, Result, or Event  
✅ **Dark Mode** - Toggle between light and dark themes  
✅ **Responsive Design** - Works on mobile, tablet, desktop  
✅ **Statistics** - View notification analytics  
✅ **Production Logging** - Comprehensive structured logging  
✅ **Error Handling** - Graceful error messages

## Next Steps

1. **Read Full Documentation**
   - Open `notification_system_design.md` for complete architecture

2. **Explore the Code**
   - Backend: `notification_app_be/src/`
   - Frontend: `notification_app_fe/src/components/`

3. **Test API Endpoints**
   - Use Postman or curl to test endpoints
   - Review response formats

4. **Customize**
   - Modify theme colors in `App.tsx`
   - Add more filter options
   - Integrate with your database

## Production Deployment

### Backend

```bash
npm run build
NODE_ENV=production npm start
```

### Frontend

```bash
npm run build
# Upload dist/ folder to hosting (Vercel, Netlify, etc.)
```

## Getting Help

- **Backend Issues**: Check `notification_app_be/README.md`
- **Frontend Issues**: Check `notification_app_fe/README.md`
- **Logging Issues**: Check `logging_middleware/README.md`
- **Architecture Questions**: Check `notification_system_design.md`

---

**Enjoy your Campus Notification System!** 🎉

For detailed information, open the [Main README](./README.md)
