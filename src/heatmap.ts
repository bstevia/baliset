/// <reference path="types.ts" />
namespace Baliset {
  export function heatColor(t: number): string {
    if (t <= 0) return "#f2f2f2";
    const stops: Array<[number, [number, number, number]]> = [
      [0.0, [236, 235, 255]],
      [1.0, [255, 61, 61]],
    ];
    const tc = Math.max(0, Math.min(1, t));
    for (let i = 1; i < stops.length; i++) {
      if (tc <= stops[i][0]) {
        const a = stops[i - 1];
        const b = stops[i];
        const u = (tc - a[0]) / (b[0] - a[0]);
        const r = Math.round(a[1][0] + (b[1][0] - a[1][0]) * u);
        const g = Math.round(a[1][1] + (b[1][1] - a[1][1]) * u);
        const bl = Math.round(a[1][2] + (b[1][2] - a[1][2]) * u);
        return "rgb(" + r + "," + g + "," + bl + ")";
      }
    }
    return "rgb(255,61,61)";
  }

  export function drawHeatmap(canvas: HTMLCanvasElement, hits: HitMap, opts: DrawOpts): DrawResult {
    const maxFret = opts.maxFret;
    const showLabels = opts.showLabels;
    const scale = opts.scale;

    const marginLeft = 46;
    const marginRight = 20;
    const marginTop = 24;
    const marginBottom = 30;
    const fretWidth = 38;
    const stringGap = 30;

    const width = marginLeft + marginRight + (maxFret + 1) * fretWidth;
    const height = marginTop + marginBottom + 5 * stringGap;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    const ctx = canvas.getContext("2d");
    if (!ctx) return { width, height, maxCount: 0 };
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    let maxCount = 0;
    for (const k in hits) if (hits[k] > maxCount) maxCount = hits[k];

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "#b78a3a";
    ctx.fillRect(marginLeft + fretWidth, marginTop - 4, maxFret * fretWidth, 5 * stringGap + 8);

    ctx.strokeStyle = "#6b4b1a";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(marginLeft + fretWidth, marginTop - 4);
    ctx.lineTo(marginLeft + fretWidth, marginTop - 4 + 5 * stringGap + 8);
    ctx.stroke();

    ctx.strokeStyle = "#5d5d5d";
    ctx.lineWidth = 1;
    for (let f = 1; f <= maxFret; f++) {
      const x = marginLeft + (f + 1) * fretWidth;
      ctx.beginPath();
      ctx.moveTo(x, marginTop - 4);
      ctx.lineTo(x, marginTop - 4 + 5 * stringGap + 8);
      ctx.stroke();
    }

    ctx.fillStyle = "#2a2a2a";
    for (const f of [3, 5, 7, 9, 15, 17, 19, 21]) {
      if (f > maxFret) break;
      const x = marginLeft + fretWidth + (f - 0.5) * fretWidth;
      const y = marginTop + 2.5 * stringGap;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    if (maxFret >= 12) {
      const x = marginLeft + fretWidth + (12 - 0.5) * fretWidth;
      for (const dy of [-stringGap, stringGap]) {
        ctx.beginPath();
        ctx.arc(x, marginTop + 2.5 * stringGap + dy, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 1.2;
    for (let s = 0; s < 6; s++) {
      const y = marginTop + s * stringGap;
      ctx.beginPath();
      ctx.moveTo(marginLeft + fretWidth * 0.3, y);
      ctx.lineTo(marginLeft + (maxFret + 1) * fretWidth, y);
      ctx.stroke();

      ctx.fillStyle = "#111";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(STRING_LABELS_STD[s], marginLeft - 6, y);
    }

    ctx.fillStyle = "#555";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let f = 0; f <= maxFret; f++) {
      const x =
        f === 0 ? marginLeft + fretWidth * 0.6 : marginLeft + fretWidth + (f - 0.5) * fretWidth;
      ctx.fillText(String(f), x, marginTop + 5 * stringGap + 8);
    }

    for (let s = 0; s < 6; s++) {
      for (let f = 0; f <= maxFret; f++) {
        const key = s + "-" + f;
        const count = hits[key] || 0;
        if (count === 0) continue;
        let t: number;
        if (scale === "log") t = Math.log(1 + count) / Math.log(1 + maxCount);
        else if (scale === "sqrt") t = Math.sqrt(count) / Math.sqrt(maxCount);
        else t = count / maxCount;

        const x =
          f === 0 ? marginLeft + fretWidth * 0.6 : marginLeft + fretWidth + (f - 0.5) * fretWidth;
        const y = marginTop + s * stringGap;
        const r = 11;

        ctx.fillStyle = heatColor(t);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();

        if (showLabels) {
          ctx.fillStyle = "#000";
          ctx.font = "bold 11px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(String(count), x, y);
        }
      }
    }

    return { width, height, maxCount };
  }
}
