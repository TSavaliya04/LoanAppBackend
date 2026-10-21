"use client";
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Checkbox,
  Avatar,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

export type QuoteListItemCardProps = {
  preApprovalId: string;
  borrowerName: string;
  loanType?: string;
  loanProgram?: string;
  totalScenarios: number;
  ownerName?: string;
  updatedAt?: string;
  updatedBy?: string;
  isSelectMode?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
};

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_PALETTE = [
  "#7444F5", "#2196F3", "#4CAF50", "#FF9800", "#E91E63", "#00BCD4", "#9C27B0", "#F44336",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

function formatRelativeTime(isoDate?: string): string {
  if (!isoDate) return "";
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Updated ${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days > 365) {
    const years = Math.floor(days / 365);
    return `Updated ${years} ${years === 1 ? "year" : "years"} ago`;
  }
  if (days > 30) {
    const months = Math.floor(days / 30);
    return `Updated ${months} ${months === 1 ? "month" : "months"} ago`;
  }
  return `Updated ${days}d ago`;
}

const PROGRAM_CHIP_COLORS: Record<string, { bg: string; dot: string }> = {
  Conventional: { bg: "#EEF9EE", dot: "#4CAF50" },
  FHA: { bg: "#E3F0FF", dot: "#2196F3" },
  VA: { bg: "#FFF3E0", dot: "#FF9800" },
  NonQM: { bg: "#F3E5F5", dot: "#9C27B0" },
};

function getProgramChipStyle(program: string) {
  return PROGRAM_CHIP_COLORS[program.trim()] ?? { bg: "#F5F5F5", dot: "#9E9E9E" };
}

function parseProgramChips(loanProgram?: string): string[] {
  if (!loanProgram) return [];
  return loanProgram.split(",").map((p) => p.trim()).filter(Boolean);
}

export default function QuoteListItemCard({
  borrowerName,
  loanType,
  loanProgram,
  totalScenarios,
  ownerName,
  updatedAt,
  updatedBy,
  isSelectMode = false,
  isSelected = false,
  onClick,
}: QuoteListItemCardProps) {
  const initials = getInitials(borrowerName);
  const avatarBg = getAvatarColor(borrowerName);
  const relativeTime = formatRelativeTime(updatedAt);
  const programChips = parseProgramChips(loanProgram);

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "stretch",
        mb: 1.5,
        borderRadius: "12px",
        overflow: "hidden",
        cursor: "pointer",
        border: isSelected ? "2px solid #7444F5" : "2px solid transparent",
        backgroundColor: isSelected ? "#f3ecff" : "#fff",
        boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
        transition: "all 0.2s ease",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.13)", transform: "translateY(-1px)" },
        "&:active": { transform: "translateY(0)" },
      }}
    >
      <Box sx={{ width: 4, flexShrink: 0, bgcolor: avatarBg, borderRadius: "12px 0 0 12px" }} />

      {/* 4-column row wrapper */}
      <Box sx={{ flex: 1, px: 1.5, py: 1.5, minWidth: 0, display: "flex", alignItems: "center", gap: 1.5 }}>

        {/* Col 1 — Avatar */}
        <Avatar sx={{ bgcolor: avatarBg, width: 42, height: 42, fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
          {initials}
        </Avatar>

        {/* Col 2 — Main info */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Line 1: borrowerName */}
          <Typography fontWeight={700} fontSize={15} lineHeight={1.3} noWrap color="text.primary">
            {borrowerName}
          </Typography>

          {/* Line 2: loanType */}
          {loanType && (
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: "block" }}>
              {loanType}
            </Typography>
          )}

          {/* Line 3: totalScenarios badge */}
          {totalScenarios > 0 && (
            <Box sx={{ mt: 0.5, display: "inline-flex", alignItems: "center", gap: 0.5, bgcolor: "#EDE7FF", borderRadius: "6px", px: 1, py: 0.2 }}>
              <ArticleOutlinedIcon sx={{ fontSize: 13, color: "#7444F5" }} />
              <Typography variant="caption" sx={{ color: "#7444F5", fontWeight: 600, fontSize: 11 }}>
                {totalScenarios} {totalScenarios === 1 ? "Scenario" : "Scenarios"}
              </Typography>
            </Box>
          )}

          {/* Line 4: program chips */}
          {programChips.length > 0 && (
            <Box sx={{ mt: 0.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {programChips.map((program, idx) => {
                const { bg, dot } = getProgramChipStyle(program);
                return (
                  <Box key={idx} sx={{ display: "inline-flex", alignItems: "center", gap: 0.4, bgcolor: bg, borderRadius: "20px", px: 0.9, py: 0.25 }}>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: dot, flexShrink: 0 }} />
                    <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 500, color: "text.primary" }}>
                      {program}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* Line 5: ownerName */}
          {ownerName && (
            <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 0.4 }}>
              <PersonOutlineOutlinedIcon sx={{ fontSize: 13, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
                Owner:{" "}
                <Box component="span" sx={{ fontWeight: 500, color: "text.primary" }}>
                  {ownerName}
                </Box>
              </Typography>
            </Box>
          )}
        </Box>

        {/* Col 3 — Time + updatedBy */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0, gap: 0.2, minWidth: 80 }}>
          {relativeTime && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, whiteSpace: "nowrap" }}>
              {relativeTime}
            </Typography>
          )}
          {updatedBy && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, whiteSpace: "nowrap" }}>
              by{" "}
              <Box component="span" sx={{ fontWeight: 600, color: "#7444F5" }}>
                {updatedBy}
              </Box>
            </Typography>
          )}
        </Box>

        {/* Col 4 — Checkbox or Arrow */}
        <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
          {isSelectMode ? (
            <Checkbox checked={isSelected} readOnly size="small" sx={{ p: 0, color: "#7444F5", "&.Mui-checked": { color: "#7444F5" } }} />
          ) : (
            <ChevronRightIcon sx={{ color: "text.disabled" }} />
          )}
        </Box>

      </Box>
    </Paper>
  );
}