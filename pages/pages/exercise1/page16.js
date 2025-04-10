import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabaseClient'

export default function Exercise1Page16() {
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState(null)

  useEffect(() => {
    const getUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user.id)

      const { data, error } = await supabase
        .from('exercise1_page16')
        .select('response')
        .eq('user_id', user.id)
        .single()

      if (data) setResponse(data.response)
    }

    getUserAndData()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('exercise1_page16')
      .upsert({ user_id: userId, response })

    setLoading(false)

    if (error) {
      alert('Error saving your response.')
      console.error(error)
    } else {
      alert('Response saved!')
    }
  }

  return (
    <div style={{
