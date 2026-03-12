/*
 * Rooms Section — Scroll-Triggered Overlay Panels
 * Adapted from codrops/OnScrollLayoutFormations pattern
 * Uses GSAP + ScrollTrigger with pin + scrub
 */

(function () {
  'use strict';

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  function init() {
    var pinned = document.querySelector('.rooms-pinned');
    if (!pinned) return;

    var panels = gsap.utils.toArray('.room-panel');
    var overlays = gsap.utils.toArray('.room-panel-overlay');
    var progressFills = gsap.utils.toArray('.rooms-progress-fill');

    if (panels.length < 2) return;

    // Number of transitions = panels - 1
    var numTransitions = panels.length - 1;

    // Create master timeline pinned to the container
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: pinned,
        start: 'top top',
        end: '+=' + (numTransitions * 100) + '%',
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: function (self) {
          // Update progress bar
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

    // For each transition: slide next panel up, darken previous, swap text
    for (var i = 0; i < numTransitions; i++) {
      var nextPanel = panels[i + 1];
      var currentPanel = panels[i];
      var currentOverlay = overlays[i];
      var nextOverlay = overlays[i + 1];

      // Phase label for positioning
      var phaseStart = i;

      // Fade out current text
      tl.to(currentOverlay, {
        opacity: 0,
        y: -30,
        duration: 0.3,
        ease: 'power2.in'
      }, phaseStart);

      // Darken current panel
      tl.to(currentPanel, {
        filter: 'brightness(0.3)',
        duration: 0.8,
        ease: 'none'
      }, phaseStart);

      // Slide next panel up from below
      tl.to(nextPanel, {
        y: 0,
        duration: 0.8,
        ease: 'power3.inOut'
      }, phaseStart + 0.1);

      // Fade in next text
      tl.to(nextOverlay, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out'
      }, phaseStart + 0.5);
    }
  }

  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();
