/// <reference path="types.ts" />
namespace Baliset {
  export function stripUGMarkup(s: string): string {
    return s.replace(/\[\/?tab\]/gi, "").replace(/\[\/?ch\]/gi, "");
  }

  export function scoreTabText(text: string): number {
    const lines = text.split(/\r?\n/);
    let c = 0;
    for (const l of lines) {
      if (/^\s*[eEBGDAbgad]\s*[\|:]/.test(l) && /-/.test(l)) c++;
    }
    return c;
  }

  export function getPageTabText(): string {
    const selection = window.getSelection ? window.getSelection()?.toString() ?? "" : "";
    if (selection && /[\|\-]/.test(selection) && /\d/.test(selection)) return selection;

    const candidates: string[] = [];
    document.querySelectorAll<HTMLElement>("pre").forEach((p) => candidates.push(p.innerText));
    document
      .querySelectorAll<HTMLElement>("[class*='js-tab-content'], [class*='tab-content'], [class*='TabContent']")
      .forEach((el) => candidates.push(el.innerText));

    try {
      const wiki = (window as HeatmapWindow).UGAPP?.store?.page?.data?.tab_view?.wiki_tab?.content;
      if (wiki) candidates.push(stripUGMarkup(wiki));
    } catch {
      // todo
    }

    candidates.push(document.body.innerText || "");

    let best = "";
    let bestScore = 0;
    for (const c of candidates) {
      if (!c) continue;
      const score = scoreTabText(c);
      if (score > bestScore) {
        bestScore = score;
        best = c;
      }
    }
    return bestScore > 0 ? best : "";
  }

  export function parseTab(rawText: string): ParseResult {
    const text = stripUGMarkup(rawText);
    const lines = text.split(/\r?\n/);
    const stringRegex = /^\s*([eEBGDAbgad])\s*[\|:]/;

    interface TabLine {
      idx: number;
      line: string;
    }

    const tabLines: TabLine[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (stringRegex.test(lines[i]) && /-/.test(lines[i])) {
        tabLines.push({ idx: i, line: lines[i] });
      }
    }

    const groups: TabLine[][] = [];
    let cur: TabLine[] = [];
    for (let i = 0; i < tabLines.length; i++) {
      if (cur.length === 0) {
        cur.push(tabLines[i]);
        continue;
      }
      const prev = cur[cur.length - 1];
      if (tabLines[i].idx - prev.idx <= 2) {
        cur.push(tabLines[i]);
      } else {
        if (cur.length >= 4) groups.push(cur);
        cur = [tabLines[i]];
      }
    }
    if (cur.length >= 4) groups.push(cur);

    const hits: HitMap = {};
    let totalNotes = 0;
    let totalStaves = 0;

    for (const group of groups) {
      const staveLineCount = Math.floor(group.length / 6) * 6;
      totalStaves += staveLineCount / 6;
      for (let i = 0; i < staveLineCount; i++) {
        const stringIdx = i % 6;
        const line = group[i].line;
        const len = line.length;

        let col = 0;
        while (col < len) {
          const c = line.charCodeAt(col++);
          if (c === 124 || c === 58) break;
        }

        while (col < len) {
          const c1 = line.charCodeAt(col);
          if (c1 >= 48 && c1 <= 57) {
            let fret = c1 - 48;
            col++;
            if (col < len) {
              const c2 = line.charCodeAt(col);
              if (c2 >= 48 && c2 <= 57) {
                fret = fret * 10 + (c2 - 48);
                col++;
              }
            }
            if (fret <= 24) {
              const key = stringIdx + "-" + fret;
              hits[key] = (hits[key] || 0) + 1;
              totalNotes++;
            }
          } else {
            col++;
          }
        }
      }
    }

    return { hits, totalNotes, totalStaves };
  }
}
