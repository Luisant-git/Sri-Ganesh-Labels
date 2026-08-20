import React, { useState } from 'react'
import { ArrowLeft, Plus, X } from 'lucide-react'

const CreateCombo = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discount: '',
    discountType: 'percentage',
    validUntil: '',
    status: 'active'
  })
  const [selectedProducts, setSelectedProducts] = useState([])

  const products = [
    { id: 1, name: 'Classic Crew Neck T-Shirt', price: 499 },
    { id: 2, name: 'Graphic Print T-Shirt', price: 599 },
    { id: 3, name: 'Slim Fit Chinos', price: 1299 },
    { id: 4, name: 'Performance Joggers', price: 1099 }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addProduct = (product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(prev => [...prev, product])
    }
  }

  const removeProduct = (productId) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))
  }

  const calculateTotal = () => {
    return selectedProducts.reduce((sum, product) => sum + product.price, 0)
  }

  const calculateOfferPrice = () => {
    const total = calculateTotal()
    if (formData.discountType === 'percentage') {
      return total - (total * (formData.discount / 100))
    }
    return total - formData.discount
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Combo data:', { ...formData, products: selectedProducts })
  }

  return (
    <div className="create-combo">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Create Combo Offer</h1>
          <p>Bundle products together with special pricing</p>
        </div>
        <button className="btn btn-outline" onClick={() => window.history.back()}>
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="combo-form">
        <div className="form-grid">
          <div className="form-section">
            <h3>Combo Information</h3>
            
            <div className="form-group">
              <label className="form-label">Combo Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter combo name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter combo description"
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Discount Type</label>
                <select
                  className="form-select"
                  value={formData.discountType}
                  onChange={(e) => handleInputChange('discountType', e.target.value)}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Discount Value *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.discount}
                  onChange={(e) => handleInputChange('discount', e.target.value)}
                  placeholder={formData.discountType === 'percentage' ? '15' : '100'}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Valid Until</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.validUntil}
                  onChange={(e) => handleInputChange('validUntil', e.target.value)}
                />
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
          </div>

          <div className="form-section">
            <h3>Select Products</h3>
            
            <div className="product-selection">
              <div className="available-products">
                <h4>Available Products</h4>
                {products.map(product => (
                  <div key={product.id} className="product-item">
                    <span>{product.name} - ₹{product.price}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => addProduct(product)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="selected-products">
                <h4>Selected Products ({selectedProducts.length})</h4>
                {selectedProducts.map(product => (
                  <div key={product.id} className="selected-product">
                    <span>{product.name} - ₹{product.price}</span>
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeProduct(product.id)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {selectedProducts.length > 0 && (
              <div className="pricing-summary">
                <div className="price-row">
                  <span>Original Price:</span>
                  <span>₹{calculateTotal()}</span>
                </div>
                <div className="price-row">
                  <span>Discount:</span>
                  <span>
                    {formData.discountType === 'percentage' ? `${formData.discount}%` : `₹${formData.discount}`}
                  </span>
                </div>
                <div className="price-row total">
                  <span>Offer Price:</span>
                  <span>₹{Math.round(calculateOfferPrice())}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline">
            Save as Draft
          </button>
          <button type="submit" className="btn btn-primary">
            Create Combo
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateCombo