import React, { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getShippingRules, updateShippingRule } from '../api/shippingApi'

const EditShipping = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    state: '',
    flatShippingRate: '',
    codAvailable: true
  })

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ]

  useEffect(() => {
    fetchShippingRule()
  }, [id])

  const fetchShippingRule = async () => {
    try {
      const data = await getShippingRules()
      const rule = data.find(r => r.id === parseInt(id))
      if (rule) {
        // Convert database format (TAMIL_NADU) to display format (Tamil Nadu)
        const stateDisplay = rule.state
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
          .replace(/And/g, 'and')
        
        setFormData({
          state: stateDisplay,
          flatShippingRate: rule.flatShippingRate,
          codAvailable: rule.codAvailable ?? true
        })
      }
    } catch (error) {
      toast.error('Failed to fetch shipping rule')
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Convert display format (Tamil Nadu) back to database format (TAMIL_NADU)
      const stateEnum = formData.state
        .toUpperCase()
        .replace(/ /g, '_')
        .replace(/AND/g, 'AND')
      
      await updateShippingRule(id, {
        state: stateEnum,
        flatShippingRate: parseFloat(formData.flatShippingRate),
        codAvailable: formData.codAvailable
      })
      toast.success('Shipping updated successfully!')
      navigate('/shipping-settings')
    } catch (error) {
      toast.error('Failed to update shipping: ' + error.message)
    }
  }

  return (
    <div className="add-coupon">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Edit Shipping</h1>
          <p>Update shipping rule</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="coupon-form">
        <div className="form-grid">
          <div className="form-section">
            <div className="section-header">
              <h3>Shipping Details</h3>
            </div>

            <div className="form-group">
              <label className="form-label">State *</label>
              <select
                className="form-select"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                required
              >
                <option value="">Select State</option>
                {indianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Flat Shipping Rate (₹) *</label>
              <div className="input-with-icon">
                <span className="input-icon">₹</span>
                <input
                  type="number"
                  className="form-input"
                  value={formData.flatShippingRate}
                  onChange={(e) => handleInputChange('flatShippingRate', e.target.value)}
                  placeholder="Enter flat shipping rate"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={formData.codAvailable}
                  onChange={(e) => handleInputChange('codAvailable', e.target.checked)}
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                COD Available for this State
              </label>
              <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                Uncheck this to disable Cash on Delivery for all orders to this state
              </p>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/shipping-settings')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Update Shipping
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditShipping
