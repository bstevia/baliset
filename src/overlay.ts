/// <reference path="types.ts" />
/// <reference path="parse.ts" />
/// <reference path="heatmap.ts" />
namespace Baliset {
  export function buildOverlay(): void {
    const existing = document.getElementById("baliset-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "baliset-overlay";
    overlay.addEventListener("click", (e: MouseEvent) => {
      if (e.target === overlay) overlay.remove();
    });

    const modal = document.createElement("div");
    modal.id = "baliset-modal";

    const close = document.createElement("button");
    close.id = "baliset-close";
    close.textContent = "X";
    close.title = "Close";
    close.addEventListener("click", () => overlay.remove());

    const title = document.createElement("h2");
    title.textContent = "Tab Heatmap";
    const sub = document.createElement("div");
    sub.className = "baliset-sub";

    const stats = document.createElement("div");
    stats.className = "baliset-stats";

    const controls = document.createElement("div");
    controls.className = "baliset-controls";
    controls.innerHTML =
      '<label><input type="checkbox" id="baliset-labels" checked> Show counts</label>' +
      '<label>Max fret: <select id="baliset-maxfret"><option>12</option><option>15</option><option>19</option><option selected>24</option></select></label>' +
      '<button id="baliset-reparse">Re-parse page</button>' +
      '<button id="baliset-useselection">Use text selection</button>';

    const empty = document.createElement("div");
    empty.id = "baliset-empty";
    empty.style.display = "none";
    empty.textContent =
      'No ASCII tab lines found on this page. Try selecting the tab text and clicking "Use text selection".';

    const canvasWrap = document.createElement("div");
    canvasWrap.id = "baliset-canvas-wrap";
    const canvas = document.createElement("canvas");
    canvas.id = "baliset-canvas";
    canvasWrap.appendChild(canvas);

    const legend = document.createElement("div");
    legend.id = "baliset-legend";
    legend.innerHTML = '<span>less</span><div class="baliset-bar"></div><span>more</span>';

    modal.appendChild(close);
    modal.appendChild(title);
    modal.appendChild(sub);
    modal.appendChild(stats);
    modal.appendChild(controls);
    modal.appendChild(empty);
    modal.appendChild(canvasWrap);
    modal.appendChild(legend);
    overlay.appendChild(modal);
    document.documentElement.appendChild(overlay);

    let lastHits: HitMap = {};
    let lastMeta = { totalNotes: 0, totalStaves: 0 };

    const labelsEl = document.getElementById("baliset-labels") as HTMLInputElement;
    const maxFretEl = document.getElementById("baliset-maxfret") as HTMLSelectElement;
    const reparseEl = document.getElementById("baliset-reparse") as HTMLButtonElement;
    const useSelEl = document.getElementById("baliset-useselection") as HTMLButtonElement;

    function render(): void {
      const scale: Scale = "sqrt";
      const labels = labelsEl.checked;
      const maxFret = parseInt(maxFretEl.value, 10);

      const hasNotes = Object.keys(lastHits).length > 0;
      empty.style.display = hasNotes ? "none" : "block";
      canvas.style.display = hasNotes ? "block" : "none";
      legend.style.display = hasNotes ? "flex" : "none";
      if (!hasNotes) {
        stats.innerHTML = "";
        return;
      }

      const result = drawHeatmap(canvas, lastHits, { maxFret, showLabels: labels, scale });

      const unique = Object.keys(lastHits).length;
      let topKey: string | null = null;
      let topCount = 0;
      for (const k in lastHits) {
        if (lastHits[k] > topCount) {
          topCount = lastHits[k];
          topKey = k;
        }
      }
      let topDesc = "—";
      if (topKey) {
        const parts = topKey.split("-");
        const s = parseInt(parts[0], 10);
        const f = parseInt(parts[1], 10);
        const midi = OPEN_MIDI_STD[s] + f;
        topDesc = STRING_LABELS_STD[s] + " string, fret " + f + " (" + midiToName(midi) + ") × " + topCount;
      }
      stats.innerHTML =
        "<div>Notes parsed: <b>" + lastMeta.totalNotes + "</b></div>" +
        "<div>Staves: <b>" + lastMeta.totalStaves + "</b></div>" +
        "<div>Unique positions: <b>" + unique + "</b></div>" +
        "<div>Hottest: <b>" + topDesc + "</b></div>" +
        "<div>Max at any position: <b>" + result.maxCount + "</b></div>";
    }

    function runParse(source: "page" | "selection"): void {
      const text =
        source === "selection"
          ? window.getSelection?.()?.toString() ?? ""
          : getPageTabText();
      const parsed = parseTab(text || "");
      lastHits = parsed.hits;
      lastMeta = { totalNotes: parsed.totalNotes, totalStaves: parsed.totalStaves };
      render();
    }

    labelsEl.addEventListener("change", render);
    maxFretEl.addEventListener("change", render);
    reparseEl.addEventListener("click", () => runParse("page"));
    useSelEl.addEventListener("click", () => runParse("selection"));

    runParse("page");
  }

  export function addLauncher(): void {
    if (document.getElementById("baliset-launcher")) return;
    const btn = document.createElement("button");
    btn.id = "baliset-launcher";
    btn.textContent = "Tab Heatmap";
    btn.addEventListener("click", buildOverlay);
    document.documentElement.appendChild(btn);
  }
}
