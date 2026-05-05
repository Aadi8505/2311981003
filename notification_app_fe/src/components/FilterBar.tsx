/**
 * Filter Bar Component
 * Allows filtering by notification type
 */

import React from "react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { NotificationType } from "../types";

interface FilterBarProps {
  selectedType: "All" | NotificationType;
  onTypeChange: (type: "All" | NotificationType) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedType,
  onTypeChange,
  limit,
  onLimitChange,
  isLoading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const notificationTypes: ("All" | NotificationType)[] = [
    "All",
    "Placement",
    "Result",
    "Event",
  ];

  const getButtonColor = (type: string) => {
    switch (type) {
      case "Placement":
        return "#4caf50"; // Green
      case "Result":
        return "#2196f3"; // Blue
      case "Event":
        return "#ff9800"; // Orange
      case "All":
        return "#757575"; // Gray
      default:
        return "#757575";
    }
  };

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        color: "white",
        py: 3,
        mb: 4,
        borderRadius: 2,
        boxShadow: theme.shadows[4],
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "center",
            gap: 3,
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          {/* Filter Buttons */}
          <ToggleButtonGroup
            value={selectedType}
            exclusive
            onChange={(e, value) => {
              if (value !== null) {
                onTypeChange(value);
              }
            }}
            disabled={isLoading}
            sx={{
              "& .MuiToggleButton-root": {
                color: "white",
                borderColor: "rgba(255, 255, 255, 0.5)",
                "&.Mui-selected": {
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  borderColor: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.35)",
                  },
                },
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                },
              },
            }}
          >
            {notificationTypes.map((type) => (
              <ToggleButton key={type} value={type} aria-label={type}>
                {type === "All"
                  ? "📋 All"
                  : type === "Placement"
                    ? "🏆 Placement"
                    : type === "Result"
                      ? "📊 Result"
                      : "📅 Event"}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* Limit Input */}
          <TextField
            type="number"
            label="Limit"
            value={limit}
            onChange={(e) =>
              onLimitChange(Math.min(parseInt(e.target.value) || 1, 100))
            }
            disabled={isLoading}
            inputProps={{ min: 1, max: 100 }}
            sx={{
              width: isMobile ? "100%" : 120,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&:hover fieldset": {
                  borderColor: "white",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "white",
                },
              },
              "& .MuiOutlinedInput-input::placeholder": {
                color: "rgba(255, 255, 255, 0.7)",
                opacity: 1,
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default FilterBar;
