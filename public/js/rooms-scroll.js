/*
 * Rooms Section — SVG Horizontal Blinds Mask Scroll Transition
 * Adapted from codrops/Scroll-Transition (Horizontal Blinds)
 * Uses GSAP + ScrollTrigger with SVG masks
 */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  var BLIND_COUNT = 30;
  var svgNS = 'http://www.w3.org/2000/svg';
  var blindsSets = [];
  var master = null;

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

  function buildMasterTimeline() {
    if (master) master.kill();

    var stage = document.querySelector('.rooms-stage');
    if (!stage) return;

    var texts = gsap.utils.toArray('.rooms-txt');
    var progressFills = gsap.utils.toArray('.rooms-progress-fill');

    master = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 2.5,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          var progress = self.progress;
          var totalSteps = progressFills.length;
          progressFills.forEach(function (fill, i) {
            var p = (progress - i / totalSteps) * totalSteps;
            p = Math.max(0, Math.min(1, p));
            fill.style.width = (p * 100) + '%';
          });
        }
      }
    });

    // First text is already visible, so we add text transitions around each blinds reveal
    blindsSets.forEach(function (blinds, i) {
      // Text index: blinds[0] reveals layer 2 (text[1]), blinds[1] reveals layer 3 (text[2])
      var currentText = texts[i];
      var nextText = texts[i + 1];

      // Fade out current text
      if (currentText) {
        master.add(textOut(currentText));
      }

      // Open blinds to reveal next layer
      master.add(openBlinds(blinds), '-=0.8');

      // Fade in next text
      if (nextText) {
        master.add(textIn(nextText), '-=0.3');
      }

      // Hold for a moment before next transition
      master.add(function () {}, '+=0.8');
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
