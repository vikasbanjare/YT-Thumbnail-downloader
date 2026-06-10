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
  const heroFirst = $("#hero-first");
  heroFirst.innerHTML = firstName.split("").map((c) => `<span class="k">${c}</span>`).join("");
  $("#hero-last").textContent = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
  $("#chip-tagline").textContent = (P.tagline || "Visual Designer").toUpperCase();
  $("#chip-location").textContent = (P.location || "Earth").toUpperCase();
  $("#chip-year").textContent = new Date().getFullYear();

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

  // roles ticker
  const roles = DATA.roles || [];
  const rolesTrack = $("#hero-roles-track");
  [...roles, roles[0]].filter(Boolean).forEach((r) => {
    const s = document.createElement("span");
    s.textContent = r;
    rolesTrack.appendChild(s);
  });
  if (roles.length > 1 && !reducedMotion) {
    let i = 0;
    setInterval(() => {
      i += 1;
      rolesTrack.style.transition = "transform .6s cubic-bezier(.65,0,.15,1)";
      rolesTrack.style.transform = `translateY(-${i * 1.5}em)`;
      if (i === roles.length) {
        setTimeout(() => {
          rolesTrack.style.transition = "none";
          rolesTrack.style.transform = "translateY(0)";
          i = 0;
        }, 620);
      }
    }, 2400);
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
  const projects = DATA.projects || [];
  $("#work-count").textContent = String(projects.length).padStart(2, "0");
  const htrack = $("#htrack");
  projects.forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "hcard";
    card.dataset.index = i;
    card.dataset.cursor = "view";
    card.style.setProperty("--tilt", (i % 2 ? 1.6 : -1.8) + "deg");
    const cover = p.cover
      ? `<div class="hcard-cover" style="background-image:url('${p.cover}')"></div>`
      : `<div class="hcard-cover ph-${i % 6}"><span class="ph-word">${p.category || p.title}</span><span class="ph-note">PASTE BEHANCE IMAGE IN data.js</span></div>`;
    card.innerHTML =
      `<span class="hcard-num">${String(i + 1).padStart(2, "0")}</span>` + cover +
      `<div class="hcard-body"><h3 class="hcard-title">${p.title}</h3><span class="hcard-cat">${p.category || ""}</span></div>`;
    htrack.appendChild(card);
  });
  const endCard = document.createElement("a");
  endCard.className = "hcard-end";
  endCard.href = P.behance || "#";
  endCard.target = "_blank"; endCard.rel = "noopener";
  endCard.dataset.cursor = "hover";
  endCard.innerHTML = `<span>SEE EVERYTHING<br/>ON BEHANCE</span><span class="arr">→</span>`;
  htrack.appendChild(endCard);

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
  if (P.photo) {
    aboutPhoto.style.backgroundImage = `url("${P.photo}")`;
    $("#about-photo-hint").remove();
  }
  const statsWrap = $("#about-stats");
  (DATA.stats || []).forEach((st) => {
    const d = document.createElement("div");
    d.className = "about-stat";
    d.innerHTML = `<span class="v">${st.value}</span><span class="l">${st.label}</span>`;
    statsWrap.appendChild(d);
  });

  /* ---------------- render: services ---------------- */
  const servicesList = $("#services-list");
  (DATA.services || []).forEach((s, i) => {
    const item = document.createElement("div");
    item.className = "service";
    item.innerHTML =
      `<button class="service-head" data-cursor="hover" aria-expanded="false">` +
      `<span class="s-index">${String(i + 1).padStart(2, "0")}</span>` +
      `<span class="s-title">${s.title}</span>` +
      `<span class="s-plus">+</span></button>` +
      `<div class="service-body"><div class="service-body-inner">` +
      `<p class="service-desc">${s.description}</p>` +
      `<div class="service-tags">${(s.tags || []).map((t) => `<span>${t}</span>`).join("")}</div>` +
      `</div></div>`;
    servicesList.appendChild(item);
  });
  servicesList.addEventListener("click", (e) => {
    const head = e.target.closest(".service-head");
    if (!head) return;
    const item = head.parentElement;
    const body = $(".service-body", item);
    const wasOpen = item.classList.contains("open");
    $$(".service.open", servicesList).forEach((o) => {
      o.classList.remove("open");
      $(".service-body", o).style.maxHeight = "0px";
      $(".service-head", o).setAttribute("aria-expanded", "false");
    });
    if (!wasOpen) {
      item.classList.add("open");
      body.style.maxHeight = body.scrollHeight + "px";
      head.setAttribute("aria-expanded", "true");
    }
  });

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
    gsap.from(".kinetic .k", { yPercent: 120, opacity: 0, duration: 0.9, ease: "back.out(1.6)", stagger: 0.06 });
    gsap.from(".hero-row-2", { yPercent: 60, opacity: 0, duration: 1, ease: "power4.out", delay: 0.3 });
    gsap.from(".hero-chips .chip", { y: 30, opacity: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.09, delay: 0.25 });
    gsap.from(".hero-bottom > *", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.1, delay: 0.5 });
    gsap.from(".site-header", { y: -40, opacity: 0, duration: 0.7, delay: 0.6 });
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
      const p = projects[ti % Math.max(projects.length, 1)];
      if (p && p.cover) {
        el.style.backgroundImage = `url('${p.cover}')`;
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

  /* ---------------- pinned horizontal work gallery ---------------- */
  const wrap = $("#htrack-wrap");
  if (hasST && fine && !reducedMotion && window.innerWidth > 900) {
    const amount = () => Math.max(0, htrack.scrollWidth - window.innerWidth + 80);
    gsap.to(htrack, {
      x: () => -amount(),
      ease: "none",
      scrollTrigger: {
        trigger: "#work",
        start: "top top",
        end: () => "+=" + amount(),
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
  } else {
    wrap.classList.add("native");
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
