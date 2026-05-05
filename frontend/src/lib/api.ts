import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 60000,
});

export interface Source {
  title: string;
  source: string;
  url: string;
  published: string;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  on_topic: boolean;
}

export async function sendMessage(
  message: string,
  history: { user: string; bot: string }[]
): Promise<ChatResponse> {
  const res = await API.post<ChatResponse>("/chat", { message, history });
  return res.data;
}

export async function getNewsStatus() {
  const res = await API.get("/news/status");
  return res.data;
}

export async function refreshNews() {
  const res = await API.post("/news/refresh");
  return res.data;
}
