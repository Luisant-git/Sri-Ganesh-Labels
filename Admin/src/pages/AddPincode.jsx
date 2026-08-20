import React, { useState } from 'react'
import { ArrowLeft, MapPin, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { createPincode } from '../api/pincodeApi'
import * as XLSX from 'xlsx'
import '../styles/pages/add-pincode.scss'

const AddPincode = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [excelData, setExcelData] = useState([])
  const [pincodeSearch, setPincodeSearch] = useState('')
  const [showPincodeDropdown, setShowPincodeDropdown] = useState(false)
  const [formData, setFormData] = useState({
    pincode: '',
    city: '',
    state: '',
    deliveryCharge: '',
    deliveryTime: '',
    minOrderAmount: '',
    codAvailable: true,
    status: 'active'
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...formData,
        deliveryCharge: formData.deliveryCharge ? Number(formData.deliveryCharge) : 0,
        deliveryTime: formData.deliveryTime ? Number(formData.deliveryTime) : null,
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0
      }
      await createPincode(payload)
      navigate('/pincode-list')
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        console.log('Excel data:', jsonData)
        console.log('First row keys:', Object.keys(jsonData[0] || {}))
        setExcelData(jsonData)
      }
      reader.readAsArrayBuffer(file)
    }
  }

  return (
    <div className="add-pincode">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Add Pincode</h1>
          <p>Add a new delivery pincode</p>
        </div>
        <div className="header-actions">
          <label className="btn btn-success" style={{ cursor: 'pointer' }}>
            <Upload size={20} />
            Upload Pincode
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
            Back
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pincode-form">
        <div className="form-section">
          <div className="section-header">
            <h3>Pincode Information</h3>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Pincode *</label>
              <div className="input-with-icon">
                <MapPin className="input-icon" size={16} />
                {excelData.length > 0 ? (
                  <div className="searchable-dropdown">
                    <input
                      type="text"
                      className="form-input"
                      value={pincodeSearch}
                      onChange={(e) => {
                        const value = e.target.value
                        setPincodeSearch(value)
                        setFormData(prev => ({ ...prev, pincode: value }))
                        setShowPincodeDropdown(true)
                      }}
                      onFocus={() => setShowPincodeDropdown(true)}
                      placeholder="Search pincode..."
                      minLength="6"
                      maxLength="6"
                      required
                    />
                    {showPincodeDropdown && (
                      <div className="dropdown-options">
                        {[...new Set(excelData.map(item => item.Pincode || item.pincode || item.PINCODE))]
                          .filter(Boolean)
                          .filter(pincode => 
                            pincodeSearch === '' || pincode.toString().includes(pincodeSearch)
                          )
                          .map(pincode => (
                            <div
                              key={pincode}
                              className="dropdown-option"
                              onClick={() => {
                                const selected = excelData.find(item => 
                                  (item.Pincode || item.pincode || item.PINCODE) == pincode
                                )
                                if (selected) {
                                  const pincodeValue = (selected.Pincode || selected.pincode || selected.PINCODE).toString()
                                  setFormData(prev => ({
                                    ...prev,
                                    pincode: pincodeValue,
                                    city: selected.City || selected.city || selected.CITY || '',
                                    state: selected.State || selected.state || selected.STATE || ''
                                  }))
                                  setPincodeSearch(pincodeValue)
                                  setShowPincodeDropdown(false)
                                }
                              }}
                            >
                              {pincode}
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    value={formData.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    placeholder="Enter pincode"
                    maxLength="6"
                    required
                  />
                )}
                {showPincodeDropdown && (
                  <div 
                    className="dropdown-overlay" 
                    onClick={() => setShowPincodeDropdown(false)}
                  />
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">City *</label>
              {excelData.length > 0 ? (
                <select
                  className="form-select"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  required
                >
                  <option value="">Select City</option>
                  {[...new Set(excelData.map(item => item.City || item.city || item.CITY))].filter(Boolean).map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-input"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Enter city name"
                  required
                />
              )}
            </div>
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
              {excelData.length > 0 ? (
                [...new Set(excelData.map(item => item.State || item.state || item.STATE))].filter(Boolean).map(state => (
                  <option key={state} value={state}>{state}</option>
                ))
              ) : (
                <>
                  <option value="andhra-pradesh">Andhra Pradesh</option>
                  <option value="karnataka">Karnataka</option>
                  <option value="kerala">Kerala</option>
                  <option value="tamil-nadu">Tamil Nadu</option>
                  <option value="telangana">Telangana</option>
                  <option value="maharashtra">Maharashtra</option>
                  <option value="gujarat">Gujarat</option>
                  <option value="rajasthan">Rajasthan</option>
                  <option value="delhi">Delhi</option>
                  <option value="uttar-pradesh">Uttar Pradesh</option>
                </>
              )}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Minimum Order Amount (₹)</label>
            <input
              type="number"
              className="form-input"
              value={formData.minOrderAmount}
              onChange={(e) => {
                const value = e.target.value
                handleInputChange('minOrderAmount', value)
                if (Number(value) >= 999) {
                  handleInputChange('deliveryCharge', '0')
                }
              }}
              placeholder="0"
              min="0"
            />
            {Number(formData.minOrderAmount) >= 999 && (
              <small style={{ color: 'green', fontSize: '12px' }}>Free shipping available</small>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Delivery Charge (₹)
                {Number(formData.minOrderAmount) < 999 && <span style={{ color: 'red' }}> *</span>}
              </label>
              <input
                type="number"
                className="form-input"
                value={formData.deliveryCharge}
                onChange={(e) => handleInputChange('deliveryCharge', e.target.value)}
                placeholder={Number(formData.minOrderAmount) >= 999 ? "Free shipping" : "0"}
                min="0"
                required={Number(formData.minOrderAmount) < 999}
                disabled={Number(formData.minOrderAmount) >= 999}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Delivery Time (Days)</label>
              <select
                className="form-select"
                value={formData.deliveryTime}
                onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
              >
                <option value="">Select delivery time</option>
                <option value="1">1 Day</option>
                <option value="2">2 Days</option>
                <option value="3">3 Days</option>
                <option value="5">5 Days</option>
                <option value="7">7 Days</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="cod-available"
                checked={formData.codAvailable}
                onChange={(e) => handleInputChange('codAvailable', e.target.checked)}
              />
              <label htmlFor="cod-available">Cash on Delivery Available</label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Pincode'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddPincode
