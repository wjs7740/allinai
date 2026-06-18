import { apiClient } from './client'

export type RankingSortBy = 'actual_cost' | 'tokens' | 'requests'
export type RankingRange = '24h' | '3d' | '7d' | '30d'

export interface StorefrontRankingItem {
  rank: number
  user_id: number
  display_name: string
  actual_cost: number
  requests: number
  tokens: number
  usage_share: number
  request_share: number
  token_share: number
}

export interface StorefrontRankingResponse {
  ranking: StorefrontRankingItem[]
  total_actual_cost: number
  total_requests: number
  total_tokens: number
  start_date: string
  end_date: string
  sort_by: RankingSortBy
}

export interface StorefrontRankingParams {
  range?: RankingRange
  sort_by?: RankingSortBy
  limit?: number
  start_date?: string
  end_date?: string
}

export async function getRanking(params?: StorefrontRankingParams): Promise<StorefrontRankingResponse> {
  const { data } = await apiClient.get<StorefrontRankingResponse>('/public/storefront/ranking', {
    params,
  })
  return data
}

export const storefrontAPI = {
  getRanking,
}

export default storefrontAPI
