/* ==========================================================================
   VIKAS BANJARE — portfolio engine
   All content lives in data.js — you should not need to edit this file.
   Built with Lenis (smooth scroll) + GSAP ScrollTrigger, with graceful
   fallbacks when CDNs are unavailable.
   ========================================================================== */

(function () {
  "use strict";

  const DATA = window.PORTFOLIO || {};
  const P = DATA.profile || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = typeof window.gsap !== "undefined";
  const hasLenis = typeof window.Lenis !== "undefined";

  /* ---------------- smooth scroll ---------------- */
  let lenis = null;
  if (hasLenis && !reducedMotion) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (hasGsap && window.ScrollTrigger) {
      lenis.on("scroll", () => window.ScrollTrigger.update());
    }
    // anchor links through lenis
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const target = $(a.getAttribute("href"));
        if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: 0 }); }
      });
    });
  }

  if (hasGsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------- render content ---------------- */
  // hero
  $("#hero-first").textContent = P.firstName || "VIKAS";
  $("#hero-last").textContent = (P.lastName || "Banjare").charAt(0) + (P.lastName || "Banjare").slice(1).toLowerCase();
  $("#hero-tagline").textContent = P.tagline || "";
  $("#hero-location").textContent = P.location || "";
  $("#header-availability").textContent = P.availability ? P.availability.split("&")[0].trim() : "Open for work";

  // personalized greeting — share links like  yoursite.com/portfolio/?for=Nike
  const params = new URLSearchParams(location.search);
  const guest = (params.get("for") || params.get("company") || "").slice(0, 40);
  if (guest) {
    const safe = guest.replace(/[<>&"]/g, "");
    const greeting = $("#hero-greeting");
    greeting.hidden = false;
    greeting.textContent = "Hello " + safe + ", this one's for you —";
    $("#footer-greeting").textContent = "DEAR " + safe.toUpperCase() + ", GOT A PROJECT IN MIND?";
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
    let roleIdx = 0;
    setInterval(() => {
      roleIdx += 1;
      rolesTrack.style.transition = "transform .7s cubic-bezier(.65,0,.15,1)";
      rolesTrack.style.transform = `translateY(-${roleIdx * 1.4}em)`;
      if (roleIdx === roles.length) {
        setTimeout(() => {
          rolesTrack.style.transition = "none";
          rolesTrack.style.transform = "translateY(0)";
          roleIdx = 0;
        }, 720);
      }
    }, 2600);
  }

  // marquee — duplicate items twice for a seamless loop
  const marqueeTrack = $("#marquee-track");
  const words = DATA.marquee || [];
  let marqueeHtml = "";
  for (let i = 0; i < 2; i++) {
    words.forEach((w, j) => {
      marqueeHtml += `<span class="${j % 2 ? "" : "fill"}">${w}</span><span class="dot">✦&nbsp;</span>`;
    });
  }
  marqueeTrack.innerHTML = marqueeHtml;

  // work list
  const projects = DATA.projects || [];
  $("#work-count").textContent = String(projects.length).padStart(2, "0");
  const workList = $("#work-list");
  projects.forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "work-item";
    li.innerHTML =
      `<button class="work-row" data-index="${i}" data-cursor="view">` +
      `<span class="w-index">${String(i + 1).padStart(2, "0")}</span>` +
      `<span class="w-title">${p.title}</span>` +
      `<span class="w-cat">${p.category || ""}</span>` +
      `<span class="w-year">${p.year || ""}</span>` +
      `</button>`;
    workList.appendChild(li);
  });
  $("#behance-cta").href = P.behance || "#";

  // about
  const aboutText = $("#about-text");
  const aboutRaw = P.about || "";
  // words wrapped in *asterisks* become accent serif words
  aboutRaw.split(/\s+/).forEach((word) => {
    const acc = /^\*.*\*[.,!?]?$/.test(word);
    const clean = word.replace(/\*/g, "");
    const s = document.createElement("span");
    s.className = "w" + (acc ? " acc" : "");
    s.textContent = clean + " ";
    aboutText.appendChild(s);
  });
  $("#about-location").textContent = P.location || "";
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

  // services accordion
  const servicesList = $("#services-list");
  (DATA.services || []).forEach((s, i) => {
    const item = document.createElement("div");
    item.className = "service";
    item.innerHTML =
      `<button class="service-head" data-cursor="hover" aria-expanded="false">` +
      `<span class="s-index">${String(i + 1).padStart(2, "0")}</span>` +
      `<span class="s-title">${s.title}</span>` +
      `<span class="s-plus">+</span>` +
      `</button>` +
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
    const isOpen = item.classList.contains("open");
    $$(".service.open", servicesList).forEach((o) => {
      o.classList.remove("open");
      $(".service-body", o).style.maxHeight = "0px";
      $(".service-head", o).setAttribute("aria-expanded", "false");
    });
    if (!isOpen) {
      item.classList.add("open");
      body.style.maxHeight = body.scrollHeight + "px";
      head.setAttribute("aria-expanded", "true");
    }
  });

  // footer / contact
  $("#footer-email").href = "mailto:" + (P.email || "");
  $("#footer-email-text").textContent = P.email || "";
  $("#link-behance").href = P.behance || "#";
  $("#link-linkedin").href = P.linkedin || "#";
  $("#footer-location").textContent = P.location || "";
  $("#footer-year").textContent = new Date().getFullYear();

  // local time (India)
  function tickTime() {
    const t = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
    }).format(new Date());
    $("#local-time").textContent = t + " IST";
    $("#footer-time").textContent = t + " IST";
  }
  tickTime();
  setInterval(tickTime, 30000);

  /* ---------------- preloader ---------------- */
  const preloader = $("#preloader");
  const countEl = $("#preloader-count");
  let progress = 0;
  const loadStart = performance.now();
  const minDuration = reducedMotion ? 200 : 1700;

  const counter = setInterval(() => {
    const elapsed = performance.now() - loadStart;
    progress = Math.min(100, Math.round((elapsed / minDuration) * 100));
    countEl.textContent = progress;
    if (progress >= 100) {
      clearInterval(counter);
      preloader.classList.add("done");
      setTimeout(() => { preloader.remove(); introAnimations(); }, 950);
    }
  }, 30);

  /* ---------------- intro + scroll animations ---------------- */
  function introAnimations() {
    if (!hasGsap || reducedMotion) return;

    gsap.from(".hero-line-inner", {
      yPercent: 110, duration: 1.2, ease: "power4.out", stagger: 0.12,
    });
    gsap.from(".hero-eyebrow, .hero-greeting", {
      y: 24, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.35,
    });
    gsap.from(".hero-bottom > *", {
      y: 30, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, delay: 0.55,
    });
    gsap.from(".site-header", { y: -40, opacity: 0, duration: 0.8, delay: 0.7 });
  }

  if (hasGsap && window.ScrollTrigger && !reducedMotion) {
    // section titles rise in
    $$(".section-title, .section-side").forEach((el) => {
      gsap.from(el, {
        y: 60, opacity: 0, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    });

    // work rows stagger in
    gsap.from(".work-item", {
      y: 50, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.08,
      scrollTrigger: { trigger: ".work-list", start: "top 85%" },
    });

    // about text — words light up as you scroll
    const wordEls = $$("#about-text .w");
    if (wordEls.length) {
      ScrollTrigger.create({
        trigger: "#about-text", start: "top 80%", end: "bottom 45%",
        onUpdate(self) {
          const upto = Math.floor(self.progress * wordEls.length);
          wordEls.forEach((w, i) => w.classList.toggle("lit", i <= upto));
        },
      });
    }

    // about photo parallax
    gsap.fromTo(".about-photo", { yPercent: -6 }, {
      yPercent: 6, ease: "none",
      scrollTrigger: { trigger: ".about-grid", start: "top bottom", end: "bottom top", scrub: true },
    });

    // services rise
    gsap.from(".service", {
      y: 40, opacity: 0, duration: 0.7, ease: "power3.out", stagger: 0.07,
      scrollTrigger: { trigger: ".services-list", start: "top 85%" },
    });

    // footer big lines
    gsap.from(".footer-line", {
      yPercent: 100, duration: 1.1, ease: "power4.out", stagger: 0.12,
      scrollTrigger: { trigger: ".footer", start: "top 70%" },
    });
    gsap.from(".footer-cta, .footer-meta", {
      y: 40, opacity: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
      scrollTrigger: { trigger: ".footer", start: "top 55%" },
    });

    // marquee skews with scroll velocity
    let skewSetter = gsap.quickSetter(".marquee-track", "skewX", "deg");
    let proxy = { skew: 0 };
    ScrollTrigger.create({
      onUpdate(self) {
        const skew = gsap.utils.clamp(-8, 8, self.getVelocity() / -300);
        if (Math.abs(skew) > Math.abs(proxy.skew)) {
          proxy.skew = skew;
          gsap.to(proxy, {
            skew: 0, duration: 0.6, ease: "power3",
            onUpdate: () => skewSetter(proxy.skew),
          });
        }
      },
    });
  }

  /* ---------------- custom cursor ---------------- */
  const dot = $("#cursor-dot");
  const ring = $("#cursor-ring");
  const ringLabel = $("#cursor-label");
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (fine && !reducedMotion) {
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener("mousemove", (e) => { mx = e.clientX; my = e.clientY; });
    (function cursorLoop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(cursorLoop);
    })();

    document.addEventListener("mouseover", (e) => {
      const t = e.target.closest("[data-cursor]");
      ring.classList.remove("hover", "label");
      ringLabel.textContent = "";
      if (!t) return;
      if (t.dataset.cursor === "view") {
        ring.classList.add("label");
        ringLabel.textContent = "VIEW";
      } else {
        ring.classList.add("hover");
      }
    });
  } else {
    dot.remove(); ring.remove();
  }

  /* ---------------- magnetic buttons ---------------- */
  if (fine && !reducedMotion) {
    $$(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform .5s cubic-bezier(.65,0,.15,1)";
        el.style.transform = "translate(0,0)";
        setTimeout(() => (el.style.transition = ""), 500);
      });
    });
  }

  /* ---------------- floating work preview ---------------- */
  const preview = $("#work-preview");
  const previewInner = $("#work-preview-inner");
  if (fine && !reducedMotion) {
    let px = 0, py = 0, tx = 0, ty = 0, ps = 0.85, previewOn = false;
    window.addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
    (function previewLoop() {
      px += (tx - px) * 0.1;
      py += (ty - py) * 0.1;
      ps += ((previewOn ? 1 : 0.85) - ps) * 0.12;
      preview.style.transform = `translate(${px + 30}px, ${py - 120}px) scale(${ps.toFixed(3)})`;
      requestAnimationFrame(previewLoop);
    })();

    workList.addEventListener("mouseover", (e) => {
      const row = e.target.closest(".work-row");
      if (!row) return;
      const p = projects[Number(row.dataset.index)];
      previewInner.className = "work-preview-inner";
      previewInner.innerHTML = "";
      if (p && p.cover) {
        previewInner.style.backgroundImage = `url("${p.cover}")`;
      } else {
        previewInner.style.backgroundImage = "";
        previewInner.classList.add("ph-grad-" + (Number(row.dataset.index) % 6));
        previewInner.innerHTML = `<span class="ph-label">ADD COVER IN data.js</span>`;
      }
      previewOn = true;
      preview.classList.add("on");
    });
    workList.addEventListener("mouseleave", () => {
      previewOn = false;
      preview.classList.remove("on");
    });
  }

  /* ---------------- case view (project overlay) ---------------- */
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
    if (p.behanceProjectId) {
      html += `<div class="embed behance"><iframe src="https://www.behance.net/embed/project/${p.behanceProjectId}?ilo0=1" allowfullscreen loading="lazy" allow="clipboard-write" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
    }
    if (p.videoEmbed) {
      html += `<div class="embed"><iframe src="${p.videoEmbed}" allowfullscreen loading="lazy"></iframe></div>`;
    }
    if (Array.isArray(p.images) && p.images.length) {
      html += p.images.map((src) => `<img src="${src}" alt="${p.title}" loading="lazy"/>`).join("");
    }
    if (!html) {
      html = `<div class="case-empty">No media yet —<br/>paste this project's Behance image URLs, video embed,<br/>or Behance project ID in <b>data.js</b></div>`;
    }
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
    setTimeout(() => {
      caseEl.hidden = true;
      $("#case-media").innerHTML = ""; // stop playing embeds
    }, 700);
    if (lenis) lenis.start();
    document.body.style.overflow = "";
  }

  workList.addEventListener("click", (e) => {
    const row = e.target.closest(".work-row");
    if (row) openCase(Number(row.dataset.index));
  });
  $("#case-close").addEventListener("click", closeCase);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !caseEl.hidden) closeCase();
  });
})();
