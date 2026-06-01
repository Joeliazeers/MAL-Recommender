const api = async (path, options = {}) => {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

// ========== USERS ==========

export const upsertUser = (userData) =>
  api('/api/users', {
    method: 'POST',
    body: {
      mal_id: userData.mal_id,
      username: userData.username,
      avatar_url: userData.avatar_url,
      access_token: userData.access_token,
      refresh_token: userData.refresh_token,
      token_expires_at: userData.token_expires_at,
    },
  })

export const getUserByMalId = (malId) =>
  api(`/api/users?malId=${malId}`)

export const updateUserTokens = (malId, tokens) =>
  api(`/api/users?malId=${malId}`, {
    method: 'PATCH',
    body: tokens,
  })

// ========== LISTS ==========

export const cacheUserAnimeList = (userId, animeList) =>
  api(`/api/lists?userId=${userId}&type=anime`, {
    method: 'POST',
    body: { items: animeList },
  })

export const getUserAnimeListCache = (userId) =>
  api(`/api/lists?userId=${userId}&type=anime`)

export const cacheUserMangaList = (userId, mangaList) =>
  api(`/api/lists?userId=${userId}&type=manga`, {
    method: 'POST',
    body: { items: mangaList },
  })

export const getUserMangaListCache = (userId) =>
  api(`/api/lists?userId=${userId}&type=manga`)

// ========== SHARED RECOMMENDATIONS ==========

export const createSharedRecommendation = (userId, type, mode, recommendations) =>
  api('/api/shared', {
    method: 'POST',
    body: { userId, type, mode, recommendations },
  })

export const getSharedRecommendation = (shareCode) =>
  api(`/api/shared?code=${shareCode}`)

// ========== USER PREFERENCES ==========

export const getUserPreferences = (userId) =>
  api(`/api/preferences?userId=${userId}`)

export const saveUserPreferences = (userId, preferences) =>
  api('/api/preferences', {
    method: 'POST',
    body: { userId, ...preferences },
  })

// ========== USER FEEDBACK ==========

export const saveFeedback = (userId, itemId, itemType, feedbackType, rating = null) =>
  api('/api/feedback', {
    method: 'POST',
    body: { userId, itemId, itemType, feedbackType, rating },
  })

export const getUserFeedback = (userId, itemType = null) =>
  api(`/api/feedback?userId=${userId}${itemType ? `&itemType=${itemType}` : ''}`)

export const getFeedbackForItem = (userId, itemId, itemType) =>
  api(`/api/feedback?userId=${userId}&itemId=${itemId}&itemType=${itemType}`)

// ========== RECOMMENDATION CACHE ==========

export const saveRecommendationCache = (userId, itemType, mode, recommendations, metadata = {}) =>
  api('/api/cache', {
    method: 'POST',
    body: { userId, itemType, mode, recommendations, metadata },
  })

export const getRecommendationCache = (userId, itemType, mode) =>
  api(`/api/cache?userId=${userId}&itemType=${itemType}&mode=${mode}`)

export const invalidateRecommendationCache = (userId, itemType = null) => {
  const params = new URLSearchParams({ userId })
  if (itemType) params.set('itemType', itemType)
  return api(`/api/cache?${params}`, { method: 'DELETE' })
}

export const cleanExpiredCache = () =>
  api('/api/cache?expired=true', { method: 'DELETE' })
