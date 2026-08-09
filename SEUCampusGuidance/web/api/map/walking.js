const campusRegion = {
  south: 31.95,
  north: 32.16,
  west: 118.65,
  east: 118.95,
};

function json(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}

function coordinate(value) {
  const latitude = Number(value?.latitude);
  const longitude = Number(value?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < campusRegion.south || latitude > campusRegion.north || longitude < campusRegion.west || longitude > campusRegion.east) return null;
  return { latitude, longitude };
}

function decompressPolyline(polyline) {
  if (!Array.isArray(polyline) || polyline.length < 4) return [];
  const values = polyline.map(Number);
  for (let index = 2; index < values.length; index += 1) values[index] = values[index - 2] + values[index] / 1_000_000;
  const points = [];
  for (let index = 0; index + 1 < values.length; index += 2) {
    if (Number.isFinite(values[index]) && Number.isFinite(values[index + 1])) {
      points.push({ latitude: values[index], longitude: values[index + 1] });
    }
  }
  return points;
}

export default {
  async fetch(request) {
    if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
    if (!process.env.TENCENT_MAP_KEY) return json({ error: "路线服务尚未配置。" }, 503);
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "请求内容格式不正确。" }, 400);
    }
    const from = coordinate(body?.from);
    const to = coordinate(body?.to);
    if (!from || !to) return json({ error: "起点或终点不在四牌楼校区服务范围内。" }, 400);

    const endpoint = new URL("https://apis.map.qq.com/ws/direction/v1/walking/");
    endpoint.search = new URLSearchParams({
      from: `${from.latitude},${from.longitude}`,
      to: `${to.latitude},${to.longitude}`,
      output: "json",
      key: process.env.TENCENT_MAP_KEY,
    }).toString();
    try {
      const response = await fetch(endpoint, { signal: AbortSignal.timeout(9_000) });
      const payload = await response.json();
      const route = payload?.result?.routes?.[0];
      if (!response.ok || payload?.status !== 0 || !route) {
        console.error("Tencent walking route failed", { status: payload?.status, message: payload?.message });
        const message = payload?.status === 121
          ? "今日站内路线额度已用完，请改用腾讯地图导航。"
          : "暂时无法规划步行路线，请稍后重试。";
        return json({ error: message }, 502);
      }
      return json({
        ok: true,
        route: {
          distance: Number(route.distance) || 0,
          duration: Number(route.duration) || 0,
          direction: String(route.direction || ""),
          polyline: decompressPolyline(route.polyline),
          steps: (Array.isArray(route.steps) ? route.steps : []).slice(0, 80).map((step) => ({
            instruction: String(step.instruction || "继续步行").slice(0, 300),
            distance: Number(step.distance) || 0,
            direction: String(step.dir_desc || "").slice(0, 20),
            action: String(step.act_desc || "").slice(0, 40),
          })),
        },
      });
    } catch (error) {
      console.error("Tencent walking route request error", error);
      return json({ error: "路线服务响应超时，请稍后重试。" }, 504);
    }
  },
};
