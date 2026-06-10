namespace Baliset {
  export type HitMap = Record<string, number>;
  export type Scale = "linear" | "sqrt" | "log";

  export interface ParseResult {
    hits: HitMap;
    totalNotes: number;
    totalStaves: number;
  }

  export interface DrawOpts {
    maxFret: number;
    showLabels: boolean;
    scale: Scale;
  }

  export interface DrawResult {
    width: number;
    height: number;
    maxCount: number;
  }

  export interface HeatmapWindow extends Window {
    __balisetLoaded?: boolean;
    UGAPP?: {
      store?: {
        page?: {
          data?: {
            tab_view?: {
              wiki_tab?: { content?: string };
            };
          };
        };
      };
    };
  }

  export const STRING_LABELS_STD: readonly string[] = ["e", "B", "G", "D", "A", "E"];
  export const NOTE_NAMES: readonly string[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  export const OPEN_MIDI_STD: readonly number[] = [64, 59, 55, 50, 45, 40];

  export function midiToName(m: number): string {
    return NOTE_NAMES[((m % 12) + 12) % 12] + String(Math.floor(m / 12) - 1);
  }
}
