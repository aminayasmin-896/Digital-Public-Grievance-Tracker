import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const categoryIcons = { road: '🛣️', drainage: '🚰', water: '💧', electricity: '⚡', healthcare: '🏥', education: '🎓', other: '📋' }
const statusConfig = {
  pending: { color: '#C9A84C', bg: 'rgba(201,168,76,0.12)' },
  'in-progress': { color: '#0FA4AF', bg: 'rgba(15,164,175,0.12)' },
  resolved: { color: '#4CAF88', bg: 'rgba(76,175,136,0.12)' },
  rejected: { color: '#FF7A6B', bg: 'rgba(255,122,107,0.12)' },
}
const priorityDot = { low: '#4CAF88', medium: '#C9A84C', high: '#FF7A6B' }

export default function PublicFeed() {
  const { user } = useAuth()
  const [grievances, setGrievances] = useState([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('latest')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [upvotingId, setUpvotingId] = useState(null)

  
  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({ sort })
        if (category) params.append('category', category)
        if (status) params.append('status', status)
        const { data } = await api.get(`/public/feed?${params}`)
        setGrievances(data)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchFeed()
  }, [sort, category, status])

  const handleUpvote = async (id) => {
    if (!user) return alert('Please sign in to upvote issues')
    setUpvotingId(id)
    try {
      const { data } = await api.put(`/grievances/${id}/upvote`)
      setGrievances(prev => prev.map(g => g._id === id ? { ...g, upvotes: data.upvotes } : g))
    } catch (err) { console.error(err) }
    finally { setUpvotingId(null) }
  }

  const getDaysAgo = (date) => {
    const days = Math.floor((Date.now() - new Date(date)) / 86400000)
    if (days === 0) return 'Today'; if (days === 1) return '1 day ago'; return `${days} days ago`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8F6F0' }}>
      <div style={{ background: '#003135', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(15,164,175,0.12) 0%, transparent 60%)', pointerEvents: 'none' }}/>
        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', color: '#0FA4AF', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: '700', marginBottom: '0.75rem' }}>Transparency</p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: '400', color: '#F8F6F0', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>Public Complaint Feed</h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.95rem', color: 'rgba(175,221,229,0.5)', fontWeight: '300' }}>All civic issues reported by citizens — transparent and publicly accessible without login</p>
        </div>
      </div>

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '1.75rem 2rem' }}>
        {/* Filters */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '1.75rem', border: '1.5px solid rgba(15,164,175,0.12)', boxShadow: '0 2px 16px rgba(0,49,53,0.05)', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[{ v: 'latest', l: 'Latest' }, { v: 'unresolved', l: 'Oldest Unresolved' }, { v: 'upvotes', l: 'Most Supported' }].map(({ v, l }) => (
              <button key={v} onClick={() => setSort(v)} style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', transition: 'all 0.2s', letterSpacing: '0.03em', fontWeight: '600', background: sort === v ? '#003135' : '#F8F6F0', color: sort === v ? '#0FA4AF' : '#7A9A9C', border: sort === v ? '1.5px solid rgba(15,164,175,0.3)' : '1.5px solid transparent' }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap', alignItems: 'center' }}>
            {[[category, setCategory, ['', 'road','drainage','water','electricity','healthcare','education','other'], 'All Categories'], [status, setStatus, ['', 'pending','in-progress','resolved','rejected'], 'All Statuses']].map(([val, set, opts, ph], i) => (
              <select key={i} value={val} onChange={e => set(e.target.value)} style={{ padding: '7px 12px', borderRadius: '8px', fontSize: '0.82rem', fontFamily: "'DM Sans', sans-serif", background: '#F8F6F0', border: '1.5px solid rgba(15,164,175,0.15)', color: '#003135', cursor: 'pointer', outline: 'none', fontWeight: '500' }}>
                {opts.map(o => <option key={o} value={o}>{o ? o.charAt(0).toUpperCase() + o.slice(1) : ph}</option>)}
              </select>
            ))}
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', color: '#7A9A9C', fontWeight: '500' }}>{grievances.length} issues</span>
          </div>
        </div>

        {/* Feed */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.6rem', color: '#003135', fontWeight: '400' }}>Loading feed...</div>
        ) : grievances.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem', fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.6rem', color: '#003135' }}>No issues match your filters</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {grievances.map((g) => {
              const sc = statusConfig[g.status] || statusConfig.pending
              return (
                <div key={g._id} style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', border: '1.5px solid rgba(15,164,175,0.1)', boxShadow: '0 2px 16px rgba(0,49,53,0.04)', transition: 'all 0.25s', display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}
                  onMouseOver={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(15,164,175,0.15)'; e.currentTarget.style.borderColor = 'rgba(15,164,175,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,49,53,0.04)'; e.currentTarget.style.borderColor = 'rgba(15,164,175,0.1)'; e.currentTarget.style.transform = 'translateY(0)' }}>

                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#F8F6F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0, border: '1.5px solid rgba(15,164,175,0.12)' }}>
                    {categoryIcons[g.category] || '📋'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: '700', color: '#003135', fontSize: '0.95rem' }}>{g.title}</h3>
                      <span style={{ fontSize: '0.75rem', padding: '3px 12px', borderRadius: '100px', background: sc.bg, color: sc.color, fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.04em', textTransform: 'capitalize', fontWeight: '700', flexShrink: 0 }}>
                        {g.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#7A9A9C', textTransform: 'capitalize', fontWeight: '500' }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: priorityDot[g.priority] }}/>
                        {g.priority} priority
                      </span>
                      {g.location?.address && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#7A9A9C', fontWeight: '400' }}>📍 {g.location.address}</span>}
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#7A9A9C' }}>{getDaysAgo(g.createdAt)}</span>
                      {g.submittedBy?.name && <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', color: '#7A9A9C' }}>by {g.submittedBy.name}</span>}
                    </div>
                  </div>

                  <button onClick={() => handleUpvote(g._id)} disabled={upvotingId === g._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid rgba(15,164,175,0.2)', background: 'rgba(15,164,175,0.05)', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0, opacity: upvotingId === g._id ? 0.6 : 1 }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(15,164,175,0.15)'; e.currentTarget.style.borderColor = '#0FA4AF' }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(15,164,175,0.05)'; e.currentTarget.style.borderColor = 'rgba(15,164,175,0.2)' }}>
                    <span style={{ fontSize: '1rem', color: '#0FA4AF' }}>▲</span>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.82rem', fontWeight: '700', color: '#0FA4AF' }}>{g.upvotes || 0}</span>
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}