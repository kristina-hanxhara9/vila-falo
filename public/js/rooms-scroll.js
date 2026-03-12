/*
 * Rooms Section — SVG Horizontal Blinds Mask Scroll Transition
 * Exact 1:1 copy of https://github.com/Hiro-kiii/Scroll-Transition
 * Only class names changed: .stage→.rooms-stage, .layer→.rooms-layer, etc.
 */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  /* =========================
  Config
  ========================= */
  var BLIND_COUNT = 30;
  var svgNS = 'http://www.w3.org/2000/svg';

  var blindsSets = [];
  var master;

  /* =========================
  Create Blinds Effect
  ========================= */
  function createBlinds(groupId) {
    var g = document.getElementById(groupId);
    if (!g) return null;
    g.innerHTML = '';

    var width = window.innerWidth;
    var height = window.innerHeight;
    var vbHeight = (height / width) * 100;
    var h = vbHeight / BLIND_COUNT;
    var blinds = [];
    var currentY = 0;

    for (var i = 0; i < BLIND_COUNT; i++) {
      var centerY = vbHeight - (currentY + h / 2);

      var rectTop = document.createElementNS(svgNS, 'rect');
      var rectBottom = document.createElementNS(svgNS, 'rect');

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
        h: h / 2
      });
      currentY += h;
    }
    return blinds;
  }

  /* =========================
  Open blinds fully (no animation, for initial state)
  ========================= */
  function setBlindsOpen(blinds) {
    blinds.forEach(function (b) {
      gsap.set(b.top, { attr: { y: b.y - b.h, height: b.h + 0.01 } });
      gsap.set(b.bottom, { attr: { y: b.y, height: b.h + 0.01 } });
    });
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

    layers.forEach(function (svg) {
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

      var blindsGroup = svg.querySelector('g[id^="room-blinds"]');
      if (blindsGroup) {
        var blinds = createBlinds(blindsGroup.id);
        if (blinds) blindsSets.push(blinds);
      }
    });

    // Pre-open first room's blinds so no black screen
    if (blindsSets.length > 0) {
      setBlindsOpen(blindsSets[0]);
    }

    // Pre-show first text
    var firstText = document.querySelector('.rooms-txt');
    if (firstText) {
      gsap.set(firstText, { clipPath: 'inset(0% 0% 0% 0%)', y: 0 });
    }

    buildMasterTimeline();
  }

  /* =========================
  Animation
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
          }
        },
        ease: 'power3.out',
        stagger: {
          each: 0.02,
          from: 'start'
        }
      }
    );
  }

  function textIn(el) {
    return gsap.to(el, {
      clipPath: 'inset(0% 0% 0% 0%)',
      y: 0,
      duration: 1.5,
      ease: 'expo.out'
    });
  }

  function textOut(el) {
    return gsap.to(el, {
      clipPath: 'inset(0% 0% 100% 0%)',
      y: -30,
      duration: 1.2,
      ease: 'power2.inOut'
    });
  }

  /* =========================
  Close blinds (reverse of open — for first room when scrolling forward)
  ========================= */
  function closeBlinds(blinds) {
    return gsap.timeline().to(
      blinds.flatMap(function (b) { return [b.top, b.bottom]; }),
      {
        attr: {
          y: function (i) {
            var b = blinds[Math.floor(i / 2)];
            return b.y; // collapse to center
          },
          height: 0
        },
        ease: 'power3.in',
        stagger: {
          each: 0.02,
          from: 'end'
        }
      }
    );
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
        invalidateOnRefresh: true
      }
    });

    blindsSets.forEach(function (blinds, i) {
      if (i === 0) {
        // Room 1 starts fully visible (blinds open, text shown via gsap.set)
        // Animate text out, then close blinds before room 2 appears
        if (texts[i]) {
          master.add(textOut(texts[i]), '+=0.8');
        }
      } else {
        // Rooms 2+ open with blinds animation
        master.add(openBlinds(blinds));
        if (texts[i]) {
          master.add(textIn(texts[i]), '-=0.3');
          if (i < blindsSets.length - 1) {
            master.add(textOut(texts[i]), '+=0.8');
          }
        }
      }
    });
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
      }
    });
  }

  /* =========================
  Run
  ========================= */
  function init() {
    var stage = document.querySelector('.rooms-stage');
    if (!stage) return;

    updateLayout();
    initProgressBar();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateLayout, 250);
    });
  }

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();
