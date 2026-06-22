import { apiClient } from './client'
import type { RedeemHistoryItem } from './redeem'

export interface LotteryStatus {
  threshold: number
  min_prize: number
  max_prize: number
  qualifying_amount: number
  qualifying_payment_amount: number
  qualifying_redeem_amount: number
  total_chances: number
  used_chances: number
  available_chances: number
  reward_amount: number
}

export interface LotteryDrawResult {
  state?: 'won' | 'no_chance' | 'pending_failed' | 'unauthorized'
  message?: string
  prize?: number
  code?: string
  new_balance?: number
  reward?: RedeemHistoryItem
  status: LotteryStatus
}

export const lotteryAPI = {
  getStatus() {
    return apiClient.get<LotteryStatus>('/lottery/status')
  },

  draw() {
    return apiClient.post<LotteryDrawResult>('/lottery/draw')
  },
}

export default lotteryAPI
