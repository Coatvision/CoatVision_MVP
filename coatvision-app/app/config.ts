// API configuration only; remove accidental duplicate exports
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export const endpoints = {
  lyxbotStatus: "/api/lyxbot/status",
  lyxbotCommand: "/api/lyxbot/command",
  analyzeCoating: "/api/analyze/coating",
  analyzeDefects: "/api/analyze/defects",
  analyzeWash: "/api/analyze/wash",
};