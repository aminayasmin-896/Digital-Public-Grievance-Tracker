import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const categoryIcons = {
  road: '🛣️',
  drainage: '🚰',
  water: '💧',
  electricity: '⚡',
  healthcare: '🏥',
  education: '🎓',
  other: '📋'
}

const statusConfig = {
  pending: { color: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
  'in-progress': { color: '#0FA4AF', bg: 'rgba(15,164,175,0.12)' },
  resolved: { color: '#4CAF88', bg: 'rgba(76,175,136,0.12)' },
  rejected: { color: '#FF7A6B', bg: 'rgba(255,122,107,0.12)' },
}

export default function PublicFeed() {
  const { user } = useAuth()

  const [grievances, setGrievances] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('latest')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/public/feed?sort=${sort}`)
        setGrievances(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [sort])

  const handleUpvote = async (id) => {
    if (!user) return alert('Login required')

    try {
      const { data } = await api.put(`/grievances/${id}/upvote`)

      setGrievances(prev =>
        prev.map(g =>
          g._id === id ? { ...g, upvotes: data.upvotes } : g
        )
      )
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>

      <h2>Public Feed</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        grievances.map(g => (
          <div key={g._id} style={{
            border: '1px solid #ccc',
            padding: '1rem',
            marginBottom: '1rem'
          }}>

            <h3>{g.title}</h3>
            <p>{g.description}</p>

            <p>Category: {g.category}</p>
            <p>Status: {g.status}</p>

            <button onClick={() => handleUpvote(g._id)}>
              👍 {g.upvotes || 0}
            </button>

          </div>
        ))
      )}

    </div>
  )
}