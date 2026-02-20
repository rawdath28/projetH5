import { supabase } from '../lib/supabase'

export const createJournalEntry = async (mood: string, note: string) => {
  const { data: userData } = await supabase.auth.getUser()

  if (!userData.user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('journal_entries')
    .insert([
      {
        user_id: userData.user.id,
        mood,
        note
      }
    ])

  if (error) throw error
  return data
}