/** Serves `out/` on http://localhost:4310 with the CORS header Penpot needs, so a local build can be installed. */
Bun.serve({
  port: 4310,
  async fetch(request) {
    const { pathname } = new URL(request.url);
    const file = Bun.file(`${import.meta.dir}/out${pathname === '/' ? '/manifest.json' : pathname}`);
    const headers = { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' };
    if (!(await file.exists())) return new Response('not found', { status: 404, headers });
    return new Response(file, { headers });
  },
});
console.log('Install http://localhost:4310/manifest.json in Penpot (Ctrl+Alt+P).');
