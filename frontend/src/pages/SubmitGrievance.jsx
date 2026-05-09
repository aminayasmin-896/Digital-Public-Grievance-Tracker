import { useState } from 'react'
import api from '../api/axios'

const categories = ['road', 'drainage', 'water', 'electricity', 'healthcare', 'education', 'other']
const priorities = ['low', 'medium', 'high']

const keywordMap = {
  road: ['road', 'pothole', 'street', 'bridge'],
  drainage: ['drain', 'flood', 'waterlogging', 'sewage'],
  water: ['water', 'pipeline', 'tap'],
  electricity: ['electricity', 'power', 'light', 'powercut'],
  healthcare: ['hospital', 'doctor', 'clinic'],
  education: ['school', 'college', 'teacher']
}

export default function SubmitGrievance() {

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'road',
    priority: 'medium',
    location: {
      address: '',
      coordinates: { lat: '', lng: '' }
    }
  })

  const [suggested, setSuggested] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  // 🟢 FIXED FEATURE 14 (SAFE VERSION)
  const handleDescriptionChange = (value) => {
    const text = value.toLowerCase()
    let matched = ''

    for (let cat in keywordMap) {
      if (keywordMap[cat].some(word => text.includes(word))) {
        matched = cat
        break
      }
    }

    setForm(prev => ({
      ...prev,
      description: value
      // ❗ category NOT auto-changing anymore (prevents UI breaking)
    }))

    setSuggested(matched)
  }

  // optional apply suggestion manually
  const applySuggestion = () => {
    if (suggested) {
      setForm(prev => ({
        ...prev,
        category: suggested
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/grievances', form)

      setSuccess(data)

      // reset form
      setForm({
        title: '',
        description: '',
        category: 'road',
        priority: 'medium',
        location: {
          address: '',
          coordinates: { lat: '', lng: '' }
        }
      })

    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed')
    } finally {
      setLoading(false)
    }
  }

  const iStyle = {
    width: '100%',
    padding: '0.9rem 1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    marginBottom: '10px'
  }

  return (
    <div style={{ padding: '2rem' }}>

      {/* IMPORTANT FIX: FORM WRAP */}
      <form onSubmit={handleSubmit}>

        {/* Title */}
        <input
          placeholder="Title"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          style={iStyle}
        />

        {/* Category */}
        <select
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          style={iStyle}
        >
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Description */}
        <textarea
          rows={5}
          placeholder="Describe issue..."
          value={form.description}
          onChange={e => handleDescriptionChange(e.target.value)}
          style={iStyle}
        />

        {/* Suggestion */}
        {suggested && (
          <div style={{ marginBottom: '10px' }}>
            <p>Suggested: <b>{suggested}</b></p>
            <button type="button" onClick={applySuggestion}>
              Apply Suggestion
            </button>
          </div>
        )}

        {/* Priority */}
        <select
          value={form.priority}
          onChange={e => setForm({ ...form, priority: e.target.value })}
          style={iStyle}
        >
          {priorities.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* Error */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Submit BUTTON FIXED */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            background: '#003135',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>

      </form>

      {/* SUCCESS */}
      {success && (
        <div style={{ marginTop: '10px', color: 'green' }}>
          Submitted Successfully! Tracking ID: {success.trackingId}
        </div>
      )}

    </div>
  )
}