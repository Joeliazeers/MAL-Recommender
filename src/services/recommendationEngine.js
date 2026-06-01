const rpc = async (fn, body) => {
  const res = await fetch(`/api/rpc?fn=${fn}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) return []
  return res.json()
}

export const findSimilarUsers = async (userId, itemType = 'anime', minSimilarity = 0.2) => {
  try {
    const data = await rpc('match_similar_users', {
      target_user_id: userId,
      item_type: itemType,
      min_similarity: minSimilarity,
      limit_count: 10,
    })
    return (data || []).map(row => ({
      userId: row.user_id,
      similarity: row.similarity,
      sharedLikes: row.shared_likes,
    }))
  } catch (error) {
    console.error('Error finding similar users:', error)
    return []
  }
}

export const getCollaborativeRecommendations = async (userId, itemType = 'anime', userListIds = [], limit = 10) => {
  try {
    const data = await rpc('get_collaborative_recommendations', {
      target_user_id: userId,
      item_type: itemType,
      user_list_ids: userListIds,
      limit_count: limit,
    })
    return (data || []).map(row => ({
      itemId: row.item_id,
      score: row.score,
      count: row.liked_by_count,
      avgSimilarity: row.liked_by_count > 0 ? row.score / row.liked_by_count : 0,
    }))
  } catch (error) {
    console.error('Error getting collaborative recommendations:', error)
    return []
  }
}

export const createHybridRecommendations = (contentBased = [], collaborative = [], contentWeight = 0.7) => {
  const collabWeight = 1 - contentWeight
  const itemScores = {}

  contentBased.forEach((item, index) => {
    const score = (contentBased.length - index) / contentBased.length
    itemScores[item.id] = {
      ...item,
      contentScore: score * contentWeight,
      collabScore: 0,
      hybridScore: score * contentWeight,
    }
  })

  if (collaborative.length > 0) {
    const maxScore = Math.max(...collaborative.map(r => r.score || 1))
    collaborative.forEach(rec => {
      const normalizedScore = rec.score / maxScore
      if (itemScores[rec.itemId]) {
        itemScores[rec.itemId].collabScore = normalizedScore * collabWeight
        itemScores[rec.itemId].hybridScore += normalizedScore * collabWeight
      }
    })
  }

  return Object.values(itemScores).sort((a, b) => b.hybridScore - a.hybridScore)
}
