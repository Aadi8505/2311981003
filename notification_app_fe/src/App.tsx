/**
 * Main App Component
 * Campus Notification System - Frontend
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  CssBaseline,
  ThemeProvider,
  createTheme,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import FilterBar from "./components/FilterBar";
import NotificationList from "./components/NotificationList";
import { notificationApi } from "./services/notificationService";
import { PriorityNotification, NotificationType } from "./types";

type ThemeMode = "light" | "dark";

function App() {
  // State Management
  const [notifications, setNotifications] = useState<PriorityNotification[]>(
    [],
  );
  const [filteredNotifications, setFilteredNotifications] = useState<
    PriorityNotification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"All" | NotificationType>(
    "All",
  );
  const [limit, setLimit] = useState(10);
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Material UI Theme
  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#dc004e",
      },
      success: {
        main: "#4caf50",
      },
      warning: {
        main: "#ff9800",
      },
      info: {
        main: "#2196f3",
      },
      error: {
        main: "#f44336",
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 700,
      },
    },
  });

  /**
   * Fetch notifications from backend
   */
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let data: PriorityNotification[];

      if (selectedType === "All") {
        data = await notificationApi.getPriorityNotifications(limit);
      } else {
        data = await notificationApi.getPriorityNotificationsByType(
          selectedType,
          limit,
        );
      }

      // Ensure all notifications have required fields
      const normalizedData = data.map((n) => ({
        ...n,
        IsRead: n.IsRead || false,
        Priority: n.Priority || n.priorityScore || 0,
        CreatedAt: n.CreatedAt || n.Timestamp,
        UpdatedAt: n.UpdatedAt || n.Timestamp,
      }));

      setNotifications(normalizedData);
      setFilteredNotifications(normalizedData);
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch notifications. Please check if the backend is running on http://localhost:5000";

      setError(errorMessage);
      setNotifications([]);
      setFilteredNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [selectedType, limit]);

  /**
   * Filter notifications by type
   */
  const filterNotifications = useCallback(() => {
    if (selectedType === "All") {
      setFilteredNotifications(notifications);
    } else {
      const filtered = notifications.filter((n) => n.Type === selectedType);
      setFilteredNotifications(filtered);
    }
  }, [notifications, selectedType]);

  /**
   * Handle type change
   */
  const handleTypeChange = (type: "All" | NotificationType) => {
    setSelectedType(type);
  };

  /**
   * Handle limit change
   */
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
  };

  /**
   * Handle mark as read
   */
  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.ID === id ? { ...n, IsRead: true } : n)),
    );

    setFilteredNotifications((prev) =>
      prev.map((n) => (n.ID === id ? { ...n, IsRead: true } : n)),
    );
  };

  /**
   * Toggle theme
   */
  const handleThemeToggle = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  /**
   * Refresh notifications
   */
  const handleRefresh = () => {
    fetchNotifications();
  };

  /**
   * Initial load effect
   */
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  /**
   * Filter effect
   */
  useEffect(() => {
    filterNotifications();
  }, [filterNotifications]);

  /**
   * Auto-refresh every 30 seconds
   */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        {/* Header */}
        <AppBar position="static" elevation={0}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                background: "linear-gradient(45deg, #fff 30%, #e3f2fd 90%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              📬 Campus Notifications
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Refresh">
                <IconButton
                  color="inherit"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Tooltip
                title={`Switch to ${themeMode === "light" ? "dark" : "light"} mode`}
              >
                <IconButton color="inherit" onClick={handleThemeToggle}>
                  {themeMode === "light" ? (
                    <Brightness4Icon />
                  ) : (
                    <Brightness7Icon />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>

          {/* Last Update Info */}
          {lastUpdate && (
            <Box sx={{ px: 2, pb: 1 }}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </Typography>
            </Box>
          )}
        </AppBar>

        {/* Main Content */}
        <Box
          sx={{
            flex: 1,
            py: 2,
            backgroundColor: themeMode === "dark" ? "#121212" : "#f5f5f5",
          }}
        >
          {/* Filter Bar */}
          <FilterBar
            selectedType={selectedType}
            onTypeChange={handleTypeChange}
            limit={limit}
            onLimitChange={handleLimitChange}
            isLoading={loading}
          />

          {/* Notification List */}
          <NotificationList
            notifications={filteredNotifications}
            loading={loading}
            error={error}
            onMarkRead={handleMarkRead}
            title={
              selectedType === "All"
                ? "All Notifications"
                : `${selectedType} Notifications`
            }
          />
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 3,
            textAlign: "center",
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: themeMode === "dark" ? "#1e1e1e" : "#fafafa",
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Campus Notification System v1.0 | Built with React + Material UI |
            Auto-refresh every 30s
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
