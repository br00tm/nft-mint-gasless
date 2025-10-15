import axios from "axios";
import { API_BASE_URL } from "../utils/constants.js";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000
});

export async function submitMintRequest(payload) {
  const { data } = await apiClient.post("/mint", payload);
  return data;
}

export async function getBackendStatus() {
  try {
    const { data } = await apiClient.get("/health");
    return data;
  } catch (error) {
    return { status: "offline" };
  }
}

export default apiClient;
