/* ==========================================================================
   VIKAS BANJARE — portfolio engine
   All content lives in data.js — you should not need to edit this file.
   Lenis + GSAP ScrollTrigger with graceful fallbacks when CDNs are blocked.
   ========================================================================== */

(function () {
  "use strict";

  const DATA = window.PORTFOLIO || {};
  const P = DATA.profile || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined";
  const hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (typeof window.Lenis !== "undefined" && !reducedMotion) {
    lenis = new Lenis({ lerp: 0.09 });
    (function raf(time) { lenis.raf(time); requestAnimationFrame(raf); })();
    if (hasST) lenis.on("scroll", () => window.ScrollTrigger.update());
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const t = $(a.getAttribute("href"));
        if (t) { e.preventDefault(); lenis.scrollTo(t); }
      });
    });
  }
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- render: hero ---------------- */
  const firstName = P.firstName || "VIKAS";
  const lastName = P.lastName || "Banjare";
  const setText = (id, v) => { const el = $("#" + id); if (el) el.textContent = v; };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  setText("name-first", cap(firstName));
  setText("name-last", cap(lastName));
  setText("chip-tagline", (P.tagline || "Visual Designer").toUpperCase());
  setText("chip-location", (P.location || "Earth").toUpperCase());

  /* ---------------- submerged 3D field of work ---------------- */
  // Cards float at varied depths; the whole field orbits toward the cursor
  // and dives as you scroll. Far cards are dimmer & blurred (depth of field).
  let fillHeroCover = () => {};
  (function buildField() {
    const space = $("#space");
    if (!space || reducedMotion) return;
    // scattered 3D coordinates (x%, y%, z px, rotateY, rotateX)
    const defs = [
      { x: -34, y: -22, z: 80,   ry: 18,  rx: -6 },
      { x: 30,  y: -28, z: -180, ry: -16, rx: 5 },
      { x: -42, y: 16,  z: -340, ry: 22,  rx: 8 },
      { x: 40,  y: 22,  z: 40,   ry: -20, rx: -8 },
      { x: -10, y: -34, z: -520, ry: 8,   rx: 10 },
      { x: 12,  y: 30,  z: -260, ry: -10, rx: -10 },
      { x: -48, y: -4,  z: -120, ry: 26,  rx: 2 },
      { x: 48,  y: -10, z: -420, ry: -24, rx: 6 },
      { x: 0,   y: 34,  z: -600, ry: 0,   rx: -12 },
      { x: -22, y: 38,  z: -80,  ry: 14,  rx: -6 },
      { x: 24,  y: -40, z: -340, ry: -12, rx: 8 },
      { x: -38, y: 30,  z: -460, ry: 20,  rx: 4 },
    ];
    const shards = defs.map((d) => {
      const el = document.createElement("div");
      el.className = "shard";
      // depth → dimming + blur for the "submerged" look
      const depth = (d.z + 600) / 800; // 0 (far) .. ~1 (near)
      const dim = (0.45 + depth * 0.55).toFixed(2);
      const blur = Math.max(0, (1 - depth) * 4).toFixed(1);
      el.style.transform = `translate(-50%, -50%) translate3d(${d.x}vw, ${d.y}vh, ${d.z}px) rotateY(${d.ry}deg) rotateX(${d.rx}deg)`;
      el.style.opacity = dim;
      el.style.filter = `blur(${blur}px) saturate(0.9)`;
      el.dataset.base = el.style.transform;
      // gentle individual float
      el.style.animation = `shardfloat ${(7 + Math.random() * 5).toFixed(1)}s ease-in-out ${(Math.random() * 4).toFixed(1)}s infinite alternate`;
      space.appendChild(el);
      return el;
    });
    // inject the float keyframe once
    const kf = document.createElement("style");
    kf.textContent = "@keyframes shardfloat { to { translate: 0 -16px; } }";
    document.head.appendChild(kf);

    const covers = [];
    fillHeroCover = (url) => {
      covers.push(url);
      shards.forEach((s, i) => { s.style.backgroundImage = `url('${covers[i % covers.length]}')`; });
    };

    // parallax (mouse) + dive (scroll)
    let tmx = 0, tmy = 0, mx = 0, my = 0, dive = 0;
    if (fine) {
      window.addEventListener("mousemove", (e) => {
        tmx = (e.clientX / window.innerWidth - 0.5);
        tmy = (e.clientY / window.innerHeight - 0.5);
      }, { passive: true });
    }
    window.addEventListener("scroll", () => {
      const h = window.innerHeight;
      dive = Math.min(1, Math.max(0, window.scrollY / h));
    }, { passive: true });
    (function render() {
      mx += (tmx - mx) * 0.06;
      my += (tmy - my) * 0.06;
      space.style.transform =
        `translateZ(${(dive * 520).toFixed(0)}px) rotateY(${(mx * 20).toFixed(2)}deg) rotateX(${(-my * 14).toFixed(2)}deg)`;
      space.parentElement.style.opacity = (1 - dive * 0.9).toFixed(2);
      requestAnimationFrame(render);
    })();
  })();

  /* ---------------- rising bubbles ---------------- */
  (function bubbles() {
    const wrap = $("#bubbles");
    if (!wrap || reducedMotion) return;
    const N = window.innerWidth < 640 ? 14 : 26;
    for (let i = 0; i < N; i++) {
      const b = document.createElement("span");
      b.className = "bubble";
      const size = 4 + Math.random() * 16;
      b.style.width = b.style.height = size + "px";
      b.style.left = (Math.random() * 100).toFixed(1) + "%";
      b.style.setProperty("--drift", (Math.random() * 80 - 40).toFixed(0) + "px");
      b.style.animationDuration = (9 + Math.random() * 12).toFixed(1) + "s";
      b.style.animationDelay = (-Math.random() * 18).toFixed(1) + "s";
      b.style.opacity = (0.2 + Math.random() * 0.5).toFixed(2);
      wrap.appendChild(b);
    }
  })();

  // personalized greeting — share links like  yoursite.com/?for=Nike
  const params = new URLSearchParams(location.search);
  const guest = (params.get("for") || params.get("company") || "").slice(0, 40).replace(/[<>&"]/g, "");
  if (guest) {
    const g = $("#hero-greeting");
    g.hidden = false;
    g.innerHTML = `Hello <mark></mark>, this one's for you —`;
    g.querySelector("mark").textContent = guest;
    $("#footer-greeting").textContent = `DEAR ${guest.toUpperCase()}, GOT A PROJECT IN MIND?`;
  }

  // roles — scramble/decode effect
  function scramble(el, text, dur = 650) {
    const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&@/*";
    const t0 = performance.now();
    (function frame() {
      const p = Math.min(1, (performance.now() - t0) / dur);
      const upto = Math.floor(p * text.length);
      el.textContent =
        text.slice(0, upto) +
        [...text.slice(upto)].map((c) => (c === " " ? " " : glyphs[(Math.random() * glyphs.length) | 0])).join("");
      if (p < 1) requestAnimationFrame(frame);
    })();
  }

  const roles = DATA.roles || [];
  const rolesTrack = $("#hero-roles-track");
  const roleEl = document.createElement("span");
  roleEl.textContent = roles[0] || "";
  rolesTrack.appendChild(roleEl);
  if (roles.length > 1 && !reducedMotion) {
    let ri = 0;
    setInterval(() => {
      ri = (ri + 1) % roles.length;
      scramble(roleEl, roles[ri]);
    }, 2600);
  }

  /* ---------------- render: marquees ---------------- */
  const words = DATA.marquee || [];
  function fillMarquee(el) {
    let html = "";
    for (let r = 0; r < 2; r++) {
      words.forEach((w, j) => { html += `<span class="${j % 2 ? "out" : ""}">${w}&nbsp;✦&nbsp;</span>`; });
    }
    el.innerHTML = html;
  }
  fillMarquee($("#marquee-track"));
  fillMarquee($("#marquee-track-2"));

  /* ---------------- render: work cards ---------------- */
  // covers load with a graceful fallback: cards start as bold gradient
  // placeholders and upgrade to the image only once it actually loads
  const loadedCovers = [];
  // Accepts a full URL/filename, or an extensionless base name — in which
  // case every common extension is tried until one loads.
  function loadImg(src, ok) {
    if (!src) return;
    const candidates = src.includes(".")
      ? [src]
      : [src + ".png", src + ".jpg", src + ".jpeg", src + ".webp", src + ".jpg.png", src + ".PNG", src + ".JPG"];
    (function next(i) {
      if (i >= candidates.length) return;
      const im = new Image();
      im.onload = () => ok(candidates[i]);
      im.onerror = () => next(i + 1);
      im.src = candidates[i];
    })(0);
  }

  const projects = DATA.projects || [];
  $("#work-count").textContent = String(projects.length).padStart(2, "0");
  const htrack = $("#htrack");
  projects.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "hcard";
    card.dataset.index = i;
    card.dataset.cursor = "view";
    card.style.setProperty("--tilt", (i % 2 ? 1.6 : -1.8) + "deg");
    card.innerHTML =
      `<span class="hcard-num">${String(i + 1).padStart(2, "0")}</span>` +
      `<div class="hcard-cover ph-${i % 6}"><span class="ph-word">${p.category || p.title}</span>` +
      (p.cover ? "" : `<span class="ph-note">PASTE BEHANCE IMAGE IN data.js</span>`) +
      `</div>` +
      `<div class="hcard-body"><h3 class="hcard-title">${p.title}</h3><span class="hcard-cat">${p.category || ""}</span></div>`;
    htrack.appendChild(card);
    loadImg(p.cover, (url) => {
      loadedCovers.push(url);
      const c = $(".hcard-cover", card);
      c.style.backgroundImage = `url('${url}')`;
      c.classList.add("has-img");
      fillHeroCover(url); // feed the submerged 3D field
    });
  });
  const endCard = document.createElement("a");
  endCard.className = "hcard-end";
  endCard.href = P.behance || "#";
  endCard.target = "_blank"; endCard.rel = "noopener";
  endCard.dataset.cursor = "hover";
  endCard.innerHTML = `<span>SEE EVERYTHING<br/>ON BEHANCE</span><span class="arr">→</span>`;
  htrack.appendChild(endCard);

  /* ---------------- hero scroll story (character journey) ---------------- */
  const story = DATA.story || [];
  const storyStage = $("#story-stage");
  if (story.length && storyStage) {
    storyStage.innerHTML =
      story.map(() => `<div class="story-scene"></div>`).join("") +
      `<div class="story-caption" id="story-caption"></div>`;
    const scenes = $$(".story-scene", storyStage);
    const caption = $("#story-caption");

    let curScene = -1;
    function setScene(i) {
      if (i === curScene) return;
      curScene = i;
      scenes.forEach((el, j) => el.classList.toggle("on", j === i));
      scramble(caption, (story[i].caption || "").toUpperCase(), 420);
    }

    // the whole stage stays hidden until at least one scene file exists,
    // so the site looks clean before the story media is uploaded
    let armed = false;
    function arm() {
      if (armed) return;
      armed = true;
      storyStage.classList.add("live");
      setScene(0);
      if (hasST && !reducedMotion) {
        ScrollTrigger.create({
          trigger: "#hero",
          start: "top top",
          end: "+=200%",
          pin: true,
          scrub: true,
          onUpdate(self) {
            const n = story.length;
            setScene(Math.min(n - 1, Math.floor(self.progress * n)));
            // last scene: free-fall reacts to scroll speed & direction
            if (curScene === n - 1) {
              const v = gsap.utils.clamp(-1, 1, self.getVelocity() / 1600);
              scenes[n - 1].style.transform =
                `scale(1) rotate(${(v * 10).toFixed(1)}deg) translateY(${(v * 22).toFixed(1)}px)`;
            }
          },
        });
        ScrollTrigger.refresh();
      } else {
        setInterval(() => setScene((curScene + 1) % story.length), 2800);
      }
    }

    // each scene accepts a video (.mp4/.webm) or an image (any extension)
    story.forEach((s, i) => {
      const base = s.media || s.image || "";
      if (!base) return;
      const vids = base.includes(".")
        ? (/\.(mp4|webm)$/i.test(base) ? [base] : [])
        : [base + ".mp4", base + ".webm"];
      (function tryVideo(v) {
        if (v >= vids.length) {
          loadImg(base, (url) => { scenes[i].style.backgroundImage = `url('${url}')`; arm(); });
          return;
        }
        fetch(vids[v], { method: "HEAD" })
          .then((r) => {
            if (r.ok) {
              scenes[i].innerHTML = `<video src="${vids[v]}" autoplay muted loop playsinline></video>`;
              arm();
            } else tryVideo(v + 1);
          })
          .catch(() => tryVideo(v + 1));
      })(0);
    });

    // the stage sways toward the cursor
    if (fine && !reducedMotion) {
      window.addEventListener("mousemove", (e) => {
        const dx = e.clientX / window.innerWidth - 0.5;
        storyStage.style.transform = `rotate(${(dx * 3).toFixed(2)}deg) translateX(${(dx * 16).toFixed(1)}px)`;
      }, { passive: true });
    }
  }

  /* ---------------- showreel — floating landscape panels ---------------- */
  const reelItems = DATA.showreel || [];
  const reelFlow = $("#reel-flow");
  if (reelItems.length && reelFlow) {
    reelItems.forEach((item, i) => {
      const panel = document.createElement("div");
      panel.className = "reel-panel";
      panel.innerHTML =
        `<div class="rp-media ph-${i % 6}" data-cursor="play">` +
        `<div class="rp-img"></div>` +
        `<span class="rp-num">${String(i + 1).padStart(2, "0")}</span>` +
        `<span class="rp-play" aria-hidden="true">▶</span>` +
        `<div class="rp-bar"><span class="rp-title">${item.title}</span><span class="rp-label">${item.label || ""} · CLICK TO PLAY</span></div>` +
        `</div>`;
      reelFlow.appendChild(panel);
      // images preloaded immediately — no clicks needed to see the work
      loadImg(item.cover, (url) => { $(".rp-img", panel).style.backgroundImage = `url('${url}')`; });
      $(".rp-media", panel).addEventListener("click", () => {
        const src = item.youtubeId
          ? `https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0`
          : `https://www.behance.net/embed/project/${item.behanceProjectId}?ilo0=1`;
        panel.innerHTML = `<div class="rp-frame"><iframe src="${src}" title="${item.title}" allowfullscreen allow="autoplay; clipboard-write; fullscreen; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
      });
    });

    // panels float in from alternating sides as you scroll
    if (hasST && !reducedMotion) {
      $$(".reel-panel", reelFlow).forEach((panel, i) => {
        gsap.from(panel, {
          x: i % 2 ? 180 : -180,
          y: 80,
          rotate: i % 2 ? 4 : -4,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: panel, start: "top 90%" },
        });
        const img = $(".rp-img", panel);
        if (img) {
          gsap.fromTo(img, { yPercent: -9 }, {
            yPercent: 9, ease: "none",
            scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: true },
          });
        }
      });
    }
  }

  /* ---------------- render: about ---------------- */
  const aboutText = $("#about-text");
  (P.about || "").split(/\s+/).forEach((word) => {
    const acc = /^\*.*\*[.,!?—]?$/.test(word);
    const s = document.createElement("span");
    s.className = "w" + (acc ? " acc" : "");
    s.textContent = word.replace(/\*/g, "") + " ";
    aboutText.appendChild(s);
  });
  const aboutPhoto = $("#about-photo");
  loadImg(P.photo, (url) => {
    aboutPhoto.style.backgroundImage = `url("${url}")`;
    const hint = $("#about-photo-hint");
    if (hint) hint.remove();
  });
  const statsWrap = $("#about-stats");
  (DATA.stats || []).forEach((st) => {
    const d = document.createElement("div");
    d.className = "about-stat";
    d.innerHTML = `<span class="v">${st.value}</span><span class="l">${st.label}</span>`;
    statsWrap.appendChild(d);
  });

  /* ---------------- render: services (interactive, image-led) ---------------- */
  const svcList = $("#svc-list");
  const svcStage = $("#svc-stage");
  if (svcList && svcStage) {
    const services = DATA.services || [];
    // each service -> a few related project covers (by base filename)
    const svcWork = [
      ["cover-podcast", "cover-trailer", "cover-ai-videos", "cover-wealthy", "cover-motion"],
      ["cover-creative", "cover-social", "cover-thumbnails", "cover-emailer"],
      ["cover-website", "cover-ai-website"],
      ["cover-ai-videos", "cover-thumbnails", "cover-ai-website"],
    ];
    services.forEach((s, i) => {
      const row = document.createElement("button");
      row.className = "svc-row";
      row.type = "button";
      row.dataset.i = i;
      row.dataset.cursor = "view";
      row.innerHTML =
        `<span class="svc-n">${String(i + 1).padStart(2, "0")}</span>` +
        `<span class="svc-t">${s.title}</span>` +
        `<span class="svc-tags">${(s.tags || []).slice(0, 3).join(" · ")}</span>` +
        `<span class="svc-go">→</span>`;
      svcList.appendChild(row);
    });

    let svcCur = -1;
    function showSvc(i) {
      if (i === svcCur) return;
      svcCur = i;
      const s = services[i] || {};
      const covers = svcWork[i] || [];
      svcStage.innerHTML =
        `<div class="svc-cards">` +
        covers.map((c, j) => `<div class="svc-card" style="--d:${j}"><span class="svc-ph">${(s.tags || [])[j] || s.title}</span></div>`).join("") +
        `</div>` +
        `<div class="svc-meta"><p class="svc-desc">${s.description || ""}</p>` +
        `<div class="svc-tagrow">${(s.tags || []).map((t) => `<span>${t}</span>`).join("")}</div></div>`;
      $$(".svc-card", svcStage).forEach((el, j) => loadImg(covers[j], (url) => {
        el.style.backgroundImage = `url('${url}')`;
        el.classList.add("has-img");
      }));
      $$(".svc-row", svcList).forEach((r, k) => r.classList.toggle("active", k === i));
    }
    svcList.addEventListener("pointerover", (e) => {
      const r = e.target.closest(".svc-row");
      if (r) showSvc(Number(r.dataset.i));
    });
    svcList.addEventListener("click", (e) => {
      const r = e.target.closest(".svc-row");
      if (r) { const w = $("#work"); if (w) (lenis ? lenis.scrollTo(w) : w.scrollIntoView()); }
    });
    showSvc(0);
  }

  /* ---------------- render: footer ---------------- */
  $("#footer-email").href = "mailto:" + (P.email || "");
  $("#footer-email-text").textContent = P.email || "";
  $("#link-behance").href = P.behance || "#";
  $("#link-linkedin").href = P.linkedin || "#";
  $("#footer-location").textContent = P.location || "";
  $("#footer-year").textContent = new Date().getFullYear();

  function tickTime() {
    const t = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(new Date());
    $("#chip-time").textContent = t;
    $("#footer-time").textContent = t + " IST";
  }
  tickTime();
  setInterval(tickTime, 30000);

  /* ---------------- preloader ---------------- */
  const preloader = $("#preloader");
  const countEl = $("#preloader-count");
  const wordEl = $("#preloader-word");
  const hellos = ["HELLO", "नमस्ते", "HOLA", "BONJOUR", "CIAO", "こんにちは"];
  let wi = 0;
  const wordTimer = setInterval(() => { wi = (wi + 1) % hellos.length; wordEl.textContent = hellos[wi]; }, 240);

  const t0 = performance.now();
  const minDuration = reducedMotion ? 150 : 1600;
  const counter = setInterval(() => {
    const p = Math.min(100, Math.round(((performance.now() - t0) / minDuration) * 100));
    countEl.textContent = p;
    if (p >= 100) {
      clearInterval(counter);
      clearInterval(wordTimer);
      preloader.classList.add("done");
      setTimeout(() => { preloader.remove(); intro(); }, 850);
    }
  }, 30);

  function intro() {
    if (!hasGsap || reducedMotion) return;
    gsap.from(".hero-center > *", { y: 36, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.12 });
    gsap.from(".shard", { opacity: 0, duration: 1.4, ease: "power2.out", stagger: 0.04, delay: 0.2 });
    gsap.from(".site-header", { y: -40, opacity: 0, duration: 0.7, delay: 0.5 });
  }

  /* ---------------- kinetic hero letters (repel from cursor) ----------- */
  const ks = $$(".kinetic .k");
  if (fine && !reducedMotion && ks.length) {
    let raf = null;
    window.addEventListener("mousemove", (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        ks.forEach((k) => {
          const r = k.getBoundingClientRect();
          const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
          const dx = cx - e.clientX, dy = cy - e.clientY;
          const dist = Math.hypot(dx, dy);
          const range = 260;
          if (dist < range) {
            const force = (1 - dist / range) * 34;
            const a = Math.atan2(dy, dx);
            k.style.transform = `translate(${Math.cos(a) * force}px, ${Math.sin(a) * force}px) rotate(${(dx > 0 ? 1 : -1) * force * 0.22}deg)`;
          } else {
            k.style.transform = "";
          }
        });
      });
    });
  }

  /* ---------------- image trail in hero ---------------- */
  const trailZone = $("#trail-zone");
  if (fine && !reducedMotion && trailZone) {
    let lastX = -999, lastY = -999, ti = 0;
    const trailWords = words.length ? words : ["DESIGN"];
    $("#hero").addEventListener("mousemove", (e) => {
      if (Math.hypot(e.clientX - lastX, e.clientY - lastY) < 110) return;
      lastX = e.clientX; lastY = e.clientY;
      const zr = trailZone.getBoundingClientRect();
      const el = document.createElement("div");
      el.className = "trail-img";
      if (loadedCovers.length) {
        el.style.backgroundImage = `url('${loadedCovers[ti % loadedCovers.length]}')`;
      } else {
        el.classList.add("ph-" + (ti % 6));
        el.innerHTML = `<span class="t-label">${trailWords[ti % trailWords.length]}</span>`;
      }
      el.style.left = e.clientX - zr.left - 70 + "px";
      el.style.top = e.clientY - zr.top - 90 + "px";
      el.style.setProperty("--rot", (Math.random() * 16 - 8).toFixed(1) + "deg");
      trailZone.appendChild(el);
      requestAnimationFrame(() => el.classList.add("live"));
      setTimeout(() => el.classList.add("die"), 550);
      setTimeout(() => el.remove(), 1100);
      while (trailZone.children.length > 10) trailZone.firstChild.remove();
      ti++;
    });
  }

  /* ---------------- Selected Work: drag-scroll carousel ---------------- */
  const wrap = $("#htrack-wrap");
  if (wrap) {
    wrap.classList.add("drag"); // always horizontal-scroll; no fragile pinning
    // wheel → horizontal
    wrap.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        wrap.scrollLeft += e.deltaY;
        if (wrap.scrollWidth - wrap.clientWidth - wrap.scrollLeft > 1 && wrap.scrollLeft > 1) e.preventDefault();
      }
    }, { passive: false });
    // grab & drag with momentum
    let down = false, startX = 0, startScroll = 0, vx = 0, lastX = 0, moved = false, mo = null;
    wrap.addEventListener("pointerdown", (e) => {
      down = true; moved = false; startX = lastX = e.clientX; startScroll = wrap.scrollLeft; vx = 0;
      cancelAnimationFrame(mo); wrap.classList.add("grabbing"); wrap.setPointerCapture(e.pointerId);
    });
    wrap.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - lastX; lastX = e.clientX; vx = dx;
      if (Math.abs(e.clientX - startX) > 6) moved = true;
      wrap.scrollLeft = startScroll - (e.clientX - startX);
    });
    function release() {
      if (!down) return;
      down = false; wrap.classList.remove("grabbing");
      (function glide() { // momentum
        if (Math.abs(vx) < 0.5) return;
        wrap.scrollLeft -= vx; vx *= 0.92; mo = requestAnimationFrame(glide);
      })();
    }
    wrap.addEventListener("pointerup", release);
    wrap.addEventListener("pointercancel", release);
    // suppress click-through right after a drag
    htrack.addEventListener("click", (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
  }

  /* ---------------- water ripple + liquid warp over the work images ---------------- */
  const workSection = $("#work");
  if (workSection && !reducedMotion) {
    let lastRx = -999, lastRy = -999;
    function ripple(x, y, big) {
      const r = document.createElement("span");
      r.className = "ripple" + (big ? " ripple-big" : "");
      r.style.left = x + "px";
      r.style.top = y + "px";
      workSection.appendChild(r);
      setTimeout(() => r.remove(), big ? 1100 : 820);
    }
    workSection.addEventListener("pointermove", (e) => {
      const card = e.target.closest(".hcard-cover");
      if (!card) return;
      if (Math.hypot(e.clientX - lastRx, e.clientY - lastRy) < 60) return;
      lastRx = e.clientX; lastRy = e.clientY;
      const wr = workSection.getBoundingClientRect();
      ripple(e.clientX - wr.left, e.clientY - wr.top, false);
    }, { passive: true });
    workSection.addEventListener("pointerdown", (e) => {
      const card = e.target.closest(".hcard-cover");
      if (!card) return;
      const wr = workSection.getBoundingClientRect();
      ripple(e.clientX - wr.left, e.clientY - wr.top, true);
    });

    // real liquid displacement on the hovered cover (one filtered image at a time)
    const disp = $("#liquid-disp");
    if (disp && fine) {
      let scale = 0, target = 0, rafD = null, active = null;
      function ramp() {
        rafD = null;
        scale += (target - scale) * 0.14;
        disp.setAttribute("scale", scale.toFixed(2));
        if (Math.abs(target - scale) > 0.3) rafD = requestAnimationFrame(ramp);
        else { scale = target; disp.setAttribute("scale", scale); if (target === 0 && active) { active.classList.remove("liquid"); active = null; } }
      }
      workSection.addEventListener("pointerover", (e) => {
        const cover = e.target.closest(".hcard-cover");
        if (!cover || cover === active) return;
        if (active) active.classList.remove("liquid");
        active = cover; cover.classList.add("liquid");
        target = 26; if (!rafD) rafD = requestAnimationFrame(ramp);
      });
      workSection.addEventListener("pointerout", (e) => {
        const cover = e.target.closest(".hcard-cover");
        if (cover && cover === active && !cover.contains(e.relatedTarget)) {
          target = 0; if (!rafD) rafD = requestAnimationFrame(ramp);
        }
      });
    }
  }

  /* ---------------- scroll reveals + manifesto highlight ---------------- */
  if (hasST && !reducedMotion) {
    $$(".mega").forEach((el) => {
      gsap.from(el, { y: 70, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" } });
    });
    gsap.from(".polaroid", { rotate: -14, y: 60, opacity: 0, duration: 1, ease: "back.out(1.5)", scrollTrigger: { trigger: ".about-grid", start: "top 80%" } });
    gsap.from(".service", { y: 40, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.07, scrollTrigger: { trigger: ".services-list", start: "top 85%" } });
    gsap.from(".footer-row", { yPercent: 70, opacity: 0, duration: 1, ease: "power4.out", stagger: 0.12, scrollTrigger: { trigger: ".footer", start: "top 70%" } });

    const wordEls = $$("#about-text .w");
    if (wordEls.length) {
      aboutText.classList.add("scrub");
      ScrollTrigger.create({
        trigger: "#about-text", start: "top 78%", end: "bottom 45%",
        onUpdate(self) {
          const upto = Math.floor(self.progress * wordEls.length);
          wordEls.forEach((w, i) => w.classList.toggle("lit", i <= upto));
        },
      });
    }
  }

  /* ---------------- cursor blob ---------------- */
  const blob = $("#cursor-blob");
  const blobLabel = $("#cursor-label");
  if (fine && !reducedMotion) {
    let mx = -100, my = -100, bx = -100, by = -100;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    (function loop() {
      bx += (mx - bx) * 0.2;
      by += (my - by) * 0.2;
      blob.style.left = bx + "px";
      blob.style.top = by + "px";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-cursor]");
      blob.classList.remove("hover", "say");
      blobLabel.textContent = "";
      if (!t) return;
      if (t.dataset.cursor === "view") { blob.classList.add("say"); blobLabel.textContent = "VIEW ↗"; }
      else if (t.dataset.cursor === "drag") { blob.classList.add("say"); blobLabel.textContent = "DRAG ME"; }
      else if (t.dataset.cursor === "play") { blob.classList.add("say"); blobLabel.textContent = "PLAY ▶"; }
      else blob.classList.add("hover");
    });
  } else {
    blob.remove();
  }

  /* ---------------- eyes follow the cursor ---------------- */
  const pupils = $$(".pupil");
  if (fine && !reducedMotion && pupils.length) {
    window.addEventListener("mousemove", (e) => {
      pupils.forEach((p) => {
        const r = p.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const a = Math.atan2(e.clientY - cy, e.clientX - cx);
        const max = r.width * 1.1;
        p.style.transform = `translate(${Math.cos(a) * max}px, ${Math.sin(a) * max}px)`;
      });
    });
  }

  /* ---------------- draggable polaroid ---------------- */
  const polaroid = $("#polaroid");
  if (polaroid && !reducedMotion) {
    let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0, x = 0, y = 0;
    polaroid.addEventListener("pointerdown", (e) => {
      dragging = true; sx = e.clientX; sy = e.clientY; ox = x; oy = y;
      polaroid.setPointerCapture(e.pointerId);
    });
    polaroid.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      x = ox + e.clientX - sx;
      y = oy + e.clientY - sy;
      polaroid.style.transform = `translate(${x}px, ${y}px) rotate(${-4 + x * 0.02}deg)`;
    });
    ["pointerup", "pointercancel"].forEach((ev) =>
      polaroid.addEventListener(ev, () => { dragging = false; })
    );
  }

  /* ---------------- flying tool icons in 3D space ---------------- */
  const flyScene = $("#fly-scene");
  if (flyScene && !reducedMotion) {
    // your editing stack, floating in zero gravity
    const TOOLS = [
      { l: "Pr", fg: "#9999ff", bg: "#00005b", x: 74, y: 12, z: 160, s: 104 },
      { l: "Ae", fg: "#9999ff", bg: "#00005b", x: 60, y: 60, z: -110, s: 72 },
      { l: "Ps", fg: "#31a8ff", bg: "#001e36", x: 86, y: 40, z: 60, s: 92 },
      { l: "Ai", fg: "#ff9a00", bg: "#330000", x: 5,  y: 48, z: 190, s: 96 },
      { l: "Lr", fg: "#31a8ff", bg: "#001e36", x: 28, y: 8,  z: -160, s: 60 },
      { l: "Id", fg: "#ff3366", bg: "#49021f", x: 44, y: 18, z: 90, s: 70 },
      { l: "Fg", fg: "#0acf83", bg: "#1e1e1e", x: 14, y: 24, z: -60, s: 64 },
    ];
    const icons = TOOLS.map((t, i) => {
      const el = document.createElement("div");
      el.className = "fly-icon";
      el.textContent = t.l;
      el.style.cssText =
        `left:${t.x}%;top:${t.y}%;width:${t.s}px;height:${t.s}px;` +
        `background:${t.bg};color:${t.fg};font-size:${Math.round(t.s * 0.38)}px;`;
      el.addEventListener("click", () => {
        el.classList.remove("kick");
        void el.offsetWidth;
        el.classList.add("kick");
        addToolToast(t.l);
      });
      flyScene.appendChild(el);
      return { el, t, phase: i * 1.7, spin: (i % 2 ? 1 : -1) * (8 + i * 3) };
    });

    const toolNames = { Pr: "PREMIERE PRO", Ae: "AFTER EFFECTS", Ps: "PHOTOSHOP", Ai: "ILLUSTRATOR", Lr: "LIGHTROOM", Id: "INDESIGN", Fg: "FIGMA" };
    function addToolToast(l) { showToast("🛠 " + (toolNames[l] || l) + " — 7 YEARS IN"); }

    let fmx = 0.5, fmy = 0.5;
    if (fine) {
      window.addEventListener("mousemove", (e) => {
        fmx = e.clientX / window.innerWidth;
        fmy = e.clientY / window.innerHeight;
      }, { passive: true });
    }
    (function flyLoop(now) {
      const t = now / 1000;
      // whole 3D scene tilts toward the cursor
      flyScene.style.transform = `rotateX(${((fmy - 0.5) * -16).toFixed(2)}deg) rotateY(${((fmx - 0.5) * 22).toFixed(2)}deg)`;
      icons.forEach((ic) => {
        const { el, t: cfg, phase, spin } = ic;
        const fx = Math.sin(t * 0.42 + phase) * 110;
        const fy = Math.cos(t * 0.31 + phase * 1.3) * 64;
        const rz = Math.sin(t * 0.3 + phase) * 12;
        const ry = Math.sin(t * 0.45 + phase) * (14 + Math.abs(spin));
        el.style.transform =
          `translate3d(${fx.toFixed(1)}px, ${fy.toFixed(1)}px, ${cfg.z}px)` +
          ` rotateY(${ry.toFixed(1)}deg) rotateZ(${rz.toFixed(1)}deg)`;
      });
      requestAnimationFrame(flyLoop);
    })(0);
  }

  /* ---------------- aurora follow + doodle parallax ---------------- */
  const auroraBlob = $("#aurora i");
  const depthEls = $$(".doodle[data-depth], .hero-face");
  if (fine && !reducedMotion && (auroraBlob || depthEls.length)) {
    let amx = 0.5, amy = 0.5, ax = 0.5, ay = 0.5;
    window.addEventListener("mousemove", (e) => {
      amx = e.clientX / window.innerWidth;
      amy = e.clientY / window.innerHeight;
    }, { passive: true });
    (function auroraLoop() {
      ax += (amx - ax) * 0.045;
      ay += (amy - ay) * 0.045;
      if (auroraBlob) {
        auroraBlob.style.transform =
          `translate(${((ax - 0.5) * 40).toFixed(2)}vw, ${((ay - 0.5) * 34).toFixed(2)}vh) scale(${(1 + ax * 0.25).toFixed(3)})`;
      }
      depthEls.forEach((el) => {
        const d = Number(el.dataset.depth || 2);
        el.style.translate = `${((ax - 0.5) * d * 10).toFixed(1)}px ${((ay - 0.5) * d * 8).toFixed(1)}px`;
      });
      requestAnimationFrame(auroraLoop);
    })();
  }

  /* ---------------- magnetic CTA ---------------- */
  if (fine && !reducedMotion) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform .5s cubic-bezier(.65,0,.15,1)";
        el.style.transform = "translate(0,0)";
        setTimeout(() => (el.style.transition = ""), 500);
      });
    });
  }

  /* ---------------- case view ---------------- */
  const caseEl = $("#case");
  const caseScroll = $("#case-scroll");

  function openCase(index) {
    const p = projects[index];
    if (!p) return;
    $("#case-index").textContent = `PROJECT ${String(index + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
    $("#case-title").textContent = p.title;
    $("#case-meta").textContent = [p.category, p.year].filter(Boolean).join(" · ");
    $("#case-desc").textContent = p.description || "";

    let html = "";
    if (p.behanceProjectId) html += `<div class="embed behance"><iframe src="https://www.behance.net/embed/project/${p.behanceProjectId}?ilo0=1" allowfullscreen loading="lazy" allow="clipboard-write" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
    if (p.videoEmbed) html += `<div class="embed"><iframe src="${p.videoEmbed}" allowfullscreen loading="lazy"></iframe></div>`;
    if (Array.isArray(p.images) && p.images.length) html += p.images.map((src) => `<img src="${src}" alt="${p.title}" loading="lazy"/>`).join("");
    if (!html) html = `<div class="case-empty">No media yet —<br/>paste this project's Behance image URLs, video embed,<br/>or Behance project ID in <b>data.js</b></div>`;
    $("#case-media").innerHTML = html;
    $("#case-link").href = p.link || P.behance || "#";

    caseEl.hidden = false;
    requestAnimationFrame(() => caseEl.classList.add("open"));
    caseScroll.scrollTop = 0;
    if (lenis) lenis.stop();
    document.body.style.overflow = "hidden";
  }

  function closeCase() {
    caseEl.classList.remove("open");
    setTimeout(() => { caseEl.hidden = true; $("#case-media").innerHTML = ""; }, 660);
    if (lenis) lenis.start();
    document.body.style.overflow = "";
  }

  htrack.addEventListener("click", (e) => {
    const card = e.target.closest(".hcard");
    if (card) openCase(Number(card.dataset.index));
  });
  $("#case-close").addEventListener("click", closeCase);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !caseEl.hidden) closeCase(); });

  /* ---------------- scroll progress bar ---------------- */
  const progress = $("#progress");
  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
  }, { passive: true });

  /* ---------------- 3D tilt on work cards ---------------- */
  if (fine && !reducedMotion) {
    htrack.addEventListener("mousemove", (e) => {
      const card = e.target.closest(".hcard");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -8;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 10;
      card.style.transition = "transform .08s linear";
      card.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px)`;
    }, { passive: true });
    htrack.addEventListener("mouseout", (e) => {
      const card = e.target.closest(".hcard");
      if (card && !card.contains(e.relatedTarget)) {
        card.style.transition = "";
        card.style.transform = "";
      }
    });
  }

  /* ---------------- stats count up ---------------- */
  const statEls = $$(".about-stat .v");
  if (statEls.length && "IntersectionObserver" in window && !reducedMotion) {
    const io = new IntersectionObserver((entries, obs) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      obs.disconnect();
      statEls.forEach((el) => {
        const m = el.textContent.trim().match(/^([\d.]+)(M|K)?(\+)?$/);
        if (!m) return;
        const target = parseFloat(m[1]) * (m[2] === "M" ? 1e6 : m[2] === "K" ? 1e3 : 1);
        const plus = m[3] || "";
        const t0 = performance.now();
        (function tick() {
          const p = Math.min(1, (performance.now() - t0) / 1300);
          const eased = 1 - Math.pow(1 - p, 3);
          const cur = target * eased;
          el.textContent =
            (cur >= 1e6 ? (Math.round(cur / 1e5) / 10).toFixed(cur < target ? 1 : 0) + "M"
             : cur >= 1e3 && target >= 1e3 && m[2] ? Math.round(cur / 1e3) + "K"
             : Math.round(cur)) + (p === 1 ? plus : "");
          if (p < 1) requestAnimationFrame(tick);
        })();
      });
    }, { threshold: 0.5 });
    io.observe($(".about-stats"));
  }

  /* ---------------- experience: 3D monolith scroll-reveal ---------------- */
  const shorts = DATA.shorts || [];
  const mono = $("#mono");
  const monoScroll = $("#mono-scroll");
  if (shorts.length && mono && monoScroll) {
    const bgCovers = ["cover-website", "cover-wealthy", "cover-thumbnails", "cover-creative"];
    const N = shorts.length;            // faces around the prism
    const STEP = 360 / N;               // degrees per face
    const monoInfo = $("#mono-info");
    const monoRail = $("#mono-rail");

    // build the faces of the rotating slab
    shorts.forEach((s, i) => {
      const face = document.createElement("div");
      face.className = "mono-face";
      face.style.transform = `rotateY(${i * STEP}deg) translateZ(var(--mono-depth))`;
      face.innerHTML =
        `<div class="mf-img"></div>` +
        `<div class="mf-grad"></div>` +
        `<span class="mf-num">${String(i + 1).padStart(2, "0")}</span>` +
        `<span class="mf-co">${s.company}</span>` +
        `<span class="mf-role">${s.role}</span>`;
      mono.appendChild(face);
      loadImg(bgCovers[i % bgCovers.length], (url) => { $(".mf-img", face).style.backgroundImage = `url('${url}')`; });
    });

    // progress rail
    monoRail.innerHTML = shorts.map((s, i) => `<li><span>${String(i + 1).padStart(2, "0")}</span></li>`).join("");
    const railItems = $$("li", monoRail);

    // info panel (crossfades on chapter change)
    let active = -1;
    function setActive(i) {
      if (i === active) return;
      active = i;
      const s = shorts[i];
      monoInfo.innerHTML =
        `<span class="mi-step">${String(i + 1).padStart(2, "0")} <i>/ ${String(N).padStart(2, "0")}</i></span>` +
        `<span class="mi-emoji">${s.emoji}</span>` +
        `<h3 class="mi-company">${s.company}</h3>` +
        `<span class="mi-role">${s.role}</span>` +
        `<span class="mi-period">${s.period}</span>` +
        `<ul class="mi-points">${(s.points || []).map((pt) => `<li>${pt}</li>`).join("")}</ul>`;
      railItems.forEach((el, k) => el.classList.toggle("active", k === i));
    }
    setActive(0);

    // scroll drives the rotation (sticky pin — robust, no library needed)
    const LERP = reducedMotion ? 1 : 0.1;
    let ry = 0, targetRy = 0;
    function compute() {
      const total = monoScroll.offsetHeight - window.innerHeight;
      const scrolled = Math.min(Math.max(-monoScroll.getBoundingClientRect().top, 0), Math.max(total, 1));
      const progress = total > 0 ? scrolled / total : 0;
      targetRy = progress * (N - 1) * STEP;            // 0 .. (N-1)*STEP
      setActive(Math.min(N - 1, Math.round(progress * (N - 1))));
    }
    function render(t) {
      ry += (targetRy - ry) * LERP;
      const idle = reducedMotion ? 0 : Math.sin(t / 1400) * 4;
      mono.style.transform = `rotateX(-6deg) rotateY(${-(ry + idle).toFixed(2)}deg)`;
      requestAnimationFrame(render);
    }
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    compute();
    render(0);

    // click a rail dot to jump to that chapter
    railItems.forEach((el, i) => {
      el.addEventListener("click", () => {
        const total = monoScroll.offsetHeight - window.innerHeight;
        const y = monoScroll.offsetTop + (i / (N - 1)) * total;
        (lenis ? lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: "smooth" }));
      });
    });
  }

  /* ---------------- toolbox: proximity-glow tool cloud (fast) ---------------- */
  const cloud = $("#tool-cloud");
  if (cloud) {
    const pills = (DATA.toolbox || []).map((t) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "tool-pill";
      el.dataset.cursor = "hover";
      el.textContent = t;
      el.addEventListener("click", () => {
        el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop");
        showToast("🛠 " + t.toUpperCase());
      });
      cloud.appendChild(el);
      return el;
    });
    // glow/scale by distance to cursor — updated once per frame (no repaints of masks)
    if (fine && !reducedMotion && pills.length) {
      let tx = -9999, ty = -9999, raf = null;
      function update() {
        raf = null;
        for (const el of pills) {
          const r = el.getBoundingClientRect();
          const d = Math.hypot(r.left + r.width / 2 - tx, r.top + r.height / 2 - ty);
          el.style.setProperty("--k", Math.max(0, 1 - d / 240).toFixed(3));
        }
      }
      const ping = () => { if (!raf) raf = requestAnimationFrame(update); };
      cloud.addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; ping(); }, { passive: true });
      cloud.addEventListener("pointerleave", () => { tx = ty = -9999; ping(); });
    }
  }

  /* ---------------- throwable hero chips (grab & yeet) ---------------- */
  const hero = $("#hero");
  if (!reducedMotion) {
    $$(".hero-chips .chip").forEach((chip) => {
      let raf = null, px = 0, py = 0, vx = 0, vy = 0, lastT = 0, lastX = 0, lastY = 0, grabX = 0, grabY = 0;

      function physics(t) {
        const dt = Math.min(0.04, (t - lastT) / 1000) || 0.016;
        lastT = t;
        const hr = hero.getBoundingClientRect();
        const maxX = hr.width - chip.offsetWidth - 4;
        const maxY = hr.height - chip.offsetHeight - 6;
        vy += 2400 * dt;
        px += vx * dt;
        py += vy * dt;
        if (py >= maxY) { py = maxY; vy *= -0.55; vx *= 0.82; }
        if (px <= 4) { px = 4; vx *= -0.7; }
        if (px >= maxX) { px = maxX; vx *= -0.7; }
        chip.style.left = px + "px";
        chip.style.top = py + "px";
        chip.style.transform = `rotate(${(vx * 0.01).toFixed(1)}deg)`;
        if (py >= maxY - 0.5 && Math.abs(vy) < 40 && Math.abs(vx) < 12) return; // settled
        raf = requestAnimationFrame(physics);
      }

      chip.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        cancelAnimationFrame(raf);
        const hr = hero.getBoundingClientRect();
        const cr = chip.getBoundingClientRect();
        if (!chip.classList.contains("thrown")) {
          chip.classList.add("thrown");
          hero.appendChild(chip);
        }
        px = cr.left - hr.left; py = cr.top - hr.top;
        grabX = e.clientX - cr.left; grabY = e.clientY - cr.top;
        chip.style.left = px + "px"; chip.style.top = py + "px";
        lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
        vx = 0; vy = 0;
        chip.setPointerCapture(e.pointerId);

        function move(ev) {
          const now = performance.now();
          const dt = Math.max(1, now - lastT);
          vx = ((ev.clientX - lastX) / dt) * 1000;
          vy = ((ev.clientY - lastY) / dt) * 1000;
          lastX = ev.clientX; lastY = ev.clientY; lastT = now;
          const hr2 = hero.getBoundingClientRect();
          px = ev.clientX - hr2.left - grabX;
          py = ev.clientY - hr2.top - grabY;
          chip.style.left = px + "px";
          chip.style.top = py + "px";
        }
        function up() {
          chip.removeEventListener("pointermove", move);
          chip.removeEventListener("pointerup", up);
          chip.removeEventListener("pointercancel", up);
          lastT = performance.now();
          raf = requestAnimationFrame(physics);
        }
        chip.addEventListener("pointermove", move);
        chip.addEventListener("pointerup", up);
        chip.addEventListener("pointercancel", up);
      });
    });
  }

  /* ---------------- click confetti ---------------- */
  if (!reducedMotion) {
    const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const palette = () => [cssVar("--lime"), cssVar("--red"), cssVar("--blue"), "#f2ede4"];
    document.addEventListener("click", (e) => {
      const colors = palette();
      for (let i = 0; i < 6; i++) {
        const c = document.createElement("span");
        c.className = "confetti";
        c.style.left = e.clientX + "px";
        c.style.top = e.clientY + "px";
        c.style.background = colors[i % colors.length];
        document.body.appendChild(c);
        const a = Math.random() * Math.PI * 2;
        const d = 40 + Math.random() * 70;
        c.animate(
          [
            { transform: "translate(-50%,-50%) scale(1) rotate(0deg)", opacity: 1 },
            { transform: `translate(calc(-50% + ${(Math.cos(a) * d).toFixed(0)}px), calc(-50% + ${(Math.sin(a) * d + 26).toFixed(0)}px)) scale(.3) rotate(${(Math.random() * 240 - 120).toFixed(0)}deg)`, opacity: 0 },
          ],
          { duration: 550 + Math.random() * 250, easing: "cubic-bezier(.2,.6,.3,1)" }
        ).onfinish = () => c.remove();
      }
    });
  }

  /* ---------------- global colour-theme switcher ----------------
     Each theme recolours the WHOLE palette — the accent plus every
     section block (work / career / services) — so one tap visibly
     transforms the entire site, not just small highlights.
     Readability contract: --lime & --yellow stay bright (ink text
     sits on them), --blue & --red stay deep (paper text sits on them).
  -------------------------------------------------------------------- */
  const THEMES = [
    { name: "ELECTRIC", lime: "#d9ff3d", blue: "#2c39e8", red: "#ff4524", yellow: "#ffce32" },
    { name: "CANDY",    lime: "#ff8fcf", blue: "#6b3df5", red: "#d6248c", yellow: "#ffd23f" },
    { name: "OCEAN",    lime: "#3fe7c4", blue: "#1538a8", red: "#0f7d8c", yellow: "#ffe06a" },
    { name: "EMBER",    lime: "#ffae3a", blue: "#3b2f8f", red: "#c2381f", yellow: "#ffd98a" },
  ];
  const themeDot = $(".theme-dot");
  const themeName = $("#theme-name");
  let themeIdx = Math.max(0, THEMES.findIndex((t) => t.name === localStorage.getItem("vb-theme")));
  function applyTheme(announce) {
    const t = THEMES[themeIdx];
    const root = document.documentElement.style;
    root.setProperty("--lime", t.lime);
    root.setProperty("--blue", t.blue);
    root.setProperty("--red", t.red);
    root.setProperty("--yellow", t.yellow);
    if (themeDot) themeDot.style.background = t.lime;
    if (themeName) themeName.textContent = t.name;
    localStorage.setItem("vb-theme", t.name);
    if (announce) showToast("🎨 THEME — " + t.name);
  }
  applyTheme(false);
  const themeBtn = $("#theme-btn");
  if (themeBtn) themeBtn.addEventListener("click", () => {
    themeIdx = (themeIdx + 1) % THEMES.length;
    applyTheme(true);
  });

  /* ---------------- toast + konami party mode ---------------- */
  const toast = $("#toast");
  let toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let ki = 0;
  window.addEventListener("keydown", (e) => {
    ki = e.key === KONAMI[ki] ? ki + 1 : (e.key === KONAMI[0] ? 1 : 0);
    if (ki === KONAMI.length) {
      ki = 0;
      document.body.classList.toggle("party");
      showToast(document.body.classList.contains("party") ? "🎉 PARTY MODE ON" : "PARTY MODE OFF");
    }
  });
})();
