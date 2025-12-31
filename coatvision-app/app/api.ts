import { API_BASE_URL, endpoints } from "./config";

export async function lyxbotCommand(command: string, context: Record<string, any> = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoints.lyxbotCommand}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command, context }),
  });
  if (!res.ok) throw new Error(`LYXbot error ${res.status}`);
  return res.json();
}

export async function analyzeCoating(imageBase64: string) {
  const res = await fetch(`${API_BASE_URL}${endpoints.analyzeCoating}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_base64: imageBase64 }),
  });
  if (!res.ok) throw new Error(`Analyze coating failed ${res.status}`);
  return res.json();
}

export async function analyzeDefects(imageBase64: string) {
  const res = await fetch(`${API_BASE_URL}${endpoints.analyzeDefects}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_base64: imageBase64 }),
  });
  if (!res.ok) throw new Error(`Analyze defects failed ${res.status}`);
  return res.json();
}

export async function analyzeWash(imageBase64: string) {
  const res = await fetch(`${API_BASE_URL}${endpoints.analyzeWash}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_base64: imageBase64 }),
  });
  if (!res.ok) throw new Error(`Analyze wash failed ${res.status}`);
  return res.json();
}
