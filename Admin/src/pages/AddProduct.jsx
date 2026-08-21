import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { createProduct, getCategories, uploadImage } from '../api'
import QuantityPricingEditor from '../components/QuantityPricingEditor'

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    basePrice: '',
    gstPercentage: 18,
    hsnCode: '',
    weight: '',
    gallery: [],
    quantityPrices: [],
    status: 'active',
    newArrivals: false,
    discount: false
  })

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    for (const file of files) {
      try {
        const uploadResult = await uploadImage(file)
        setFormData(prev => ({
          ...prev,
          gallery: [...prev.gallery, { url: uploadResult.url }]
        }))
        toast.success('Gallery image uploaded!')
      } catch (err) {
        toast.error('Failed to upload image')
      }
    }
    e.target.value = ''
  }

  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }))
  }

  const buildQuantityPrices = () => {
    const rows = formData.quantityPrices
    const cleaned = []
    for (const row of rows) {
      const qty = parseInt(row.quantity, 10)
      const price = parseFloat(row.price)
      const empty = (!row.quantity && !row.price) || row.quantity === '' || row.price === ''
      if (empty) continue
      if (!qty || qty < 1) return { error: 'Quantity must be a whole number of at least 1' }
      if (isNaN(price) || price < 0) return { error: `Enter a valid rate for quantity ${qty}` }
      if (cleaned.some(t => t.quantity === qty)) return { error: `Duplicate quantity ${qty} in quantity pricing` }
      cleaned.push({ quantity: qty, price: price.toFixed(2) })
    }
    cleaned.sort((a, b) => a.quantity - b.quantity)
    return { value: cleaned }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to load form data');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const tiers = buildQuantityPrices()
      if (tiers.error) {
        toast.error(tiers.error)
        setLoading(false)
        return
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        basePrice: formData.basePrice,
        gstPercentage: parseFloat(formData.gstPercentage) || 0,
        hsnCode: formData.hsnCode || null,
        weight: parseFloat(formData.weight) || 0,
        gallery: formData.gallery,
        quantityPrices: tiers.value,
        status: formData.status
      };

      await createProduct(productData);
      toast.success('Product created successfully!');
      navigate('/product-list');

      // Reset form
      setFormData({
        name: '',
        description: '',
        categoryId: '',
        basePrice: '',
        gstPercentage: 18,
        hsnCode: '',
        weight: '',
        gallery: [],
        quantityPrices: [],
        status: 'active',
        newArrivals: false,
        discount: false
      });
    } catch (err) {
      const errorMsg = err.message || 'Failed to create product';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-product">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Add Product</h1>
          <p>Create a new product for your store</p>
        </div>
        <button type="submit" form="product-form" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating Product...' : 'Publish Product'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      <form id="product-form" onSubmit={handleSubmit} className="product-form">
        <div className="form-grid">
          <div className="form-section">
            <div className="section-header">
              <h3>Basic Information</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter product description"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Pricing</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Rate *</label>
              <input
                type="text"
                className="form-input"
                value={formData.basePrice}
                onChange={(e) => handleInputChange('basePrice', e.target.value)}
                placeholder="499.00"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">GST Percentage (%)</label>
              <input
                type="number"
                className="form-input"
                value={formData.gstPercentage}
                onChange={(e) => handleInputChange('gstPercentage', e.target.value)}
                placeholder="18"
                min="0"
                max="100"
                step="0.01"
              />
            </div>

            {(() => {
              const rate = parseFloat(formData.basePrice) || 0
              const gstPct = parseFloat(formData.gstPercentage) || 0
              const gstAmount = (rate * gstPct) / 100
              const totalValue = rate + gstAmount
              return (
                <div className="form-group" style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                    Calculated Price
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '3px 0' }}>
                    <span style={{ color: '#6b7280' }}>Rate (excl. GST)</span>
                    <span style={{ fontWeight: 600 }}>₹{rate.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '3px 0' }}>
                    <span style={{ color: '#6b7280' }}>GST ({gstPct}%)</span>
                    <span style={{ fontWeight: 600 }}>₹{gstAmount.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '6px 0 0', borderTop: '1px solid #e5e7eb', marginTop: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#111827' }}>Total (incl. GST)</span>
                    <span style={{ fontWeight: 700, color: '#166534' }}>₹{totalValue.toFixed(2)}</span>
                  </div>
                </div>
              )
            })()}

            <div className="form-group">
              <label className="form-label">HSN Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.hsnCode}
                onChange={(e) => handleInputChange('hsnCode', e.target.value)}
                placeholder="Enter HSN code (optional)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input
                type="number"
                className="form-input"
                min="0"
                step="0.001"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                placeholder="Enter weight in kg (used for shipping)"
              />
            </div>
          </div>

        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'stretch' }}>
          <div className="form-section" style={{ width: '480px', maxWidth: '100%' }}>
            <div className="section-header">
              <h3>Quantity Pricing</h3>
            </div>

            <QuantityPricingEditor
              tiers={formData.quantityPrices}
              onChange={(tiers) => handleInputChange('quantityPrices', tiers)}
              gstPercentage={formData.gstPercentage}
            />
          </div>

          <div className="form-section" style={{ flex: 1, minWidth: '300px' }}>
            <div className="section-header">
              <h3>Gallery Images</h3>
            </div>

          <div className="image-upload-section">
            <div className="image-upload-area" onClick={() => document.getElementById('gallery-upload').click()}>
              <input
                type="file"
                id="gallery-upload"
                multiple
                accept="image/*"
                onChange={handleGalleryUpload}
                className="image-input"
              />
              <label htmlFor="gallery-upload" className="upload-label">
                <Upload size={48} />
                <p>Click to upload gallery images</p>
                <span>PNG, JPG up to 5MB (Multiple files)</span>
              </label>
            </div>

            {formData.gallery.length > 0 && (
              <div className="image-preview-grid">
                {formData.gallery.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img src={image.url} alt="Gallery" />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeGalleryImage(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>

      </form>
    </div>
  )
}

export default AddProduct