/**
 * Notification Card Component
 * Displays individual notification
 */

import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  School as SchoolIcon,
  EmojiEvents as EventsIcon,
} from "@mui/icons-material";
import { PriorityNotification } from "../types";

interface NotificationCardProps {
  notification: PriorityNotification;
  onMarkRead?: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkRead,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Get icon based on notification type
  const getTypeIcon = () => {
    switch (notification.Type) {
      case "Placement":
        return <EventsIcon />;
      case "Result":
        return <CheckCircleIcon />;
      case "Event":
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  // Get color based on notification type
  const getTypeColor = () => {
    switch (notification.Type) {
      case "Placement":
        return "success";
      case "Result":
        return "primary";
      case "Event":
        return "info";
      default:
        return "default";
    }
  };

  // Get priority badge color
  const getPriorityColor = () => {
    const score = notification.priorityScore || 0;
    if (score >= 50) return "error"; // High priority (red)
    if (score >= 30) return "warning"; // Medium priority (orange)
    return "success"; // Low priority (green)
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: `4px solid ${theme.palette[getTypeColor() as keyof typeof theme.palette].main}`,
        "&:hover": {
          boxShadow: 4,
          transform: "translateY(-2px)",
          transition: "all 0.2s ease-in-out",
        },
        transition: "all 0.2s ease-in-out",
      }}
    >
      <CardContent>
        {/* Header with Type and Priority */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {getTypeIcon()}
            <Chip
              label={notification.Type}
              size="small"
              color={getTypeColor() as any}
              variant="outlined"
            />
          </Box>
          <Chip
            label={`Score: ${notification.priorityScore || 0}`}
            size="small"
            color={getPriorityColor() as any}
            variant="filled"
          />
        </Box>

        {/* Message */}
        <Typography
          variant={isMobile ? "body2" : "body1"}
          sx={{
            mb: 1,
            fontWeight: notification.IsRead ? 400 : 600,
            opacity: notification.IsRead ? 0.7 : 1,
          }}
        >
          {notification.Message}
        </Typography>

        {/* Metadata */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            📅 {formatDate(notification.Timestamp)}
          </Typography>
          {notification.typeWeight && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              ⚖️ Weight: {notification.typeWeight} | Recency:{" "}
              {notification.recencyScore}
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      {onMarkRead && !notification.IsRead && (
        <CardActions>
          <Button
            size="small"
            color="primary"
            onClick={() => onMarkRead(notification.ID)}
            sx={{ textTransform: "none" }}
          >
            ✓ Mark as Read
          </Button>
        </CardActions>
      )}

      {notification.IsRead && (
        <CardActions>
          <Typography variant="caption" sx={{ color: "success.main", ml: 1 }}>
            ✓ Read
          </Typography>
        </CardActions>
      )}
    </Card>
  );
};

export default NotificationCard;
