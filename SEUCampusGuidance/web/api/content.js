import { emptyContent, readPublishedContent } from "./_shared/content-store.js";

export default {
  async fetch() {
    try {
      const published = await readPublishedContent();
      return Response.json({ ok: true, content: published.content, updatedAt: published.content.updatedAt || null }, {
        headers: {
          "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch (error) {
      console.error("Published content read failed", error);
      return Response.json({ ok: true, content: emptyContent, updatedAt: null }, {
        headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
      });
    }
  },
};
