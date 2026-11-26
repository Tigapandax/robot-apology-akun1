import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function fail(message: string): never {
  console.error(`INVALID: ${message}`);
  process.exit(1);
}

const source = readFileSync(new URL("./two-lines.txt", import.meta.url), "utf8");
const text = source.replace(/\n$/, "");
const lines = text.split("\n");

if (lines.length !== 2) fail(`expected exactly 2 lines, found ${lines.length}`);
if (text.length < 1 || text.length > 400) fail(`entry is ${text.length} characters, must be 1-400`);
if (text.trim().length === 0) fail("entry is only whitespace");
if (text.includes("\r")) fail("entry contains a carriage return");
if (lines[0] === lines[1]) fail("the two lines must not be identical");
for (const [index, sentence] of lines.entries()) {
  if (sentence.length === 0) fail(`line ${index + 1} is empty`);
  if (sentence !== sentence.trim()) fail(`line ${index + 1} has leading or trailing space`);
  if (!/[.!?]$/.test(sentence)) fail(`line ${index + 1} must end with . ! or ?`);
  if ([...sentence].length !== sentence.length) fail(`line ${index + 1} contains a character outside the basic plane`);
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(sentence)) fail(`line ${index + 1} contains a control character`);
}

const destination = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(destination, { recursive: true });
writeFileSync(join(destination, "entry.txt"), text, "utf8");
console.log(text);
console.log(`WROTE entry.txt: ${lines.length} lines, ${text.length} characters.`);
