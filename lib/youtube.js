const thumbnailCandidates = [
  "maxresdefault.jpg",
  "sddefault.jpg",
  "hqdefault.jpg",
  "mqdefault.jpg",
];

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}

export function sanitizeFilename(value) {
  return (value || "thumbnail")
    .replace(/[\\/:*?"<>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() / 2);
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time: time & 0xffff, date: day & 0xffff };
}

function writeUInt32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function writeUInt16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value & 0xffff);
  return buffer;
}

export function makeZip(files) {
  const locals = [];
  const centrals = [];
  let offset = 0;
  const stamp = dosDateTime();

  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const data = file.data;
    const crc = crc32(data);

    const local = Buffer.concat([
      writeUInt32(0x04034b50),
      writeUInt16(20),
      writeUInt16(0x0800),
      writeUInt16(0),
      writeUInt16(stamp.time),
      writeUInt16(stamp.date),
      writeUInt32(crc),
      writeUInt32(data.length),
      writeUInt32(data.length),
      writeUInt16(name.length),
      writeUInt16(0),
      name,
      data,
    ]);

    const central = Buffer.concat([
      writeUInt32(0x02014b50),
      writeUInt16(20),
      writeUInt16(20),
      writeUInt16(0x0800),
      writeUInt16(0),
      writeUInt16(stamp.time),
      writeUInt16(stamp.date),
      writeUInt32(crc),
      writeUInt32(data.length),
      writeUInt32(data.length),
      writeUInt16(name.length),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt32(0),
      writeUInt32(offset),
      name,
    ]);

    locals.push(local);
    centrals.push(central);
    offset += local.length;
  }

  const centralDirectory = Buffer.concat(centrals);
  const end = Buffer.concat([
    writeUInt32(0x06054b50),
    writeUInt16(0),
    writeUInt16(0),
    writeUInt16(files.length),
    writeUInt16(files.length),
    writeUInt32(centralDirectory.length),
    writeUInt32(offset),
    writeUInt16(0),
  ]);

  return Buffer.concat([...locals, centralDirectory, end]);
}

function getPlaylistId(input) {
  try {
    const url = new URL(input);
    return url.searchParams.get("list");
  } catch {
    const match = input.match(/(?:list=)?([A-Za-z0-9_-]{20,})/);
    return match?.[1] || null;
  }
}

function getVideoIds(input) {
  const ids = new Set();
  const videoIdPattern = /(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/g;
  for (const match of input.matchAll(videoIdPattern)) ids.add(match[1]);
  if (/^[A-Za-z0-9_-]{11}$/.test(input.trim())) ids.add(input.trim());
  return [...ids];
}

function getYouTubePageUrl(input) {
  try {
    const url = new URL(input);
    const host = url.hostname.replace(/^www\./, "");
    if (!["youtube.com", "m.youtube.com", "youtu.be"].includes(host)) return null;
    url.searchParams.set("hl", "en");
    return url.toString();
  } catch {
    return null;
  }
}

function decodeJsonText(text) {
  try {
    return JSON.parse(`"${text}"`);
  } catch {
    return text.replace(/\\"/g, '"').replace(/\\u0026/g, "&");
  }
}

function extractVideos(html) {
  const ids = new Map();
  const watchPattern = /"url":"\\\/watch\\\?v=([A-Za-z0-9_-]{11})[^"]*?".*?"title":\{"runs":\[\{"text":"([^"]+)"/g;
  for (const match of html.matchAll(watchPattern)) {
    ids.set(match[1], decodeJsonText(match[2]));
  }

  const compactPattern = /"videoId":"([A-Za-z0-9_-]{11})"/g;
  for (const match of html.matchAll(compactPattern)) {
    if (!ids.has(match[1])) ids.set(match[1], `YouTube video ${match[1]}`);
  }

  return [...ids.entries()].map(([id, title], index) => ({
    id,
    title,
    position: index + 1,
  }));
}

async function fetchVideosFromYouTubePage(pageUrl, sourceLabel) {
  const response = await fetch(pageUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/125 Safari/537.36",
      Accept: "text/html",
    },
  });
  if (!response.ok) throw new Error(`YouTube returned ${response.status} for that ${sourceLabel}.`);

  const html = await response.text();
  const videos = extractVideos(html);
  if (!videos.length) throw new Error(`No videos were found. Check that the ${sourceLabel} is public.`);
  return videos;
}

export async function fetchSourceVideos(input) {
  const playlistId = getPlaylistId(input);
  const directVideoIds = getVideoIds(input);
  if (!playlistId && directVideoIds.length) {
    return directVideoIds.map((id, index) => ({ id, title: `YouTube video ${id}`, position: index + 1 }));
  }

  if (playlistId) {
    const playlistUrl = `https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}&hl=en`;
    return fetchVideosFromYouTubePage(playlistUrl, "playlist");
  }

  const pageUrl = getYouTubePageUrl(input);
  if (pageUrl) return fetchVideosFromYouTubePage(pageUrl, "page");

  throw new Error("Paste a YouTube playlist URL, channel videos URL, video URL, playlist ID, or video ID.");
}

export async function fetchBestThumbnail(videoId) {
  for (const name of thumbnailCandidates) {
    const url = `https://i.ytimg.com/vi/${videoId}/${name}`;
    const response = await fetch(url);
    if (!response.ok) continue;
    const data = Buffer.from(await response.arrayBuffer());
    if (data.length < 2000) continue;
    return { data, quality: name.replace(".jpg", ""), url };
  }
  throw new Error(`No thumbnail found for ${videoId}.`);
}

export async function createThumbnailZip(input) {
  const videos = await fetchSourceVideos(input || "");
  const files = [];
  const failures = [];

  for (const video of videos) {
    try {
      const thumbnail = await fetchBestThumbnail(video.id);
      const prefix = String(video.position).padStart(3, "0");
      files.push({
        name: `${prefix} - ${sanitizeFilename(video.title)} - ${video.id} - ${thumbnail.quality}.jpg`,
        data: thumbnail.data,
      });
    } catch (error) {
      failures.push(`${video.id}: ${error.message}`);
    }
  }

  if (!files.length) throw new Error("Could not download any thumbnails from that YouTube source.");
  if (failures.length) {
    files.push({
      name: "_download-notes.txt",
      data: Buffer.from(`Some thumbnails could not be downloaded:\n${failures.join("\n")}\n`, "utf8"),
    });
  }

  return { zip: makeZip(files), count: videos.length };
}
