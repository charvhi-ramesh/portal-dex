// FND-01 / SPEC X6 contrast gate. Run: node scripts/check-contrast.ts
// Parses the --color-* tokens and --star-dot-opacity from app/globals.css and checks every
// UI-SPEC text, border, focus and frame pair, including the star dot composited on bg at the
// opacity cap. Ratios are compared unrounded with >=. Exit 0 on CONTRAST OK, 1 otherwise.
import { readFileSync } from "node:fs";
import { join } from "node:path";

type Rgb = [number, number, number];

const MAX_STAR_DOT_OPACITY = 0.15; // planning decision 1: 15% cap, enforced here as well as in CSS
const HEX = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;

function parseHex(value: string): Rgb | null {
  const m = HEX.exec(value.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function relativeLuminance(rgb: Rgb): number {
  return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function composite(fg: Rgb, bg: Rgb, opacity: number): Rgb {
  return [
    Math.round(fg[0] * opacity + bg[0] * (1 - opacity)),
    Math.round(fg[1] * opacity + bg[1] * (1 - opacity)),
    Math.round(fg[2] * opacity + bg[2] * (1 - opacity)),
  ];
}

function selfCheck(): boolean {
  const black = parseHex("#000000") as Rgb;
  const white = parseHex("#FFFFFF") as Rgb;
  const g767676 = parseHex("#767676") as Rgb;
  const g777777 = parseHex("#777777") as Rgb;
  const blue = parseHex("#4DA3FF") as Rgb;
  const navy = parseHex("#0A0F1F") as Rgb;
  const problems: string[] = [];
  if (contrastRatio(black, white).toFixed(2) !== "21.00") problems.push("black on white is not 21.00");
  if (!(contrastRatio(g767676, white) >= 4.5)) problems.push("#767676 on #FFFFFF should pass 4.5");
  if (contrastRatio(g777777, white) >= 4.5) problems.push("#777777 on #FFFFFF should fail 4.5");
  if (contrastRatio(blue, navy) !== contrastRatio(navy, blue)) problems.push("ratio is order dependent");
  if (parseHex("#fff") !== null || parseHex("#FFFFFFFF") !== null || parseHex("rgb(1,2,3)") !== null) {
    problems.push("hex parser accepts a non-#RRGGBB value");
  }
  for (const p of problems) console.log(`SELF-CHECK FAIL: ${p}`);
  return problems.length === 0;
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

function main(): number {
  if (!selfCheck()) {
    console.log("CONTRAST FAIL");
    return 1;
  }

  const cssPath = join(process.cwd(), "app", "globals.css");
  let css: string;
  try {
    css = stripComments(readFileSync(cssPath, "utf8"));
  } catch {
    console.log(`MISSING TOKEN: cannot read ${cssPath}`);
    console.log("CONTRAST FAIL");
    return 1;
  }

  const tokens = new Map<string, string>();
  for (const m of css.matchAll(/--color-([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens.set(m[1], m[2].trim());
  }
  const opacityMatch = /--star-dot-opacity\s*:\s*([^;]+);/.exec(css);

  const usedTokens = [
    "bg", "surface", "surface-raised", "text", "text-muted", "blue", "blue-hover",
    "teal", "grey", "purple", "pink", "border-ui", "star-dot",
  ];

  let failed = false;
  const colours = new Map<string, Rgb>();
  for (const name of usedTokens) {
    const raw = tokens.get(name);
    if (raw === undefined) {
      console.log(`MISSING TOKEN --color-${name}`);
      failed = true;
      continue;
    }
    const rgb = parseHex(raw);
    if (rgb === null) {
      console.log(`BAD TOKEN --color-${name}: "${raw}" is not #RRGGBB`);
      failed = true;
      continue;
    }
    colours.set(name, rgb);
  }

  let opacity = NaN;
  if (!opacityMatch) {
    console.log("MISSING TOKEN --star-dot-opacity");
    failed = true;
  } else {
    const raw = opacityMatch[1].trim();
    if (!/^(\d+\.?\d*|\.\d+)$/.test(raw)) {
      console.log(`BAD TOKEN --star-dot-opacity: "${raw}" is not a plain number`);
      failed = true;
    } else {
      opacity = Number(raw);
      if (opacity > MAX_STAR_DOT_OPACITY) {
        console.log(`FAIL --star-dot-opacity ${raw} exceeds the 0.15 cap`);
        failed = true;
      }
    }
  }

  if (failed) {
    console.log("CONTRAST FAIL");
    return 1;
  }

  const get = (name: string): Rgb => colours.get(name) as Rgb;
  const starBg = composite(get("star-dot"), get("bg"), opacity);

  // [foreground name, background name or "star-dot-composite", minimum ratio]
  const pairs: Array<[string, string, number]> = [];
  for (const bg of ["bg", "surface", "surface-raised"]) pairs.push(["text", bg, 4.5]);
  for (const bg of ["bg", "surface", "surface-raised"]) pairs.push(["text-muted", bg, 4.5]);
  for (const bg of ["bg", "surface"]) pairs.push(["blue", bg, 4.5]);
  for (const fg of ["grey", "purple"]) for (const bg of ["bg", "surface"]) pairs.push([fg, bg, 4.5]);
  for (const bg of ["bg", "surface", "surface-raised"]) pairs.push(["teal", bg, 3]);
  for (const fg of ["grey", "purple"]) for (const bg of ["surface", "surface-raised"]) pairs.push([fg, bg, 3]);
  // The pink end of the unknown shimmer frame and the favourite star icon (plan 02-03).
  for (const bg of ["bg", "surface", "surface-raised"]) pairs.push(["pink", bg, 3]);
  for (const bg of ["blue", "blue-hover", "teal", "grey", "purple", "pink"]) pairs.push(["bg", bg, 4.5]);
  for (const bg of ["bg", "surface", "surface-raised"]) pairs.push(["border-ui", bg, 3]);
  for (const fg of ["text", "text-muted", "blue"]) pairs.push([fg, "star-dot-composite", 4.5]);

  for (const [fgName, bgName, min] of pairs) {
    const bg = bgName === "star-dot-composite" ? starBg : get(bgName);
    const ratio = contrastRatio(get(fgName), bg);
    const ok = ratio >= min;
    if (!ok) failed = true;
    console.log(`${ok ? "PASS" : "FAIL"} ${fgName} on ${bgName} ${ratio.toFixed(2)} (min ${min})`);
  }

  console.log(failed ? "CONTRAST FAIL" : "CONTRAST OK");
  return failed ? 1 : 0;
}

process.exit(main());
