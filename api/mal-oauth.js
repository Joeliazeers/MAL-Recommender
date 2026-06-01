const MAL_TOKEN_URL = 'https://myanimelist.net/v1/oauth2/token'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const clientId = process.env.MAL_CLIENT_ID
  const clientSecret = process.env.MAL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: 'MAL credentials not configured on server' })
  }

  try {
    const { code, code_verifier, grant_type, refresh_token, redirect_uri } = req.body

    if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        return res.status(400).json({ error: 'Missing required parameter: refresh_token' })
      }
    } else {
      if (!code || !code_verifier || !redirect_uri) {
        return res.status(400).json({ error: 'Missing required parameters: code, code_verifier, or redirect_uri' })
      }
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: grant_type || 'authorization_code',
    })

    if (grant_type === 'refresh_token') {
      params.append('refresh_token', refresh_token)
    } else {
      params.append('code', code)
      params.append('code_verifier', code_verifier)
      params.append('redirect_uri', redirect_uri)
    }

    const response = await fetch(MAL_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'Failed to exchange token' })
    }

    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type,
    })
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unknown error' })
  }
}
