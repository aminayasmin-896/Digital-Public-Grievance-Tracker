import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const categories = ['road', 'drainage', 'water', 'electricity', 'healthcare', 'education', 'other']
const priorities = ['low', 'medium', 'high']

const keywordMap = {
  road: ['road', 'pothole', 'street', 'highway', 'bridge'],
  drainage: ['drain', 'waterlogging', 'flood', 'sewage'],
  water: ['water', 'pipeline', 'tap', 'supply'],
  electricity: ['electricity', 'power', 'light', 'powercut'],
  healthcare: ['hospital', 'doctor', 'clinic', 'health'],
  education: ['school', 'college', 'teacher', 'education'],
}

export default function SubmitGrievance() {
  const navigate = useNavigate()

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

  const [suggestedCategory, setSuggestedCategory] = useState('')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(false)

  // ✅ FEATURE 14 FIXED LOGIC
  const handleDescriptionChange = (value) => {
    let matched = ''
    const text = value.toLowerCase()

    Object.keys(keywordMap).forEach((cat) => {
      keywordMap[cat].forEach((word) => {
        if (text.includes(word)) {
          matched = cat
        }
      })
    })

    setForm(prev => ({
      ...prev,
      description: value,
      category: matched || prev.category
    }))

    setSuggestedCategory(matched)
  }

  const getLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setForm(prev => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            }
          }
        }))
        setLocating(false)
      },
      () => {
        setLocating(false)
        setError('Could not get location.')
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/grievances', form)
      setSuccess(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.')
    } finally {
      setLoading(false)
    }
  }

  const iStyle = {
    width: '100%',
    padding: '0.9rem 1.1rem',
    borderRadius: '9px',
    border: '1.5px solid rgba(15,164,175,0.2)',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none'
  }

  return (
    <div style={{ padding: '2rem' }}>

      {/* Title */}
      <input
        placeholder="Title"
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
        style={iStyle}
      />

      <br /><br />

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

      <br /><br />

      {/* Description (FEATURE 14 ACTIVE) */}
      <textarea
        rows={5}
        placeholder="Describe issue..."
        value={form.description}
        onChange={e => handleDescriptionChange(e.target.value)}
        style={iStyle}
      />

      {/* Suggestion UI */}
      {suggestedCategory && (
        <p style={{ color: 'green', marginTop: '5px' }}>
          Suggested Category: <b>{suggestedCategory}</b>
        </p>
      )}

      <br />

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

      <br /><br />

      {/* Submit */}
      <button onClick={handleSubmit}>
        Submit
      </button>

    </div>
  )
}