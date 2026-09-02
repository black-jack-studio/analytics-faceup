/**
 * Supabase database types, matched by hand to faceup-server's shared/schema.ts (Drizzle).
 * Re-sync manually if that schema changes, or regenerate properly once you have CLI access:
 *
 *   npx supabase gen types typescript --project-id <project-ref> > src/lib/supabase/types.ts
 *
 * Only the columns this dashboard reads are listed — the real tables have more.
 */

type Table<Row> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      users: Table<{
        id: string
        username: string
        email: string
        created_at: string | null
        last_active_at: string | null
        coins: number | null
        gems: number | null
        selected_avatar_id: string | null
        membership_type: 'normal' | 'premium' | null
        subscription_expires_at: string | null
        subscription_cancel_at_period_end: boolean | null
        subscription_cancel_reason: string | null
        subscription_plan: string | null
        all_in_lose_streak: number | null
        privacy_settings: { dataCollection?: boolean } | null
        level: number | null
        xp: number | null
        season_xp: number | null
        current_streak_classic: number | null
        current_day_streak: number | null
        longest_day_streak: number | null
        referral_code: string | null
        referred_by: string | null
        referral_count: number | null
      }>
      gem_transactions: Table<{
        id: string
        user_id: string
        transaction_type: 'purchase' | 'reward' | 'spend' | 'refund'
        amount: number
        description: string
        created_at: string | null
      }>
      gem_purchases: Table<{
        id: string
        user_id: string
        item_type: 'avatar' | 'theme' | 'card_back' | 'coins' | 'boost'
        item_id: string
        gem_cost: number
        purchased_at: string | null
      }>
      game_stats: Table<{
        id: string
        user_id: string
        game_type: 'practice' | 'cash' | 'counting'
        hands_played: number | null
        hands_won: number | null
        hands_lost: number | null
        hands_pushed: number | null
        total_winnings: number | null
        total_losses: number | null
        blackjacks: number | null
        busts: number | null
        correct_decisions: number | null
        total_decisions: number | null
      }>
      seasons: Table<{
        id: string
        name: string
        start_date: string
        end_date: string
        max_xp: number | null
        is_active: boolean | null
      }>
      classic_streak_leaderboard: Table<{
        id: string
        user_id: string
        week_start_date: string
        best_streak: number
      }>
      weekly_xp_leaderboard: Table<{
        id: string
        user_id: string
        week_start_date: string
        weekly_xp: number
      }>
      user_reports: Table<{
        id: string
        reporter_id: string
        reported_id: string
        reason: string
        created_at: string | null
      }>
      blocked_users: Table<{
        id: string
        blocker_id: string
        blocked_id: string
        created_at: string | null
      }>
      active_games: Table<{
        id: string
        user_id: string
        mode: string
        status: 'in_progress' | 'completed'
        created_at: string | null
      }>
      game_tables: Table<{
        id: string
        host_user_id: string
        mode: string
        status: 'waiting' | 'betting' | 'in_progress' | 'closed'
        created_at: string | null
      }>
      table_invites: Table<{
        id: string
        table_id: string
        status: 'pending' | 'accepted' | 'declined' | 'expired'
        created_at: string | null
      }>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

export type UserRow = Database['public']['Tables']['users']['Row']
export type GemTransactionRow = Database['public']['Tables']['gem_transactions']['Row']
export type GemPurchaseRow = Database['public']['Tables']['gem_purchases']['Row']
export type GameStatsRow = Database['public']['Tables']['game_stats']['Row']
export type SeasonRow = Database['public']['Tables']['seasons']['Row']
