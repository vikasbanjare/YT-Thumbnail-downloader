/* ==========================================================================
   VIKAS BANJARE — PORTFOLIO CONTENT
   This is the ONLY file you need to edit. Every section of the site
   reads from here.

   HOW TO USE YOUR BEHANCE IMAGES
   1. Open a project on https://www.behance.net/vikas-banjare
   2. Right-click any image → "Copy image address"
   3. Paste the URL into `cover` / `images` below.
      (Or drop files into this folder and use "my-image.jpg")

   HOW TO EMBED A FULL BEHANCE PROJECT (all its real images + videos, live)
   1. Open the project — the URL looks like:
        https://www.behance.net/gallery/123456789/My-Project
   2. Copy the number (123456789) into `behanceProjectId`.

   VIDEO: paste a YouTube embed URL (https://www.youtube.com/embed/VIDEO_ID)
   or Vimeo (https://player.vimeo.com/video/VIDEO_ID) into `videoEmbed`.

   Fields left as "" are simply hidden — the site always looks finished.

   NOTE: the current covers/images are AI-GENERATED PLACEHOLDERS so the
   site looks alive on day one. Replace them with your real Behance
   work — just swap the URLs below.
   ========================================================================== */

window.PORTFOLIO = {

  profile: {
    firstName: "VIKAS",
    lastName: "BANJARE",
    tagline: "Visual Designer & Art Director",
    location: "India",
    availability: "Open for freelance & full-time",
    email: "vikasbanjare94@gmail.com",
    behance: "https://www.behance.net/vikas-banjare",
    linkedin: "https://www.linkedin.com/in/vikasbanjare/",
    // Your photo — LinkedIn headshot URL, or drop "me.jpg" in this folder
    photo: "",
    // The big editorial paragraph in the About section.
    // Words wrapped in *asterisks* render in accent italic serif.
    about:
      "I'm a designer from India crafting *bold* visual identities, posters and digital experiences. I believe good design should feel *alive* — it should move, breathe and make you look twice. From brand worlds to pixel-perfect interfaces, I turn ideas into work that gets *remembered*.",
  },

  // Rotating roles in the hero
  roles: ["BRAND IDENTITY", "GRAPHIC DESIGN", "UI / UX", "MOTION & VIDEO"],

  // The infinite marquee strip
  marquee: ["BRANDING", "POSTERS", "UI / UX", "MOTION", "ILLUSTRATION", "SOCIAL MEDIA"],

  // Quick stats in About
  stats: [
    { value: "5+", label: "Years of design" },
    { value: "60+", label: "Projects shipped" },
    { value: "24/7", label: "Ideas per day" },
  ],

  /* ------------------------------------------------------------------
     SELECTED WORK — your Behance projects.
     Hovering a row floats the `cover` image; clicking opens the
     full-screen case view with images / video / Behance embed.
     ------------------------------------------------------------------ */
  projects: [
    {
      title: "Project One",
      category: "Brand Identity",
      year: "2025",
      description: "Replace me in data.js — paste this project's story from Behance.",
      cover: "https://d8j0ntlcm91z4.cloudfront.net/user_39jjIRIKXNtWnmQrDfR7cEoNClb/hf_20260610_060401_b008b043-1072-426c-9bfd-8f2a2f32214c_min.webp",               // ← Behance image URL
      images: ["https://d8j0ntlcm91z4.cloudfront.net/user_39jjIRIKXNtWnmQrDfR7cEoNClb/hf_20260610_060401_b008b043-1072-426c-9bfd-8f2a2f32214c.png"],              // ← more image URLs for the case view
      videoEmbed: "",          // ← YouTube/Vimeo embed URL
      behanceProjectId: "",    // ← e.g. "123456789"
      link: "https://www.behance.net/vikas-banjare",
    },
    {
      title: "Project Two",
      category: "Poster Series",
      year: "2025",
      description: "Replace me in data.js — paste this project's story from Behance.",
      cover: "https://d8j0ntlcm91z4.cloudfront.net/user_39jjIRIKXNtWnmQrDfR7cEoNClb/hf_20260610_060536_8690ea62-7a39-4061-aa60-f71a4e19866e_min.webp",
      images: ["https://d8j0ntlcm91z4.cloudfront.net/user_39jjIRIKXNtWnmQrDfR7cEoNClb/hf_20260610_060536_8690ea62-7a39-4061-aa60-f71a4e19866e.png"],
      videoEmbed: "",
      behanceProjectId: "",
      link: "https://www.behance.net/vikas-banjare",
    },
    {
      title: "Project Three",
      category: "UI / UX",
      year: "2024",
      description: "Replace me in data.js — paste this project's story from Behance.",
      cover: "https://d8j0ntlcm91z4.cloudfront.net/user_39jjIRIKXNtWnmQrDfR7cEoNClb/hf_20260610_060538_ef9195dd-f90d-4eb0-a229-9e287ea6abe1_min.webp",
      images: ["https://d8j0ntlcm91z4.cloudfront.net/user_39jjIRIKXNtWnmQrDfR7cEoNClb/hf_20260610_060538_ef9195dd-f90d-4eb0-a229-9e287ea6abe1.png"],
      videoEmbed: "",
      behanceProjectId: "",
      link: "https://www.behance.net/vikas-banjare",
    },
    {
      title: "Project Four",
      category: "Social Campaign",
      year: "2024",
      description: "Replace me in data.js — paste this project's story from Behance.",
      cover: "https://d8j0ntlcm91z4.cloudfront.net/user_39jjIRIKXNtWnmQrDfR7cEoNClb/hf_20260610_060540_63d75952-6702-4beb-94e6-c5874631463d_min.webp",
      images: ["https://d8j0ntlcm91z4.cloudfront.net/user_39jjIRIKXNtWnmQrDfR7cEoNClb/hf_20260610_060540_63d75952-6702-4beb-94e6-c5874631463d.png"],
      videoEmbed: "",
      behanceProjectId: "",
      link: "https://www.behance.net/vikas-banjare",
    },
    {
      title: "Project Five",
      category: "Motion Design",
      year: "2023",
      description: "Replace me in data.js — paste this project's story from Behance.",
      cover: "https://d8j0ntlcm91z4.cloudfront.net/user_39jjIRIKXNtWnmQrDfR7cEoNClb/hf_20260610_060542_c6c91705-2d13-4fa9-a73d-00e9617e249a_min.webp",
      images: ["https://d8j0ntlcm91z4.cloudfront.net/user_39jjIRIKXNtWnmQrDfR7cEoNClb/hf_20260610_060542_c6c91705-2d13-4fa9-a73d-00e9617e249a.png"],
      videoEmbed: "",
      behanceProjectId: "",
      link: "https://www.behance.net/vikas-banjare",
    },
    {
      title: "Project Six",
      category: "Illustration",
      year: "2023",
      description: "Replace me in data.js — paste this project's story from Behance.",
      cover: "https://d8j0ntlcm91z4.cloudfront.net/user_39jjIRIKXNtWnmQrDfR7cEoNClb/hf_20260610_060543_84758001-f4e1-4fd1-a84f-85a14a86dfa8_min.webp",
      images: ["https://d8j0ntlcm91z4.cloudfront.net/user_39jjIRIKXNtWnmQrDfR7cEoNClb/hf_20260610_060543_84758001-f4e1-4fd1-a84f-85a14a86dfa8.png"],
      videoEmbed: "",
      behanceProjectId: "",
      link: "https://www.behance.net/vikas-banjare",
    },
  ],

  // Services accordion
  services: [
    {
      title: "Brand Identity",
      description: "Logos, identity systems, art direction and brand worlds built to be remembered — from first sketch to full guidelines.",
      tags: ["Logo", "Identity system", "Art direction", "Guidelines"],
    },
    {
      title: "Graphic Design",
      description: "Posters, covers, thumbnails and campaign visuals with strong typography and stronger ideas.",
      tags: ["Posters", "Key visuals", "Social media", "Print"],
    },
    {
      title: "UI / UX Design",
      description: "Interfaces and experiences that feel effortless — designed in Figma, obsessed over to the last pixel.",
      tags: ["Web design", "Mobile apps", "Design systems", "Prototyping"],
    },
    {
      title: "Motion & Video",
      description: "Animated graphics, edits and micro-interactions that bring static brands to life.",
      tags: ["Motion graphics", "Video editing", "Lottie", "Reels"],
    },
  ],
};
