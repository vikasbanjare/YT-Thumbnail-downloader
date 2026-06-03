# YouTube Thumbnail Downloader

A small local web tool for downloading YouTube video, playlist, or channel-page thumbnails as a ZIP.

## Run

```bash
npm run dev
```

Open `http://127.0.0.1:4173`.

## Share Online

To get a public link, deploy this folder to Vercel:

1. Push this project to GitHub.
2. Go to Vercel and import the GitHub repo.
3. Keep the default settings.
4. Click deploy.

Vercel will give you a shareable URL like `https://your-project.vercel.app`.

## Use

Paste one of these:

- A YouTube playlist URL
- A YouTube channel videos URL, like `https://www.youtube.com/@breakdownbyaeos/videos`
- A playlist ID
- One or more YouTube video URLs
- A single video ID

Click **Find thumbnails**, then **Download ZIP**. The server tries `maxresdefault.jpg` first, then falls back through lower YouTube thumbnail sizes when a video does not have a max-res image.

## Notes

This does not require a YouTube API key. It reads public YouTube pages, so private playlists or private channel content cannot be downloaded.
