import React from "react";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import NotificationCard from "./NotificationCard";
import { PriorityNotification } from "../types";

interface NotificationListProps {
  notifications: PriorityNotification[];
  loading: boolean;
  error: string | null;
  onMarkRead?: (id: string) => void;
  title?: string;
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  error,
  onMarkRead,
  title = "Notifications",
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.IsRead).length,
    byType: {
      Placement: notifications.filter((n) => n.Type === "Placement").length,
      Result: notifications.filter((n) => n.Type === "Result").length,
      Event: notifications.filter((n) => n.Type === "Event").length,
    },
    avgScore:
      notifications.length > 0
        ? (
            notifications.reduce((sum, n) => sum + (n.priorityScore || 0), 0) /
            notifications.length
          ).toFixed(1)
        : 0,
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          sx={{
            fontWeight: "bold",
            mb: 2,
            background: "linear-gradient(45deg, #1976d2 30%, #1565c0 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {title}
        </Typography>

        <Card
          sx={{
            mb: 3,
            backgroundColor:
              theme.palette.mode === "dark" ? "#1e1e1e" : "#f5f5f5",
          }}
        >
          <CardContent>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Total
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "primary.main" }}
                >
                  {stats.total}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Unread
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "warning.main" }}
                >
                  {stats.unread}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Placements
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "success.main" }}
                >
                  {stats.byType.Placement}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Results
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "info.main" }}
                >
                  {stats.byType.Result}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Avg Score
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "secondary.main" }}
                >
                  {stats.avgScore}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Error:</strong> {error}
          </Typography>
        </Alert>
      )}

      {!loading && !error && notifications.length === 0 && (
        <Card sx={{ textAlign: "center", py: 8 }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
              📭 No Notifications
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              You're all caught up! Check back later for new notifications.
            </Typography>
          </CardContent>
        </Card>
      )}

      {!loading && !error && notifications.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.ID}
              notification={notification}
              onMarkRead={onMarkRead}
            />
          ))}
        </Box>
      )}

      {/* Footer */}
      {!loading && !error && notifications.length > 0 && (
        <Box
          sx={{
            textAlign: "center",
            mt: 4,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            📊 Showing {notifications.length} notification
            {notifications.length !== 1 ? "s" : ""}
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default NotificationList;
