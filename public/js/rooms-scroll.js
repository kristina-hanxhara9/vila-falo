/*
 * Rooms Section — SVG Horizontal Blinds Mask Scroll Transition
 * Room 1 is always visible (no mask). Rooms 2+ use SVG blinds masks.
 * Fully reversible scrub timeline.
 */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  var BLIND_COUNT = 30;
  var svgNS = 'http://www.w3.org/2000/svg';
  var blindsSets = [];
  var master;

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

      // Only create blinds for layers that have a blinds group (rooms 2+)
      var blindsGroup = svg.querySelector('g[id^="room-blinds"]');
      if (blindsGroup) {
        var blinds = createBlinds(blindsGroup.id);
        if (blinds) blindsSets.push(blinds);
      }
    });

    buildMasterTimeline();
  }

  /* Blinds open animation */
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
            return blinds[Math.floor(i / 2)].h + 0.01;
          }
        },
        ease: 'power3.out',
        stagger: { each: 0.02, from: 'start' }
      }
    );
  }

  function textIn(el) {
    return gsap.to(el, {
      clipPath: 'inset(0% 0% 0% 0%)', y: 0,
      duration: 1.5, ease: 'expo.out'
    });
  }

  function textOut(el) {
    return gsap.to(el, {
      clipPath: 'inset(0% 0% 100% 0%)', y: -30,
      duration: 1.2, ease: 'power2.inOut'
    });
  }

  /* Build scrub timeline — everything is in the timeline so it's fully reversible */
  function buildMasterTimeline() {
    if (master) master.kill();

    var texts = gsap.utils.toArray('.rooms-txt');

    // Set room 1 text to visible immediately (it's the starting state)
    if (texts[0]) {
      gsap.set(texts[0], { clipPath: 'inset(0% 0% 0% 0%)', y: 0 });
    }

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

    // Room 1 text out (room 1 image has no mask, always visible underneath)
    if (texts[0]) {
      master.add(textOut(texts[0]), '+=0.5');
    }

    // Rooms 2+ : open blinds (reveals image over room 1), show text, hide text
    blindsSets.forEach(function (blinds, i) {
      var textIndex = i + 1; // blindsSets[0] = room 2, texts[1] = room 2 text
      master.add(openBlinds(blinds));
      if (texts[textIndex]) {
        master.add(textIn(texts[textIndex]), '-=0.3');
        // Don't hide the last room's text
        if (i < blindsSets.length - 1) {
          master.add(textOut(texts[textIndex]), '+=0.8');
        }
      }
    });
  }

  /* Progress bar */
  function initProgressBar() {
    var progressFills = gsap.utils.toArray('.rooms-progress-fill');
    ScrollTrigger.create({
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
