/*
 * Rooms Section — Horizontal Blind Scroll Transition
 * Adapted from Hiro-kiii/Scroll-Transition (script.js only)
 * Uses GSAP + ScrollTrigger + Lenis
 */

(function () {
  'use strict';

  gsap.registerPlugin(ScrollTrigger);

  /* =========================
     Initialize Lenis (smooth scroll)
  ========================= */
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const lenis = new Lenis({
    lerp: 0.15,
    smoothWheel: true,
    smoothTouch: !isTouch,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  /* =========================
     Constants
  ========================= */
  const BLIND_COUNT = 30;
  const svgNS = 'http://www.w3.org/2000/svg';

  let blindsSets = [];
  let master;

  /* =========================
     Create Blinds
  ========================= */
  function createBlinds(groupId) {
    const g = document.getElementById(groupId);
    if (!g) return null;
    g.innerHTML = '';

    const width = window.innerWidth;
    const height = window.innerHeight;
    const vbHeight = (height / width) * 100;
    const h = vbHeight / BLIND_COUNT;
    const blinds = [];
    let currentY = 0;

    for (let i = 0; i < BLIND_COUNT; i++) {
      const centerY = vbHeight - (currentY + h / 2);

      const rectTop = document.createElementNS(svgNS, 'rect');
      const rectBottom = document.createElementNS(svgNS, 'rect');

      [rectTop, rectBottom].forEach(function (r) {
        r.setAttribute('x', 0);
        r.setAttribute('width', 100);
        r.setAttribute('height', 0);
        r.setAttribute('fill', 'white');
        r.setAttribute('shape-rendering', 'crispEdges');
      });

      rectTop.setAttribute('y', centerY);
      rectBottom.setAttribute('y', centerY);

      g.appendChild(rectTop);
      g.appendChild(rectBottom);

      blinds.push({
        top: rectTop,
        bottom: rectBottom,
        y: centerY,
        h: h / 2,
      });
      currentY += h;
    }
    return blinds;
  }

  /* =========================
     Update Layout
  ========================= */
  function updateLayout() {
    var width = window.innerWidth;
    var height = window.innerHeight;
    var vbWidth = 100;
    var vbHeight = (height / width) * 100;

    var layers = document.querySelectorAll('.rooms-layer');
    blindsSets = [];

    layers.forEach(function (svg, i) {
      svg.setAttribute('viewBox', '0 0 ' + vbWidth + ' ' + vbHeight);

      var maskRect = svg.querySelector('mask rect');
      if (maskRect) {
        maskRect.setAttribute('width', vbWidth);
        maskRect.setAttribute('height', vbHeight);
      }

      var img = svg.querySelector('image');
      if (img) {
        img.setAttribute('width', vbWidth);
        img.setAttribute('height', vbHeight);
      }

      var blindGroup = svg.querySelector('g[id^="room-blinds"]');
      if (blindGroup) {
        var blinds = createBlinds(blindGroup.id);
        if (blinds) blindsSets.push(blinds);
      }
    });

    buildMasterTimeline();
  }

  /* =========================
     Blind Animation
  ========================= */
  function openBlinds(blinds) {
    return gsap.timeline().to(
      blinds.flatMap(function (b) { return [b.top, b.bottom]; }),
      {
        attr: {
          y: function (i) {
            var b = blinds[Math.floor(i / 2)];
            return i % 2 === 0 ? b.y - b.h : b.y;
          },
          height: function (i) {
            var b = blinds[Math.floor(i / 2)];
            return b.h + 0.01;
          },
        },
        ease: 'power3.out',
        stagger: {
          each: 0.02,
          from: 'start',
        },
      }
    );
  }

  /* =========================
     Text Animations
  ========================= */
  function textIn(el) {
    return gsap.to(el, {
      clipPath: 'inset(0% 0% 0% 0%)',
      y: 0,
      duration: 1.5,
      ease: 'expo.out',
    });
  }

  function textOut(el) {
    return gsap.to(el, {
      clipPath: 'inset(0% 0% 100% 0%)',
      y: -30,
      duration: 1.2,
      ease: 'power2.inOut',
    });
  }

  /* =========================
     Master Timeline
  ========================= */
  function buildMasterTimeline() {
    if (master) master.kill();

    var texts = gsap.utils.toArray('.rooms-txt');

    master = gsap.timeline({
      scrollTrigger: {
        trigger: '.rooms-stage',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // First room: just show its text
    if (texts[0]) {
      master.add(textIn(texts[0]));
    }

    // For each subsequent room: open blinds to reveal image + swap text
    for (var i = 1; i < blindsSets.length; i++) {
      master.add(openBlinds(blindsSets[i]));
      if (texts[i - 1]) {
        master.add(textOut(texts[i - 1]), '-=0.3');
      }
      if (texts[i]) {
        master.add(textIn(texts[i]), '-=0.8');
      }
    }

    // Hold last text visible briefly before end
    if (texts[texts.length - 1]) {
      master.add(textOut(texts[texts.length - 1]), '+=1');
    }
  }

  /* =========================
     Progress Bar
  ========================= */
  function initProgressBar() {
    var progressFills = gsap.utils.toArray('.rooms-progress-fill');

    ScrollTrigger.create({
      trigger: '.rooms-stage',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      onUpdate: function (self) {
        var progress = self.progress;
        var totalSteps = progressFills.length;
        progressFills.forEach(function (fill, i) {
          var p = (progress - i / totalSteps) * totalSteps;
          p = Math.max(0, Math.min(1, p));
          fill.style.width = (p * 100) + '%';
        });
      },
    });
  }

  /* =========================
     Init
  ========================= */
  // Wait for images to be ready before initializing
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

  function init() {
    // Only init if the rooms-stage section exists
    if (!document.querySelector('.rooms-stage')) return;

    updateLayout();
    initProgressBar();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateLayout, 250);
    });
  }
})();
