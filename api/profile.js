
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      error: "method tidak didukung"
    });
  }

  const username = String(req.query.username || "")
    .trim()
    .replace(/^@/, "");

  if (!/^[a-zA-Z0-9._]{1,100}$/.test(username)) {
    return res.status(400).json({
      ok: false,
      error: "username tidak valid"
    });
  }

  const apiKey = process.env.SOCIFLUX_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      ok: false,
      error: "SOCIFLUX_API_KEY belum diatur di Vercel"
    });
  }

  try {
    const response = await fetch(
      "https://api.sociflux.com/v1/tiktok/profile?username=" +
        encodeURIComponent(username),
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json"
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: result.message || result.error ||
          `API error HTTP ${response.status}`
      });
    }

    const d = result.data?.user || result.data?.profile ||
      result.data || result.user || result.profile;

    if (!d || typeof d !== "object") {
      return res.status(502).json({
        ok: false,
        error: "format respons API tidak sesuai"
      });
    }

    const stats = d.stats || {};

    return res.status(200).json({
      ok: true,
      profile: {
        unique_id: d.username || d.unique_id || username,
        nickname: d.nickname || d.display_name,
        user_id: d.id || d.user_id,
        avatar: d.avatar || d.avatar_url,
        signature: d.bio || d.signature,
        verified: d.verified ?? d.is_verified,
        follower_count: d.follower_count ?? stats.followers,
        following_count: d.following_count ?? stats.following,
        likes_count: d.likes_count ?? stats.likes,
        video_count: d.video_count ?? stats.videos,
        country: d.country || d.region,
        language: d.language,
        created_at: d.create_time || d.created_at
      }
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: "gagal menghubungi sumber data API"
    });
  }
}
