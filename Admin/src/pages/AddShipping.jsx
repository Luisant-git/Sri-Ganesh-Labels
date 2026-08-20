import React, { useState } from 'react'
import { ArrowLeft, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createShippingRule } from '../api/shippingApi'

const AddShipping = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    state: '',
    flatShippingRate: '',
    codAvailable: true
  })

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createShippingRule({
        state: formData.state,
        flatShippingRate: parseFloat(formData.flatShippingRate),
        codAvailable: formData.codAvailable
      })
      toast.success('Shipping created successfully!')
      navigate('/shipping-settings')
    } catch (error) {
      toast.error('Failed to create shipping: ' + error.message)
    }
  }

  return (
    <div className="add-coupon">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Add Shipping</h1>
          <p>Create a new shipping rule</p>
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
            Create Shipping
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddShipping