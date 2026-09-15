import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await query(
      `SELECT favicon_url, site_icon_url FROM site_settings WHERE id = 1 LIMIT 1`
    );

    const row = res?.rows?.[0];
    const iconData = row?.favicon_url || row?.site_icon_url;

    if (iconData && iconData.startsWith("data:")) {
      const match = iconData.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const buffer = Buffer.from(match[2], "base64");
        return new Response(buffer, {
          status: 200,
          headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
          },
        });
      }
    }

    if (iconData && (iconData.startsWith("http://") || iconData.startsWith("https://") || iconData.startsWith("/"))) {
      return Response.redirect(iconData, 302);
    }
  } catch (error) {
    console.error("Error serving favicon.ico:", error);
  }

  const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="#1e293b"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="#38bdf8">M</text></svg>`;
  return new Response(fallbackSvg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=60",
    },
  });
}
