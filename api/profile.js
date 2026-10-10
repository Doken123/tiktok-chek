export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
  if (req.method !== "GET") return res.status(405).json({ ok: false, error: "method tidak didukung" });

  const username = String(req.query.username || "").trim().replace(/^@/, "").replace(/\/.*$/, "");
  if (!username || !/^[a-zA-Z0-9._]{1,100}$/.test(username)) {
    return res.status(400).json({ ok: false, error: "username tidak valid" });
  }

  try {
    // TikWM menyediakan endpoint publik yang bisa berubah sewaktu-waktu.
    const upstream = await fetch("https://www.tikwm.com/api/user/info?unique_id=" + encodeURIComponent(username), {
      headers: { "Accept": "application/json", "User-Agent": "Mozilla/5.0 TikTokProfileChecker/1.0" }
    });
    if (!upstream.ok) throw new Error("sumber data membalas HTTP " + upstream.status);
    const body = await upstream.json();
    if (body.code !== 0 || !body.data) {
      return res.status(404).json({ ok: false, error: body.msg || "profil tidak ditemukan atau API tidak mengembalikan data" });
    }
    const raw = body.data.user || body.data;
    const stats = raw.stats || {};
    const profile = {
      unique_id: raw.unique_id || raw.uniqueId || username,
      nickname: raw.nickname || raw.nick_name || raw.display_name,
      user_id: raw.id || raw.uid || raw.user_id,
      avatar: raw.avatar || raw.avatar_larger || raw.avatarMedium || raw.avatar_url,
      signature: raw.signature || raw.bio_description,
      verified: raw.verified ?? raw.is_verified,
      follower_count: raw.follower_count ?? stats.followerCount,
      following_count: raw.following_count ?? stats.followingCount,
      likes_count: raw.likes_count ?? raw.total_favorited ?? stats.heartCount,
      video_count: raw.video_count ?? stats.videoCount,
      country: raw.country || raw.region,
      language: raw.language,
      created_at: raw.created_at || raw.create_time
    };
    return res.status(200).json({ ok: true, profile });
  } catch (error) {
    return res.status(502).json({ ok: false, error: "sumber data sedang tidak bisa diakses. " + error.message });
  }
}
