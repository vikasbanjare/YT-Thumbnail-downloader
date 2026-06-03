import { fetchSourceVideos } from "../lib/youtube.js";

export default async function handler(request, response) {
  try {
    const input = request.query?.url || "";
    const videos = await fetchSourceVideos(input);
    response.status(200).json({ videos });
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
}
