/* =========================================================
   Portfolio interactions
   - Hero typewriter (with blinking caret + underline reveal)
   - Staggered, directional reveal-on-scroll
   - Scroll progress bar
   - Theme toggle (persisted) · mobile nav · active section
   ========================================================= */

(function () {
  "use strict";

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bootEl = document.getElementById("boot");
  const runBoot = !!bootEl && !prefersReduced;

  /* ---------- Boot sequence (0 -> 100%) before the hero shows ---------- */
  if (bootEl && !runBoot) {
    bootEl.classList.add("is-done");
  } else if (bootEl) {
    const pctEl = document.getElementById("bootPct");
    const fillEl = document.getElementById("bootFill");
    const DURATION = 4800;
    let t0 = null;
    const step = (ts) => {
      if (t0 === null) t0 = ts;
      const t = Math.min(1, (ts - t0) / DURATION);
      const pct = Math.round(t * 100);
      if (pctEl) pctEl.textContent = pct + "%";
      if (fillEl) fillEl.style.width = pct + "%";
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        bootEl.classList.add("is-done");
        document.getElementById("heroName")?.classList.remove("is-booting");
        window.dispatchEvent(new Event("boot:done"));
      }
    };
    requestAnimationFrame(step);
  }

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const stored = localStorage.getItem("theme");
  if (stored) {
    root.setAttribute("data-theme", stored);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    root.setAttribute("data-theme", "dark");
  }
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ---------- Hero name: letters jump in on load, then scroll-morph center -> left ---------- */
  const heroName = document.getElementById("heroName");
  const introSection = document.getElementById("about");
  const introPortrait = document.getElementById("introPortrait");
  const introPhil = document.getElementById("introPhil");

  if (heroName && !prefersReduced) {
    const text = heroName.textContent;
    heroName.textContent = "";
    let i = 0;
    for (const ch of text) {
      const span = document.createElement("span");
      span.className = "jump";
      if (ch === " ") span.innerHTML = "&nbsp;";
      else span.textContent = ch;
      span.style.animationDelay = (i * 0.06) + "s";
      heroName.appendChild(span);
      i++;
    }
    heroName.insertAdjacentHTML("afterbegin",
      '<span class="introbot" aria-hidden="true">' +
      '<span class="introbot__ant"></span>' +
      '<span class="introbot__eye introbot__eye--l"></span>' +
      '<span class="introbot__eye introbot__eye--r"></span>' +
      '<span class="introbot__head"></span>' +
      '<span class="introbot__body"></span>' +
      '<span class="introbot__arm introbot__arm--l"></span>' +
      '<span class="introbot__arm introbot__arm--r"></span>' +
      '<span class="introbot__leg introbot__leg--l"></span>' +
      '<span class="introbot__leg introbot__leg--r"></span>' +
      '</span>');
    if (runBoot) heroName.classList.add("is-booting");
  }

  if (heroName && introSection && !prefersReduced && window.matchMedia("(min-width: 761px)").matches) {
    let dx = 0, dy = 0, ready = false;
    const SCALE = 1.5;
    const introBot = heroName.querySelector(".introbot");
    const render = () => {
      if (!ready) return;
      const range = window.innerHeight * 0.25;
      let p = -introSection.getBoundingClientRect().top / range;
      p = Math.max(0, Math.min(1, p));
      const inv = 1 - p;
      heroName.style.transform =
        "translate(" + dx * inv + "px," + dy * inv + "px) scale(" + (1 + (SCALE - 1) * inv) + ")";
      if (introPortrait) {
        const f = Math.max(0, Math.min(1, (p - 0.15) / 0.6));
        introPortrait.style.opacity = String(f);
        introPortrait.style.transform = "translateX(" + (1 - f) * 40 + "px)";
      }
      if (introPhil) {
        const g = Math.max(0, Math.min(1, (p - 0.3) / 0.55));
        introPhil.style.opacity = String(g);
        introPhil.style.transform = "translateY(" + (1 - g) * 12 + "px)";
      }
      if (introBot) introBot.style.opacity = String(Math.max(0, 1 - p * 1.6));
    };
    const measure = () => {
      heroName.style.transform = "";
      const r = heroName.getBoundingClientRect();
      dx = window.innerWidth / 2 - (r.left + r.width / 2);
      dy = window.innerHeight / 2 - (r.top + r.height / 2);
      ready = true;
      render();
    };
    window.addEventListener("scroll", render, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    measure();
    setTimeout(measure, 400);
  }

  /* ---------- Hero name: cursor repulsion (letters flee the pointer, "hydrophobic") ---------- */
  if (heroName && !prefersReduced && window.matchMedia("(min-width: 761px) and (pointer: fine)").matches) {
    const letters = Array.from(heroName.querySelectorAll(".jump"));
    if (letters.length) {
      const R = 100;   // influence radius (px)
      const PUSH = 48; // max displacement (px)
      const PADX = 40, PADY = 26; // how far letters may flee before the chassis stops them
      let rests = [];
      let bounds = null;
      let mouse = null;
      let raf = 0;

      const measureRests = () => {
        rests = letters.map((el) => {
          const t = el.style.transform;
          el.style.transform = "none";
          const r = el.getBoundingClientRect();
          el.style.transform = t;
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        });
        const xs = rests.map((r) => r.x), ys = rests.map((r) => r.y);
        bounds = { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
      };
      const apply = () => {
        raf = 0;
        if (!mouse || window.scrollY > 12) {
          letters.forEach((el) => (el.style.transform = ""));
          return;
        }
        letters.forEach((el, i) => {
          const c = rests[i];
          if (!c) return;
          const ddx = c.x - mouse.x;
          const ddy = c.y - mouse.y;
          const dist = Math.hypot(ddx, ddy);
          let ox = 0, oy = 0;
          if (dist < R && dist > 0.01) {
            const m = (PUSH * (1 - dist / R)) / dist;
            ox = ddx * m;
            oy = ddy * m;
          }
          if (bounds) {
            const nx = Math.max(bounds.minX - PADX, Math.min(bounds.maxX + PADX, c.x + ox));
            const ny = Math.max(bounds.minY - PADY, Math.min(bounds.maxY + PADY, c.y + oy));
            ox = nx - c.x;
            oy = ny - c.y;
          }
          el.style.transform = (ox || oy) ? "translate(" + ox + "px," + oy + "px)" : "";
        });
      };
      const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };
      const onMove = (e) => { mouse = { x: e.clientX, y: e.clientY }; queue(); };
      const onLeave = () => { mouse = null; queue(); };

      const enable = () => {
        letters.forEach((el) => { el.style.animation = "none"; el.style.opacity = "1"; });
        measureRests();
        window.addEventListener("mousemove", onMove, { passive: true });
        heroName.addEventListener("mouseleave", onLeave);
        window.addEventListener("resize", measureRests, { passive: true });
        window.addEventListener("scroll", queue, { passive: true });
      };
      // start after the entrance jump-in finishes (which waits for the boot screen)
      const scheduleEnable = () => setTimeout(enable, 900 + letters.length * 60 + 200);
      if (runBoot) window.addEventListener("boot:done", scheduleEnable, { once: true });
      else scheduleEnable();
    }
  }

  /* ---------- Staggered reveal-on-scroll ---------- */
  // Assign incremental delays to children of any [data-stagger] container.
  document.querySelectorAll("[data-stagger]").forEach((group) => {
    group.querySelectorAll(".reveal").forEach((el, i) => {
      if (!el.dataset.delay) el.style.setProperty("--delay", i * 90 + "ms");
    });
  });
  // Honor explicit data-delay attributes.
  document.querySelectorAll(".reveal[data-delay]").forEach((el) => {
    el.style.setProperty("--delay", el.dataset.delay);
  });

  const revealer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealer.observe(el));

  /* ---------- Scroll progress + sticky nav ---------- */
  const nav = document.getElementById("nav");
  const bar = document.getElementById("scrollProgress");
  function onScroll() {
    const y = window.scrollY;
    nav?.classList.toggle("is-scrolled", y > 8);
    if (bar) {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    }
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");
  const closeMenu = () => { navLinks?.classList.remove("is-open"); burger?.setAttribute("aria-expanded", "false"); };
  burger?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  navLinks?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------- Active section highlight ---------- */
  const linkFor = (id) => document.querySelector('.nav__link[href="#' + id + '"]');
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          document.querySelectorAll(".nav__link.is-active").forEach((l) => l.classList.remove("is-active"));
          linkFor(entry.target.id)?.classList.add("is-active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));

  /* ---------- Footer year ---------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Work project accordions (click to expand) ---------- */
  document.querySelectorAll(".index__row").forEach((row) => {
    row.addEventListener("click", () => {
      const panel = document.getElementById(row.getAttribute("aria-controls"));
      const open = row.getAttribute("aria-expanded") === "true";
      row.setAttribute("aria-expanded", String(!open));
      panel?.classList.toggle("is-open", !open);
    });
  });

  /* ---------- Project "see more" (concise <-> full) ---------- */
  document.querySelectorAll(".project__toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const body = btn.closest(".project__body");
      if (!body) return;
      const short = body.querySelector(".project__short");
      const long = body.querySelector(".project__long");
      const willOpen = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(willOpen));
      if (long) long.hidden = !willOpen;
      if (short) short.hidden = willOpen;
      btn.textContent = willOpen ? "See less" : "See more";
    });
  });

  /* ---------- Collage lightbox (click to zoom) ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxCaption = document.getElementById("lightboxCaption");
  if (lightbox && lightboxImg) {
    const openLightbox = (img) => {
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.alt || "";
      const cap = img.getAttribute("data-caption") || img.alt || "";
      if (lightboxCaption) {
        lightboxCaption.textContent = cap;
        lightboxCaption.style.display = cap ? "" : "none";
      }
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };
    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      lightboxImg.src = "";
    };
    document.querySelectorAll(".collage__item img").forEach((img) => {
      img.addEventListener("click", () => openLightbox(img));
    });
    // Click anywhere except the image or its caption (backdrop / close) closes it.
    lightbox.addEventListener("click", (e) => {
      if (e.target !== lightboxImg && e.target !== lightboxCaption) closeLightbox();
    });
    lightboxClose?.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }
})();
