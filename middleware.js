/**
 * Basic auth on the circus ideas book.
 *
 * Defaults: pio / coconut. This is a speed bump, not a secret — it keeps the
 * book from being read by anyone who stumbles on the link, and that's all it
 * is meant to do. The default sits in a public repo, so treat it as public.
 *
 * To use something only you know, set BOOK_PASSWORD (and optionally
 * BOOK_USER) in Vercel under Project Settings -> Environment Variables, then
 * redeploy. Those override the defaults below.
 *
 * The landing page and the song page are untouched — the matcher below only
 * covers the book.
 */

export const config = {
  matcher: ['/book', '/book.html'],
};

const REALM = 'Paradise Circus';
const DEFAULT_USER = 'pio';
const DEFAULT_PASS = 'coconut';

function unauthorized() {
  return new Response('Authentication required.\n', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

/** Constant-time-ish compare, so a wrong password leaks nothing by timing. */
function same(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default function middleware(request) {
  const expectedUser = process.env.BOOK_USER || DEFAULT_USER;
  const expectedPass = process.env.BOOK_PASSWORD || DEFAULT_PASS;

  const header = request.headers.get('authorization');
  if (!header) return unauthorized();

  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return unauthorized();

  let decoded;
  try {
    decoded = atob(encoded);
  } catch {
    return unauthorized();
  }

  const split = decoded.indexOf(':');
  if (split === -1) return unauthorized();

  const user = decoded.slice(0, split);
  const pass = decoded.slice(split + 1);

  if (same(user, expectedUser) && same(pass, expectedPass)) {
    return; // authenticated — fall through and serve the file
  }
  return unauthorized();
}
