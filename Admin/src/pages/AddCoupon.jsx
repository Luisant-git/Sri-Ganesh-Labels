import React, { useState, useEffect } from 'react'
import { ArrowLeft, Percent, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createCoupon, searchCustomersByPhone } from '../api/couponApi'
import '../styles/pages/add-coupon.scss'

const AddCoupon = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscount: '',
    usageLimit: '',
    perUserLimit: '1',
    expiryDate: '',
    isActive: true,
    isHiddenFromUser: false,
    applyTo: ['subtotal'],
    excludeOfferProducts: false,
    specificUserIds: []
  })
  const [phoneSearch, setPhoneSearch] = useState('')
  const [customerResults, setCustomerResults] = useState([])
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (phoneSearch.length >= 3) {
        searchCustomers()
      } else {
        setCustomerResults([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [phoneSearch])

  const searchCustomers = async () => {
    try {
      const results = await searchCustomersByPhone(phoneSearch)
      setCustomerResults(results)
      setShowDropdown(true)
    } catch (error) {
      console.error('Failed to search customers:', error)
    }
  }

  const selectCustomer = (customer) => {
    if (!selectedCustomers.find(c => c.id === customer.id)) {
      const newCustomers = [...selectedCustomers, customer]
      setSelectedCustomers(newCustomers)
      handleInputChange('specificUserIds', newCustomers.map(c => c.id))
    }
    setPhoneSearch('')
    setShowDropdown(false)
  }

  const removeCustomer = (id) => {
    const newCustomers = selectedCustomers.filter(c => c.id !== id)
    setSelectedCustomers(newCustomers)
    handleInputChange('specificUserIds', newCustomers.map(c => c.id))
  }

  const generateCouponCode = () => {
    const code = 'SAVE' + Math.random().toString(36).substr(2, 6).toUpperCase()
    handleInputChange('code', code)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        code: formData.code,
        type: formData.type,
        value: parseFloat(formData.value),
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        perUserLimit: parseInt(formData.perUserLimit) || 1,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        isActive: formData.isActive,
        isHiddenFromUser: formData.isHiddenFromUser,
        applyTo: formData.applyTo,
        excludeOfferProducts: formData.excludeOfferProducts,
        specificUserIds: formData.specificUserIds
      }
      await createCoupon(data)
      toast.success('Coupon created successfully!')
      navigate('/coupon-list')
    } catch (error) {
      toast.error('Failed to create coupon: ' + error.message)
    }
  }

  return (
    <div className="add-coupon">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Add Coupon</h1>
          <p>Create a new discount coupon</p>
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
              <h3>Coupon Details</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Coupon Code *</label>
              <div className="input-with-button">
                <input
                  type="text"
                  className="form-input"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  required
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={generateCouponCode}
                >
                  Generate
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Customer Specific (Optional)</label>
              <div className="customer-search-wrapper">
                <div className="selected-customers-pills" style={{display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px'}}>
                  {selectedCustomers.map(customer => (
                    <div key={customer.id} className="selected-customer-info" style={{margin: 0, display: 'flex', alignItems: 'center', gap: '4px'}}>
                      {customer.name || 'N/A'} ({customer.phone})
                      <button type="button" className="clear-customer-btn" onClick={() => removeCustomer(customer.id)} style={{position: 'static', padding: '2px', background: 'none', border: 'none', cursor: 'pointer'}}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  className="form-input"
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  onFocus={() => phoneSearch.length >= 3 && setShowDropdown(true)}
                  placeholder="Search by phone number to add customers"
                />
                {showDropdown && customerResults.length > 0 && (
                  <div className="customer-dropdown">
                    {customerResults.map((customer) => (
                      <div
                        key={customer.id}
                        className="customer-option"
                        onClick={() => selectCustomer(customer)}
                      >
                        <div className="customer-name">{customer.name || 'N/A'}</div>
                        <div className="customer-phone">{customer.phone}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <small className="form-hint">Leave empty for general coupon available to all users</small>
            </div>



            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Discount Type *</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Discount Value *</label>
                <div className="input-with-icon">
                  {formData.type === 'percentage' ? (
                    <Percent className="input-icon" size={16} />
                  ) : (
                    <span className="input-icon">₹</span>
                  )}
                  <input
                    type="number"
                    className="form-input"
                    value={formData.value}
                    onChange={(e) => handleInputChange('value', e.target.value)}
                    placeholder={formData.type === 'percentage' ? '10' : '100'}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group full-width">
              <label className="form-label">Apply Discount To *</label>
              <div className="checkbox-group" style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={formData.applyTo.includes('subtotal')}
                    onChange={(e) => {
                      const newApplyTo = e.target.checked
                        ? [...formData.applyTo, 'subtotal']
                        : formData.applyTo.filter(t => t !== 'subtotal');
                      handleInputChange('applyTo', newApplyTo);
                    }}
                  />
                  Subtotal
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={formData.applyTo.includes('delivery')}
                    onChange={(e) => {
                      const newApplyTo = e.target.checked
                        ? [...formData.applyTo, 'delivery']
                        : formData.applyTo.filter(t => t !== 'delivery');
                      handleInputChange('applyTo', newApplyTo);
                    }}
                  />
                  Delivery Fee
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={formData.applyTo.includes('cod')}
                    onChange={(e) => {
                      const newApplyTo = e.target.checked
                        ? [...formData.applyTo, 'cod']
                        : formData.applyTo.filter(t => t !== 'cod');
                      handleInputChange('applyTo', newApplyTo);
                    }}
                  />
                  COD Fee
                </label>
              </div>
            </div>

            <div className="form-group full-width" style={{ marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={formData.excludeOfferProducts}
                  onChange={(e) => handleInputChange('excludeOfferProducts', e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                />
                Exclude “Mark as Offer Product” items from coupon discount
              </label>
              <small style={{ display: 'block', marginTop: '4px', color: '#6b7280', fontSize: '12px' }}>
                If enabled, coupon discount will only be applied to non-offer products. Offer products remain at their existing price.
              </small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Minimum Order Amount</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.minOrderAmount}
                  onChange={(e) => handleInputChange('minOrderAmount', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Maximum Discount</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.maxDiscount}
                  onChange={(e) => handleInputChange('maxDiscount', e.target.value)}
                  placeholder="No limit"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Usage Limits & Validity</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Total Usage Limit</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.usageLimit}
                  onChange={(e) => handleInputChange('usageLimit', e.target.value)}
                  placeholder="Unlimited"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Usage Per Customer</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.perUserLimit}
                  onChange={(e) => handleInputChange('perUserLimit', e.target.value)}
                  placeholder="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => handleInputChange('isActive', e.target.value === 'active')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
              <input
                type="checkbox"
                id="isHiddenFromUser"
                checked={formData.isHiddenFromUser}
                onChange={(e) => handleInputChange('isHiddenFromUser', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="isHiddenFromUser" className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                Hide from User Panel
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/coupon-list')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Create Coupon
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddCoupon
