// Input sanitizers + validators, kept pure so they run without a device (see demo).
// ponytail: plain regex, not a validation library — these are the only rules the app has.

// Practical email shape: something@something.tld, no spaces. Not RFC 5322 (nobody needs that).
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

// Keep only what a number field may contain: digits, and (if decimal) a single dot.
export function numeric(s: string, decimal = false): string {
  if (!decimal) return s.replace(/[^0-9]/g, '');
  const cleaned = s.replace(/[^0-9.]/g, '');
  const dot = cleaned.indexOf('.');
  return dot === -1 ? cleaned : cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./g, '');
}

// Licence plates: uppercase letters, digits, space and dash only.
export const plate = (s: string) => s.toUpperCase().replace(/[^A-Z0-9 -]/g, '');

// ponytail: single runnable check. Run with: npx tsx src/lib/validate.ts
export function demo() {
  const ok = (c: boolean, m: string) => {
    if (!c) throw new Error('demo failed: ' + m);
  };
  ok(isEmail('a@b.co'), 'valid email');
  ok(!isEmail('a@b'), 'no tld');
  ok(!isEmail('a b@c.co'), 'space');
  ok(!isEmail(''), 'empty');
  ok(numeric('12a3') === '123', 'strip letters');
  ok(numeric('1.2.3', true) === '1.23', 'single dot');
  ok(numeric('1.2', false) === '12', 'int drops dot');
  ok(numeric('-5') === '5', 'no sign');
  ok(plate('abc-123!') === 'ABC-123', 'plate chars');
  console.log('validate.ts demo: all assertions passed');
}

declare const require: any;
declare const module: any;
if (typeof require !== 'undefined' && require.main === module) demo();
