/*
 * Rooms Section — SVG Horizontal Blinds Mask Scroll Transition
 * Room 1 is always visible (no mask). Rooms 2+ use SVG blinds masks.
 * All animations use fromTo() for fully reversible scrub timeline.
 */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  var BLIND_COUNT = 30;
  var svgNS = 'http://www.w3.org/2000/svg';
  var blindsSets = [];
  var master;
  var progressST;

  /* Create blind rects inside a mask group */
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

      blinds.push({ top: rectTop, bottom: rectBottom, y: centerY, h: h / 2 });
      currentY += h;
    }
    return blinds;
  }

  /* Update SVG viewBoxes and rebuild blinds */
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

    buildMasterTimeline();
  }

  /* Blinds open animation — uses fromTo for explicit start/end */
  function openBlinds(blinds) {
    var targets = blinds.flatMap(function (b) { return [b.top, b.bottom]; });
    return gsap.timeline().fromTo(
      targets,
      {
        attr: {
          y: function (i) { return blinds[Math.floor(i / 2)].y; },
          height: 0
        }
      },
      {
        attr: {
          y: function (i) {
            var b = blinds[Math.floor(i / 2)];
            return i % 2 === 0 ? b.y - b.h : b.y;
          },
          height: function (i) {
            return blinds[Math.floor(i / 2)].h + 0.01;
          }
        },
        ease: 'power3.out',
        stagger: { each: 0.02, from: 'start' }
      }
    );
  }

  function textIn(el) {
    return gsap.fromTo(el,
      { clipPath: 'inset(100% 0 0 0)', y: 40 },
      { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.5, ease: 'expo.out' }
    );
  }

  function textOut(el) {
    return gsap.fromTo(el,
      { clipPath: 'inset(0% 0% 0% 0%)', y: 0 },
      { clipPath: 'inset(0% 0% 100% 0%)', y: -30, duration: 1.2, ease: 'power2.inOut' }
    );
  }

  /* Build scrub timeline — all fromTo for fully reversible scrub */
  function buildMasterTimeline() {
    if (master) {
      master.scrollTrigger && master.scrollTrigger.kill();
      master.kill();
    }
    if (progressST) {
      progressST.kill();
    }

    var texts = gsap.utils.toArray('.rooms-txt');

    // Reset all texts to CSS defaults before building timeline
    texts.forEach(function (t, i) {
      if (i === 0) {
        gsap.set(t, { clipPath: 'inset(0% 0% 0% 0%)', y: 0, clearProps: false });
      } else {
        gsap.set(t, { clipPath: 'inset(100% 0 0 0)', y: 40, clearProps: false });
      }
    });

    // Reset all blind rects to closed
    blindsSets.forEach(function (blinds) {
      blinds.forEach(function (b) {
        b.top.setAttribute('height', 0);
        b.top.setAttribute('y', b.y);
        b.bottom.setAttribute('height', 0);
        b.bottom.setAttribute('y', b.y);
      });
    });

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

    // Room 1 text out — fromTo so it's fully reversible
    if (texts[0]) {
      master.add(textOut(texts[0]), '+=0.5');
    }

    // Rooms 2+ : open blinds, show text, hide text
    blindsSets.forEach(function (blinds, i) {
      var textIndex = i + 1;
      master.add(openBlinds(blinds));
      if (texts[textIndex]) {
        master.add(textIn(texts[textIndex]), '-=0.3');
        if (i < blindsSets.length - 1) {
          master.add(textOut(texts[textIndex]), '+=0.8');
        }
      }
    });

    initProgressBar();
  }

  /* Progress bar */
  function initProgressBar() {
    var progressFills = gsap.utils.toArray('.rooms-progress-fill');
    if (!progressFills.length) return;

    progressST = ScrollTrigger.create({
      trigger: '.rooms-stage',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
      onUpdate: function (self) {
        var progress = self.progress;
        var total = progressFills.length;
        progressFills.forEach(function (fill, i) {
          var p = Math.max(0, Math.min(1, (progress - i / total) * total));
          fill.style.width = (p * 100) + '%';
        });
      }
    });
  }

  function init() {
    var stage = document.querySelector('.rooms-stage');
    if (!stage) return;

    updateLayout();

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
