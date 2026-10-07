/**
 * Basic auth on the circus ideas book.
 *
 * The password comes from the BOOK_PASSWORD environment variable, set in
 * Vercel under Project Settings -> Environment Variables. BOOK_USER is
 * optional and defaults to "pio".
 *
 * If BOOK_PASSWORD is not set the book is refused rather than served, so a
 * missing variable can never leave it open.
 *
 * The landing page and the song page are untouched — the matcher below only
 * covers the book.
 */

export const config = {
  matcher: ['/book', '/book.html'],
};

const REALM = 'Paradise Circus';

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
  const expectedPass = process.env.BOOK_PASSWORD;
  const expectedUser = process.env.BOOK_USER || 'pio';

  if (!expectedPass) {
    return new Response(
      'The book is not configured yet. Set BOOK_PASSWORD in the Vercel project settings.\n',
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
    );
  }

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
