/// <reference path="overlay.ts" />
(function () {
  const w = window as Baliset.HeatmapWindow;
  if (w.__balisetLoaded) return;
  w.__balisetLoaded = true;

  Baliset.addLauncher();
  const obs = new MutationObserver(() => {
    if (!document.getElementById("baliset-launcher")) Baliset.addLauncher();
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
})();
