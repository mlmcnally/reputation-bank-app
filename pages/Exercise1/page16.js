import { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'; 

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
        .eq('uuid', user.id)  // changed from user_id to uuid
        .single()

      if (data) setResponse(data.response)
    }

    getUserAndData()
  }, [])

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('exercise1_page16')
      .upsert({ uuid: userId, response })  // changed from user_id to uuid

    setLoading(false)

    if (error) {
      alert('Error saving your response.')
      console.error(error)
    } else {
      alert('Response saved!')
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Exercise 1 - Page 16</h1>
      <p>What do you want to be known for?</p>
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        rows={6}
        style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
      />
      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#0d6efd',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
