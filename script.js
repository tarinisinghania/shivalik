/* ==========================================================
   MOBILE NAV — burger toggle
========================================================== */

(() => {
    const burger  = document.getElementById("navBurger");
    const overlay = document.getElementById("navOverlay");
    if (!burger || !overlay) return;

    const setOpen = (open) => {
        burger.classList.toggle("open", open);
        overlay.classList.toggle("open", open);
        document.body.classList.toggle("nav-locked", open);
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    burger.addEventListener("click", () =>
        setOpen(!overlay.classList.contains("open"))
    );

    /* close when a link is tapped */
    overlay.querySelectorAll("a").forEach(a =>
        a.addEventListener("click", () => setOpen(false))
    );

    /* close on Escape */
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") setOpen(false);
    });
})();

if (window.gsap){
    gsap.fromTo(".values-plate",
        { opacity:0, y:40 },
        { opacity:1, y:0, duration:.8, ease:"power3.out",
          scrollTrigger:{ trigger:".values", start:"top 75%" } }
    );
}
/* ==========================================
   NAVBAR ACTIVE LINK (per page)
========================================== */

(() => {

    const normalise = (path) => {
        let file = path.split("?")[0].split("#")[0];
        file = file.split("/").filter(Boolean).pop() || "index.html";
        return file.replace(/\.html?$/i, "").toLowerCase();
    };

    const current = normalise(location.pathname);

    document.querySelectorAll(".navbar nav a").forEach(link => {
        const href = link.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("http")) return;
        if (normalise(href) === current) link.classList.add("active");
    });

})();

const video = document.getElementById("heroVideo");

video?.addEventListener("loadeddata", () => {
    video.classList.add("loaded");
});

gsap.registerPlugin(ScrollTrigger);

gsap.registerProperty?.({
    name: "--reveal",
    syntax: "<percentage>",
    initialValue: "0%",
    inherits: true
});

gsap.to(".hero-content", {
    y: -120,
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
});

gsap.to(".hero video", {
    scale: 1.15,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
});

/* ==========================================
   ODOMETER COUNTERS
========================================== */

document.querySelectorAll(".counter").forEach(counter => {

    const target = Number(counter.dataset.target);
    const suffix = counter.dataset.suffix || "";
    const useComma = counter.dataset.format === "comma";

    /* final display string, e.g. "1,11,600" (en-IN) */
    const finalStr = (useComma ? target.toLocaleString("en-IN") : String(target)) + suffix;

    /* build a digit-column or a static glyph for each character */
    counter.textContent = "";
    const strips = [];   // { el, digit }

    [...finalStr].forEach(ch => {

        if (/\d/.test(ch)){
            const digit = document.createElement("span");
            digit.className = "odo-digit";

            const strip = document.createElement("span");
            strip.className = "odo-strip";
            for (let n = 0; n <= 9; n++){
                const s = document.createElement("span");
                s.textContent = n;
                strip.appendChild(s);
            }
            digit.appendChild(strip);
            counter.appendChild(digit);
            strips.push({ strip, value: Number(ch) });
       } else {
            const st = document.createElement("span");
            st.className = "odo-static" + (ch === "+" ? " odo-plus" : "");
            st.textContent = ch;
            counter.appendChild(st);
        }
    });

    /* start every strip showing 0 */
    strips.forEach(({ strip }) => gsap.set(strip, { yPercent: 0 }));

    const roll = (playing) => {
        strips.forEach(({ strip, value }, i) => {
            gsap.to(strip, {
                /* each digit is 1em tall → move up value*10% of the strip's height */
                yPercent: playing ? -value * 10 : 0,
                duration: playing ? 1.4 : 0.6,
                ease: playing ? "power3.out" : "power2.inOut",
                delay: playing ? i * 0.08 : 0    /* left-to-right cascade */
            });
        });
    };

    ScrollTrigger.create({
        trigger: counter,
        start: "top 85%",
        onEnter:     () => roll(true),
        onLeaveBack: () => roll(false)
    });

});

/* ==========================================
   WHY — STICKY-SCROLL ACTIVE ITEM TRACKING
========================================== */

const whyItems = Array.from(document.querySelectorAll('.why-item'));
const whyCount = document.getElementById('whyCount');
const whyBar   = document.getElementById('whyBar');

if (whyItems.length){

    let currentIdx = -1;

    const setActive = (idx) => {
        if (idx === currentIdx) return;
        currentIdx = idx;
        whyItems.forEach(el => el.classList.remove('active'));
        whyItems[idx].classList.add('active');
        if (whyCount) whyCount.textContent = String(idx + 1).padStart(2, '0');
        if (whyBar)   whyBar.style.width = ((idx + 1) / whyItems.length * 100) + '%';
    };

    window.addEventListener('resize', () => { currentIdx = -1; });

    const wio2 = new IntersectionObserver(() => {
        const line = window.innerHeight * 0.5;
        let idx = 0;
        whyItems.forEach((el, i) => {
            if (el.getBoundingClientRect().top <= line) idx = i;
        });
        setActive(idx);
    }, { threshold: 0, rootMargin: '-40% 0px -40% 0px' });

    whyItems.forEach(el => wio2.observe(el));
}

/* ==========================================
   HERO → EXPLORE SCROLL (custom eased)
========================================== */

const exploreBtn = document.getElementById("exploreBtn");
const mainSection = document.getElementById("main");

function easeOutQuint(t){ return 1 - Math.pow(1 - t, 5); }

function smoothScrollTo(targetY, duration = 600){

    const startY = window.pageYOffset;
    const distance = targetY - startY;
    const startTime = performance.now();

    let cancelled = false;
    const cancel = () => { cancelled = true; };
    window.addEventListener("wheel", cancel, { passive: true, once: true });
    window.addEventListener("touchstart", cancel, { passive: true, once: true });

    function step(now){
        if (cancelled) return;
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        window.scrollTo(0, startY + distance * easeOutQuint(t));
        if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
}

exploreBtn?.addEventListener("click", e => {
    e.preventDefault();
    if (!mainSection) return;
    const y = mainSection.getBoundingClientRect().top + window.pageYOffset;
    smoothScrollTo(y);
});

/* ==========================================
   PRODUCT HOVER IMAGES — preload + refresh
========================================== */

document.querySelectorAll(".pc-media img").forEach(img => {
    if (img.complete) return;
    img.addEventListener("load",  () => ScrollTrigger.refresh());
    img.addEventListener("error", () => ScrollTrigger.refresh());
});

document.querySelectorAll(".pc-alt").forEach(img => {
    const pre = new Image();
    pre.src = img.src;
});

/* ==========================================
   HERO IMAGE (inner pages)
========================================== */

const heroImg = document.querySelector(".hero-img");

if (heroImg){

    if (heroImg.complete) heroImg.classList.add("loaded");
    else heroImg.addEventListener("load", () => heroImg.classList.add("loaded"));

    gsap.to(heroImg, {
        scale: 1.15,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
    });
}

/* ---- also fixed the smoothScrollTo cap: 0.7 → 1 ---- */

/* ==========================================
   ILLUMINATE — gradient sweep (light → dark)
========================================== */

function illuminate(el, { start = "top 78%", end = "bottom 60%" } = {}){

    if (!el) return;

    el.classList.add("illuminate");

    gsap.to(el, {
        "--reveal": "100%",
        ease: "none",
        scrollTrigger: { trigger: el, start, end, scrub: true }
    });
}

illuminate(document.querySelector(".about-copy p"));


/* ==========================================
   PRODUCT CARDS — illuminate on enter (staggered)
========================================== */

gsap.registerProperty?.({
    name: "--lit", syntax: "<number>", initialValue: "0", inherits: false
});

gsap.utils.toArray(".product-card").forEach((card, i) => {

    gsap.fromTo(card,
        { "--lit": 0 },
        {
            "--lit": 1,
            ease: "none",
            scrollTrigger: {
                trigger: card,
                start: "top 90%",
                end: "top 55%",
                scrub: true
            }
        }
    );
});

gsap.fromTo(".product-card",
    { "--lit": 0 },
    {
        "--lit": 1,
        ease: "none",
        stagger: 0.15,
        scrollTrigger: {
            trigger: ".product-grid",
            start: "top 80%",
            end: "top 40%",
            scrub: true
        }
    }
);

/* ==========================================
   STAT DIVIDER LINES — grow from 0
========================================== */

gsap.registerProperty?.({
    name: "--line", syntax: "<number>", initialValue: "0", inherits: false
});

gsap.utils.toArray(".stat").forEach((stat, i) => {

    /* last stat has no divider — skip it */
    if (stat === stat.parentElement.lastElementChild) return;

        gsap.fromTo(stat,
            { "--line": 0 },
            {
                "--line": 1,
                ease: "none",
                scrollTrigger: {
                    trigger: ".stats",
                    start: "top 85%",
                    end: "top 55%",
                    scrub: true
                }
            }
        );
});

document.querySelectorAll(".cert-logo img").forEach(img => {
    if (img.complete) return;
    img.addEventListener("load",  () => ScrollTrigger.refresh());
    img.addEventListener("error", () => ScrollTrigger.refresh());
});

/* ==========================================
   BACK TO TOP
========================================== */

document.querySelector(".to-top")?.addEventListener("click", e => {
    e.preventDefault();
    smoothScrollTo(0);
});

window.addEventListener("load", () => ScrollTrigger.refresh());

/* ==========================================
   INTRO COPY — illuminate both paragraphs as one sweep
========================================== */

(() => {
    const copy = document.querySelector(".intro-copy");
    if (!copy) return;

    const paras = [...copy.querySelectorAll("p")];
    paras.forEach(p => p.classList.add("illuminate"));

    const state = { reveal: 0 };

    gsap.to(state, {
        reveal: 100,
        ease: "none",
        scrollTrigger: {
            trigger: copy,
            start: "top 75%",
            end: "bottom 70%",
            scrub: true
        },
        onUpdate: () => {
            const v = state.reveal + "%";
            paras.forEach(p => p.style.setProperty("--reveal", v));
        }
    });
})();

/* ==========================================================
   CONTACT PAGE — form handling + reveals
   script.js already runs first (navbar active, hero image,
   back-to-top, GSAP registration). This only adds page-specifics.
========================================================== */

(() => {
    const track = document.querySelector(".cm-lined-track span");
    const lined = document.querySelector(".cm-lined");
    if (!track || !lined || !window.gsap) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.to(track, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
            trigger: lined,
            start: "top 75%",
            end: "bottom 80%",
            scrub: true
        }
    });
})();

/* ---------- Gradient illuminate sweep on text ---------- */

if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches){

    gsap.registerPlugin(ScrollTrigger);

    gsap.registerProperty?.({
        name: "--reveal", syntax: "<percentage>", initialValue: "0%", inherits: false
    });

    /* single-element gradient sweep, same mechanism as the story page */
    const illuminate = (el, { start = "top 82%", end = "bottom 62%" } = {}) => {
        if (!el) return;
        el.classList.add("illuminate");
        gsap.to(el, {
            "--reveal": "100%",
            ease: "none",
            scrollTrigger: { trigger: el, start, end, scrub: true }
        });
    };

    /* left-column headline + blurb light up as you scroll */
    // illuminate(document.querySelector(".cm-headline"), { start: "top 85%", end: "bottom 65%" });
    illuminate(document.querySelector(".cm-blurb"),    { start: "top 88%", end: "bottom 72%" });
}

/* ==========================================================
   MANUFACTURING PAGE — reveals
   script.js runs first (navbar active, hero image, back-to-top).
========================================================== */

if (window.gsap){
    gsap.registerPlugin(ScrollTrigger);

    gsap.registerProperty?.({
        name: "--reveal", syntax: "<percentage>", initialValue: "0%", inherits: false
    });

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches
             || matchMedia("(max-width: 768px)").matches;

    /* ---- intro paragraph illuminates as one sweep ---- */
    if (!reduce){
        const p = document.querySelector(".mfg-intro-grid .intro-copy p");
        if (p){
            p.classList.add("illuminate");
            gsap.to(p, {
                "--reveal": "100%",
                ease: "none",
                scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 62%", scrub: true }
            });
        }
    }

    /* ---- timeline spine draws + rows fade in ---- */
    if (!reduce){
        gsap.registerProperty?.({
            name: "--spine", syntax: "<number>", initialValue: "1", inherits: false
        });

        const timeline = document.querySelector(".unit-timeline");
        if (timeline){
            gsap.fromTo(timeline,
                { "--spine": 0 },
                {
                    "--spine": 1, ease: "none",
                    scrollTrigger: { trigger: timeline, start: "top 78%", end: "bottom 70%", scrub: true }
                }
            );
        }

        gsap.utils.toArray(".unit-row").forEach(row => {
            gsap.fromTo(row,
                { opacity: 0, x: 20 },
                {
                    opacity: 1, x: 0, ease: "power3.out", duration: .7,
                    scrollTrigger: { trigger: row, start: "top 85%", toggleActions: "play none none reverse" }
                }
            );
        });
    }

//* ---- roadmap: pinned horizontal scroll + arrows ---- */
    const track = document.querySelector(".road-track");
    const viewport = document.querySelector(".road-viewport");
    const roadmap = document.querySelector(".roadmap");
    const progress = document.querySelector(".road-progress span");
    const prevBtn = document.getElementById("roadPrev");
    const nextBtn = document.getElementById("roadNext");

    /* background image crossfade */
    const bgImgs = Array.from(document.querySelectorAll(".road-bg-img"));

    /* stacked crossfade: image i fades in over image i-1.
    never leaves a gap, so the plate is never see-through. */
    function paintBg(p){
        if (bgImgs.length < 2) return;
        const pos = p * (bgImgs.length - 1);
        for (let i = 1; i < bgImgs.length; i++){
            const o = Math.min(Math.max(pos - (i - 1), 0), 1);
            bgImgs[i].style.opacity = o;
        }
    }
    paintBg(0);

    /* decode up front so the first fade isn't a stutter */
    bgImgs.forEach(img => img.decode?.().catch(() => {}));

    if (track && viewport && roadmap){

        if (reduce){
            roadmap.classList.add("no-pin");
            document.querySelector(".road-nav")?.remove();
        } else {
            const cards = Array.from(track.children);
            const getDist = () => track.scrollWidth - viewport.clientWidth;

            let st;
            let index = 0;

            const cardProgress = (i) => {
                const dist = getDist();
                if (dist <= 0) return 0;
                const offset = cards[i].offsetLeft - cards[0].offsetLeft;
                return Math.min(offset / dist, 1);
            };

            const nearestIndex = (p) => {
                let best = 0, bestDelta = Infinity;
                cards.forEach((_, i) => {
                    const d = Math.abs(cardProgress(i) - p);
                    if (d < bestDelta){ bestDelta = d; best = i; }
                });
                return best;
            };

            const syncButtons = () => {
                if (!prevBtn || !nextBtn) return;
                prevBtn.disabled = index <= 0;
                nextBtn.disabled = index >= cards.length - 1;
            };

            const goTo = (i) => {
                if (!st) return;
                index = Math.max(0, Math.min(i, cards.length - 1));
                const y = st.start + cardProgress(index) * (st.end - st.start);
                window.scrollTo({ top:y, behavior:"smooth" });
            };

            gsap.to(track, {
                x: () => -getDist(),
                ease: "none",
                scrollTrigger: {
                    trigger: roadmap,
                    start: "top top",
                    end: () => "+=" + getDist(),
                    pin: true,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    anticipatePin: 1,
                    onRefresh: self => { st = self; syncButtons(); },
                    onUpdate: self => {
                        st = self;
                        if (progress) progress.style.width = (self.progress * 100) + "%";
                        paintBg(self.progress);                    // ← continuous, every frame
                        const i = nearestIndex(self.progress);
                        if (i !== index){
                            index = i;
                            syncButtons();                          // buttons still step, that's fine
                        }
                    }
                }
            });

            prevBtn?.addEventListener("click", () => goTo(index - 1));
            nextBtn?.addEventListener("click", () => goTo(index + 1));
        }
    }

    ScrollTrigger.refresh();
}

if (window.gsap){
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(".value-card",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, ease: "power3.out", duration: .7, stagger: .1,
          scrollTrigger: { trigger: ".values-grid", start: "top 80%" } }
    );
}
if (window.gsap){
    gsap.fromTo(".mission-point",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, ease: "power3.out", duration: .7, stagger: .12,
          scrollTrigger: { trigger: ".mission-grid", start: "top 82%" } }
    );
}

if (window.gsap){
    gsap.registerPlugin(ScrollTrigger);

    gsap.registerProperty?.({
        name: "--bar", syntax: "<number>", initialValue: "0", inherits: false
    });

    gsap.utils.toArray(".mission-point").forEach((point, i) => {
        gsap.fromTo(point,
            { "--bar": 0 },
            {
                "--bar": 1,
                ease: "power3.out",
                duration: 0.9,
                delay: i * 0.15,
                scrollTrigger: {
                    trigger: ".mission-grid",
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
}
/* ---- closing CTA reveal ---- */
if (!matchMedia("(prefers-reduced-motion: reduce)").matches){
    gsap.fromTo(".cta-plate",
        { y: 60, opacity: 0 },
        {
            y: 0, opacity: 1, ease: "power3.out", duration: 1,
            scrollTrigger: { trigger: ".cta", start: "top 82%", toggleActions: "play none none reverse" }
        }
    );

    /* inner content staggers up just after the plate */
    gsap.fromTo(".cta-plate",
    { y: 60, opacity: 0, scale: 0.96 },
    { y: 0, opacity: 1, scale: 1, ease: "power3.out", duration: 1,
      scrollTrigger: { trigger: ".cta", start: "top 82%", toggleActions: "play none none reverse" } }
    );
}

/* ==========================================================
   PRODUCTS PAGE — industry tab switching
========================================================== */


/* ---- product cards fade in on load / tab switch ---- */
if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    gsap.registerPlugin(ScrollTrigger);

    const revealGrid = () => {
        const active = document.querySelector(".prod-panel.active .prod-grid");
        if (!active) return;
        gsap.fromTo(active.querySelectorAll(".prod-item"),
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, ease: "power3.out", duration: .6, stagger: .06, overwrite: true }
        );
    };

    revealGrid();
    document.querySelectorAll(".prod-tab-label").forEach(t =>
    t.addEventListener("click", () => setTimeout(revealGrid, 20))
    );
}
/* ==========================================================
   SUB-NAV CONDENSE ON SCROLL
========================================================== */


(() => {
    const imgs = Array.from(document.querySelectorAll(".prod-tab-img"));
    const labels = Array.from(document.querySelectorAll(".prod-tab-label"));
    const panels = Array.from(document.querySelectorAll(".prod-panel"));
    const all = [...imgs, ...labels];
    if (!all.length) return;

    const activate = (name) => {
        imgs.forEach(t => t.classList.toggle("active", t.dataset.panel === name));
        labels.forEach(t => t.classList.toggle("active", t.dataset.panel === name));
        panels.forEach(p => {
            const on = p.id === "panel-" + name;
            p.classList.toggle("active", on);
            p.hidden = !on;
        });

        if (window.ScrollTrigger) ScrollTrigger.refresh();

        /* scroll to the top of the products section so the new panel starts fresh */
        requestAnimationFrame(() => {
            const anchor = document.querySelector(".prod-head") || document.querySelector(".prod");
            if (!anchor) return;
            const y = anchor.getBoundingClientRect().top + window.pageYOffset - 120;
            window.scrollTo({ top: y, behavior: "smooth" });
        });
    };

    all.forEach(el => el.addEventListener("click", () => activate(el.dataset.panel)));
})();


/* ==========================================================
   TRANSFORMATION PAGE — pillar tab switching
========================================================== */

(() => {
    const tabs = Array.from(document.querySelectorAll(".trans-tab"));
    const panels = Array.from(document.querySelectorAll(".trans-panel"));
    if (!tabs.length) return;

    const activate = (name) => {
        tabs.forEach(t => {
            const on = t.dataset.panel === name;
            t.classList.toggle("active", on);
            t.setAttribute("aria-selected", on ? "true" : "false");
        });
        panels.forEach(p => {
            const on = p.id === "panel-" + name;
            p.classList.toggle("active", on);
            p.hidden = !on;
        });

        /* reveal the new panel's content immediately (triggers won't re-fire) */
        const active = document.getElementById("panel-" + name);
        if (active && window.gsap){
            const items = active.querySelectorAll(
                ".human-card .hc-media, .human-card .hc-copy, .tech-erp, .tech-item, .tech-safety, .sus-feature, .sus-point, .reveal-card"
            );
            gsap.set(items, { opacity:1, x:0, y:0 });
        }

        if (window.ScrollTrigger) ScrollTrigger.refresh();

        /* scroll after layout has updated to the new panel height */
        requestAnimationFrame(() => {
            const anchor = document.querySelector(".trans-head") || document.querySelector(".trans");
            if (!anchor) return;
            const y = anchor.getBoundingClientRect().top + window.pageYOffset - 120;
            window.scrollTo({ top:y, behavior:"smooth" });
        });
    };

    
    tabs.forEach(tab => {
        tab.addEventListener("click", () => activate(tab.dataset.panel));

        /* keyboard arrows move between tabs */
        tab.addEventListener("keydown", e => {
            const i = tabs.indexOf(tab);
            if (e.key === "ArrowRight" && i < tabs.length - 1){
                tabs[i + 1].focus(); activate(tabs[i + 1].dataset.panel);
            } else if (e.key === "ArrowLeft" && i > 0){
                tabs[i - 1].focus(); activate(tabs[i - 1].dataset.panel);
            }
        });
    });

    /* open a pillar from the URL hash, e.g. transformation.html#human */
    const hash = location.hash.replace("#", "");
    if (hash && document.getElementById("panel-" + hash)){
        activate(hash);
    }
})();

/* ==========================================================
   HUMAN CARDS — scroll reveal (image + text slide in)
========================================================== */

if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".human-card").forEach(card => {
        const media = card.querySelector(".hc-media");
        const copy  = card.querySelector(".hc-copy");

        gsap.to([media, copy], {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
                trigger: card,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });
    });
}
/* ==========================================================
   TECHNOLOGY panel — scroll reveals
========================================================== */

if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    gsap.registerPlugin(ScrollTrigger);

    /* SAP block */
    gsap.to(".tech-erp", {
        opacity:1, y:0, duration:.9, ease:"power3.out",
        scrollTrigger:{ trigger:".tech-erp", start:"top 80%", toggleActions:"play none none reverse" }
    });

    /* each trio, staggered */
    gsap.utils.toArray(".tech-trio").forEach(trio => {
        gsap.to(trio.querySelectorAll(".tech-item"), {
            opacity:1, y:0, duration:.7, ease:"power3.out", stagger:.12,
            scrollTrigger:{ trigger:trio, start:"top 82%", toggleActions:"play none none reverse" }
        });
    });

    /* Health & Safety block */
    gsap.to(".tech-safety", {
        opacity:1, y:0, duration:.9, ease:"power3.out",
        scrollTrigger:{ trigger:".tech-safety", start:"top 80%", toggleActions:"play none none reverse" }
    });
}
/* SUSTAINABILITY reveals */
if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    gsap.utils.toArray(".sus-feature").forEach(f => {
        gsap.to(f, { opacity:1, y:0, duration:.9, ease:"power3.out",
            scrollTrigger:{ trigger:f, start:"top 82%", toggleActions:"play none none reverse" } });
    });
    gsap.utils.toArray(".sus-grid-4").forEach(grid => {
        gsap.to(grid.querySelectorAll(".sus-point"), {
            opacity:1, y:0, duration:.6, ease:"power3.out", stagger:.1,
            scrollTrigger:{ trigger:grid, start:"top 82%", toggleActions:"play none none reverse" } });
    });
}

/* ==========================================================
   CAREERS PAGE — CV upload + form handling
========================================================== */

(() => {
    const form   = document.getElementById("careersForm");
    if (!form) return;

    const fileInput = document.getElementById("cr-cv");
    const dropZone  = document.getElementById("crUploadLabel");
    const uploadTxt = document.getElementById("crUploadText");
    const status    = document.getElementById("crStatus");

    const MAX_BYTES = 5 * 1024 * 1024;               // 5 MB
    const ALLOWED = [".pdf", ".doc", ".docx"];

    /* ---- reflect the chosen file in the drop zone ---- */
    const showFile = (file) => {
        if (!file) return;

        const ext = "." + file.name.split(".").pop().toLowerCase();
        if (!ALLOWED.includes(ext)){
            status.textContent = "Please upload a PDF, DOC or DOCX file.";
            status.classList.add("error");
            fileInput.value = "";
            return;
        }
        if (file.size > MAX_BYTES){
            status.textContent = "That file is over 5 MB. Please upload a smaller version.";
            status.classList.add("error");
            fileInput.value = "";
            return;
        }

        status.textContent = "";
        status.classList.remove("error");
        dropZone.classList.add("has-file");
        const kb = (file.size / 1024).toFixed(0);
        uploadTxt.innerHTML =
            `<strong>${file.name}</strong><br><small>${kb} KB — click to replace</small>`;
    };

    fileInput.addEventListener("change", () => showFile(fileInput.files[0]));

    /* ---- drag & drop ---- */
    ["dragenter", "dragover"].forEach(ev =>
        dropZone.addEventListener(ev, e => {
            e.preventDefault();
            dropZone.classList.add("dragover");
        })
    );
    ["dragleave", "drop"].forEach(ev =>
        dropZone.addEventListener(ev, e => {
            e.preventDefault();
            dropZone.classList.remove("dragover");
        })
    );
    dropZone.addEventListener("drop", e => {
        const file = e.dataTransfer.files[0];
        if (file){
            fileInput.files = e.dataTransfer.files;   // assign to the input
            showFile(file);
        }
    });

    /* ---- submit ---- */
    form.addEventListener("submit", e => {
        e.preventDefault();

        if (!form.checkValidity()){
            status.textContent = "Please complete the required fields and attach your CV.";
            status.classList.add("error");
            form.reportValidity();
            return;
        }
        if (!fileInput.files.length){
            status.textContent = "Please attach your CV before submitting.";
            status.classList.add("error");
            return;
        }

        status.classList.remove("error");
        const btn = form.querySelector(".cf-submit");
        btn.disabled = true;
        status.textContent = "Submitting…";

        /* ---- NO BACKEND WIRED YET ----
           A file upload needs a server endpoint or a form service that
           accepts attachments (e.g. Formspree, Web3Forms, or your own API).
           Replace this block with a real fetch() using FormData:

               const data = new FormData(form);
               const res = await fetch("YOUR_ENDPOINT", { method:"POST", body:data });

           For now it simulates success so the flow is complete.        */
        console.log("Application:", Object.fromEntries(new FormData(form).entries()));

        setTimeout(() => {
            status.textContent = "Thank you — your application has been received. Our HR team will be in touch.";
            form.reset();
            dropZone.classList.remove("has-file");
            uploadTxt.innerHTML =
                `<strong>Click to upload</strong> or drag &amp; drop<br><small>PDF, DOC or DOCX — max 5&nbsp;MB</small>`;
            btn.disabled = false;
        }, 800);
    });
})();

/* ==========================================================
   CONTACT MODAL
========================================================== */

(() => {
    const modal = document.getElementById("contactModal");
    if (!modal) return;

    const open = () => {
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    };
    const close = () => {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
    };

    /* any element with .js-open-contact opens the modal */
    document.querySelectorAll(".js-open-contact").forEach(btn =>
        btn.addEventListener("click", e => { e.preventDefault(); open(); })
    );

    modal.querySelectorAll("[data-close]").forEach(el =>
        el.addEventListener("click", close)
    );
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && modal.classList.contains("open")) close();
    });

    /* form submit (unchanged fake-success flow) */
    const form   = document.getElementById("contactFormModal");
    const status = document.getElementById("modalStatus");
    form?.addEventListener("submit", e => {
        e.preventDefault();
        if (!form.checkValidity()){
            status.textContent = "Please fill in the required fields.";
            status.classList.add("error");
            form.reportValidity();
            return;
        }
        status.classList.remove("error");
        const btn = form.querySelector(".cf-submit");
        btn.disabled = true;
        status.textContent = "Sending…";
        console.log("Enquiry:", Object.fromEntries(new FormData(form).entries()));
        setTimeout(() => {
            status.textContent = "Thanks — we'll reply within two working days.";
            form.reset();
            btn.disabled = false;
            setTimeout(close, 1500);
        }, 700);
    });
})();
/* ==========================================================
   SCROLL TO HASH TARGET ON LOAD (for Learn more deep-links)
========================================================== */

(() => {
    const hash = location.hash;
    if (!hash || hash.length < 2) return;

    /* on the transformation page the hash is a pillar name (#technology,
       #human, #sustainability) → scroll to that panel. Elsewhere the hash
       is a section id (#units, #products, #intro). */
    const isTransformation = /transformation/i.test(location.pathname);

    const target = isTransformation
        ? document.getElementById("panel-" + hash.replace("#", ""))
        : document.querySelector(hash);

    if (!target) return;

    const scrollToTarget = () => {
        const y = target.getBoundingClientRect().top + window.pageYOffset - 120; // clear navbar
        window.scrollTo({ top:y, behavior:"smooth" });
    };

    /* wait for full layout, then scroll (delay lets the browser's native
       hash jump + any tab activation finish first) */
    const run = () => requestAnimationFrame(() =>
        requestAnimationFrame(() => setTimeout(scrollToTarget, 80))
    );

    if (document.readyState === "complete"){
        run();
    } else {
        window.addEventListener("load", run);
    }
})();

if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches){
    gsap.utils.toArray(".mgmt-row").forEach(row => {
        gsap.fromTo(row,
            { opacity:0, y:30 },
            { opacity:1, y:0, duration:.8, ease:"power3.out",
              scrollTrigger:{ trigger:row, start:"top 85%", toggleActions:"play none none reverse" } }
        );
    });
}
/* ---- our story timeline: spine draws + rows fade in ---- */
if (window.gsap && !matchMedia("(prefers-reduced-motion: reduce)").matches){

    gsap.registerProperty?.({
        name: "--spine", syntax: "<number>", initialValue: "1", inherits: false
    });

    const storyLine = document.querySelector(".story-timeline");
    if (storyLine){
        gsap.fromTo(storyLine,
            { "--spine": 0 },
            { "--spine": 1, ease:"none",
              scrollTrigger:{ trigger:storyLine, start:"top 78%", end:"bottom 70%", scrub:true } }
        );

        gsap.utils.toArray(".story-row").forEach(row => {
            gsap.fromTo(row,
                { opacity:0, x:20 },
                { opacity:1, x:0, ease:"power3.out", duration:.7,
                  scrollTrigger:{ trigger:row, start:"top 85%", toggleActions:"play none none reverse" } }
            );
        });
    }
}

/* ---- our story timeline: spine draws + rows fade in ---- */
/* ==========================================================
   ROADMAP CARDS — "Learn more" expand/collapse
========================================================== */
document.querySelectorAll(".road-more").forEach(btn => {
    btn.addEventListener("click", () => {
        const card = btn.closest(".road-card");
        const isOpen = card.classList.contains("is-open");
        openDetail(card, !isOpen);
    });
});

document.querySelectorAll(".road-detail-close").forEach(btn => {
    btn.addEventListener("click", () => {
        const card = btn.closest(".road-card");
        openDetail(card, false);
    });
});

function openDetail(card, open){
    const toggleBtn = card.querySelector(".road-more");
    const detail = card.querySelector(".road-detail");

    card.classList.toggle("is-open", open);
    toggleBtn.setAttribute("aria-expanded", open ? "true" : "false");
    toggleBtn.querySelector(".road-more-label").textContent = open ? "Show less" : "Learn more";

    if (!open) detail.scrollTop = 0;
}

/* ==========================================================
   BROCHURE MODAL — gate the PDF behind the lead form
========================================================== */

(() => {
    const modal = document.getElementById("brochureModal");
    if (!modal) return;

    const open = () => {
        modal.classList.add("open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    };
    const close = () => {
        modal.classList.remove("open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
    };

    /* any element with .js-open-brochure opens this modal */
    document.querySelectorAll(".js-open-brochure").forEach(btn =>
        btn.addEventListener("click", e => { e.preventDefault(); open(); })
    );

    modal.querySelectorAll("[data-close]").forEach(el =>
        el.addEventListener("click", close)
    );
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && modal.classList.contains("open")) close();
    });

    const form = document.getElementById("brochureForm");
    const status = document.getElementById("brochureStatus");

    form?.addEventListener("submit", e => {
        e.preventDefault();

        if (!form.checkValidity()){
            status.textContent = "Please fill in the required fields.";
            status.classList.add("error");
            form.reportValidity();
            return;
        }

        status.classList.remove("error");
        const btn = form.querySelector(".cf-submit");
        btn.disabled = true;
        status.textContent = "Preparing your download...";

        /* ---- NO BACKEND WIRED YET ----
           Replace this with a real fetch() to log/store the lead
           (Formspree, Web3Forms, your own API, etc.) before triggering
           the download. For now it simulates the lead capture. */
        console.log("Brochure request:", Object.fromEntries(new FormData(form).entries()));

        setTimeout(() => {
            /* trigger the actual file download */
            const filename = form.dataset.file;
            const a = document.createElement("a");
            a.href = filename;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();

            status.textContent = "Thanks — your download has started.";
            form.reset();
            btn.disabled = false;
            setTimeout(close, 1500);
        }, 600);
    });
})();
const form = document.getElementById("contactForm");
const status = document.getElementById("formStatus");
const downloadBtn = document.getElementById("downloadBrochureBtn");

function submitEnquiry(){
    const data = Object.fromEntries(new FormData(form).entries());
    console.log("Enquiry submitted:", data);
    // Replace with a real fetch() to your endpoint / form service.
}

/* ---- Send a message (unchanged behaviour) ---- */
form?.addEventListener("submit", e => {
    e.preventDefault();

    if (!form.checkValidity()){
        status.textContent = "Please fill in the required fields.";
        status.classList.add("error");
        form.reportValidity();
        return;
    }

    status.classList.remove("error");
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.textContent = "Sending…";

    submitEnquiry();

    setTimeout(() => {
        status.textContent = "Thanks — we'll reply within two working days.";
        form.reset();
        btn.disabled = false;
    }, 700);
});

/* ---- Download Brochure — gated behind the same validation ---- */
downloadBtn?.addEventListener("click", () => {

    if (!form.checkValidity()){
        status.textContent = "Please fill in the required fields to download the brochure.";
        status.classList.add("error");
        form.reportValidity();
        return;
    }

    status.classList.remove("error");
    downloadBtn.disabled = true;
    status.textContent = "Preparing your download…";

    submitEnquiry();

    setTimeout(() => {
        const filename = form.dataset.file;
        const a = document.createElement("a");
        a.href = filename;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        status.textContent = "Thanks — your download has started.";
        form.reset();
        downloadBtn.disabled = false;
    }, 600);
});
/* ==========================================================
   COMPANY PAGE — subnav scroll-to-section + active tracking
========================================================== */

(() => {
    const subnav = document.getElementById("companySubnav");
    if (!subnav) return;

    const buttons = Array.from(subnav.querySelectorAll(".prod-tab-label"));
    const sections = buttons
        .map(btn => document.getElementById(btn.dataset.target))
        .filter(Boolean);

    if (!sections.length) return;

    const setActive = (id) => {
        buttons.forEach(btn =>
            btn.classList.toggle("active", btn.dataset.target === id)
        );
    };

    /* click → smooth scroll, clearing the fixed navbar + subnav height */
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const target = document.getElementById(btn.dataset.target);
            if (!target) return;
            const y = target.getBoundingClientRect().top + window.pageYOffset - 160;
            window.scrollTo({ top: y, behavior: "smooth" });
            setActive(btn.dataset.target);
        });
    });

    /* scroll-spy: highlight whichever section is currently in view */
    const spy = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) setActive(entry.target.id);
        });
    }, { rootMargin: "-160px 0px -60% 0px", threshold: 0 });

    sections.forEach(sec => spy.observe(sec));
})();
/* ==========================================================
   MD'S MESSAGE ANIMATION
========================================================== */

gsap.registerPlugin(ScrollTrigger);

gsap.from(".md-label", {

    y: 40,
    opacity: 0,

    duration: 1,

    ease: "power3.out",

    scrollTrigger: {

        trigger: ".md-message",

        start: "top 75%",

        toggleActions: "play none none reverse"

    }

});


gsap.from(".md-heading h2", {

    y: 100,
    opacity: 0,

    duration: 1.2,

    ease: "power4.out",

    scrollTrigger: {

        trigger: ".md-heading",

        start: "top 80%",

        toggleActions: "play none none reverse"

    }

});


gsap.from(".md-image", {

    y: 80,
    opacity: 0,

    duration: 1.2,

    ease: "power3.out",

    scrollTrigger: {

        trigger: ".md-content",

        start: "top 75%",

        toggleActions: "play none none reverse"

    }

});


gsap.from(".md-copy > p", {

    y: 30,
    opacity: 0,

    duration: 0.8,

    stagger: 0.12,

    ease: "power3.out",

    scrollTrigger: {

        trigger: ".md-copy",

        start: "top 75%",

        toggleActions: "play none none reverse"

    }

});