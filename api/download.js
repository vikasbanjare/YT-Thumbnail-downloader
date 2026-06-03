import { createThumbnailZip } from "../lib/youtube.js";

export default async function handler(request, response) {
  try {
    if (request.method !== "POST") {
      response.status(405).json({ error: "Use POST to download thumbnails." });
      return;
    }

    const input = request.body?.url || "";
    const { zip } = await createThumbnailZip(input);
    response.setHeader("Content-Type", "application/zip");
    response.setHeader("Content-Disposition", 'attachment; filename="youtube-thumbnails.zip"');
    response.setHeader("Content-Length", zip.length);
    response.status(200).send(zip);
  } catch (error) {
    response.status(400).json({ error: error.message });
  }
}
