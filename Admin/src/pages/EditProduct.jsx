import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Upload, X, Plus, Edit } from 'lucide-react'
import { toast } from 'react-toastify'
import { ColorPicker } from 'antd'
import { getProduct, updateProduct, getCategories, getSubCategories, getBrands, uploadImage } from '../api'

const EditProduct = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    subCategoryId: '',
    brandId: '',
    mrp: '',
    basePrice: '',
    hsnCode: '',
    bundleOffers: [],
    tags: [],
    gallery: [],
    colors: [],
    status: 'active',
    newArrivals: false,
    discount: false
  })

  const [newTag, setNewTag] = useState('')
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingColorIndex, setEditingColorIndex] = useState(null)
  const [currentColor, setCurrentColor] = useState({ name: '', code: '#000000', images: [], sizes: [] })
  const [currentSize, setCurrentSize] = useState({ size: '', price: '', quantity: 0, sizeVariantId: '' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productData, categoriesData, subCategoriesData, brandsData] = await Promise.all([
          getProduct(id),
          getCategories(),
          getSubCategories(),
          getBrands()
        ])
        
        setFormData({
          ...productData,
          bundleOffers: productData.bundleOffers || [],
          tags: productData.tags || [],
          gallery: productData.gallery || [],
          colors: productData.colors || [],
          newArrivals: productData.newArrivals || false,
          discount: productData.discount || false
        })
        setCategories(categoriesData)
        setSubCategories(subCategoriesData)
        setBrands(brandsData)
      } catch (err) {
        toast.error('Failed to load product data')
        navigate('/product-list')
      }
    }
    fetchData()
  }, [id, navigate])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

  const handleColorImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return
    
    for (const file of files) {
      try {
        const uploadResult = await uploadImage(file)
        setCurrentColor(prev => ({
          ...prev,
          images: [...prev.images, uploadResult.url]
        }))
        toast.success('Color image uploaded!')
      } catch (err) {
        toast.error('Failed to upload image')
      }
    }
    e.target.value = ''
  }

  const addSize = () => {
    if (currentSize.size && currentSize.price) {
      setCurrentColor(prev => ({
        ...prev,
        sizes: [...prev.sizes, { ...currentSize, quantity: parseInt(currentSize.quantity) || 0 }]
      }))
      setCurrentSize({ size: '', price: '', quantity: 0, sizeVariantId: '' })
    }
  }

  const updateSizeField = (index, field, value) => {
    const updatedSizes = [...currentColor.sizes]
    updatedSizes[index] = { ...updatedSizes[index], [field]: value }
    setCurrentColor(prev => ({ ...prev, sizes: updatedSizes }))
  }

  const addColor = () => {
    if (currentColor.name && currentColor.code && currentColor.sizes.length > 0) {
      const colorData = {
        name: currentColor.name,
        code: currentColor.code,
        image: currentColor.images[0] || '',
        sizes: currentColor.sizes.map(({ size, price, quantity, sizeVariantId }) => ({ size, price, quantity, sizeVariantId }))
      }
      
      if (editingColorIndex !== null) {
        const newColors = [...formData.colors]
        newColors[editingColorIndex] = colorData
        setFormData(prev => ({ ...prev, colors: newColors }))
        setEditingColorIndex(null)
      } else {
        setFormData(prev => ({
          ...prev,
          colors: [...prev.colors, colorData]
        }))
      }
      setCurrentColor({ name: '', code: '', images: [], sizes: [] })
    }
  }

  const editColor = (index) => {
    const color = formData.colors[index]
    setCurrentColor({
      name: color.name,
      code: color.code,
      images: color.image ? [color.image] : [],
      sizes: color.sizes || []
    })
    setEditingColorIndex(index)
  }

  const cancelEditColor = () => {
    setCurrentColor({ name: '', code: '', images: [], sizes: [] })
    setEditingColorIndex(null)
  }

  const removeColor = (index) => {
    if (editingColorIndex === index) {
      cancelEditColor()
    }
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }))
  }

  const removeSizeFromCurrentColor = (sizeIndex) => {
    setCurrentColor(prev => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== sizeIndex)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const productData = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        subCategoryId: formData.subCategoryId ? parseInt(formData.subCategoryId) : null,
        brandId: formData.brandId ? parseInt(formData.brandId) : null
      }
      
      await updateProduct(id, productData)
      toast.success('Product updated successfully!')
      navigate('/product-list')
    } catch (err) {
      toast.error('Failed to update product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-product">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Edit Product</h1>
          <p>Update product information</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button" 
            onClick={() => navigate('/product-list')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button type="submit" form="product-form" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </div>
      
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

            <div className="form-row">
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

              <div className="form-group">
                <label className="form-label">Sub Category</label>
                <select
                  className="form-select"
                  value={formData.subCategoryId}
                  onChange={(e) => handleInputChange('subCategoryId', e.target.value)}
                >
                  <option value="">Select Sub Category</option>
                  {subCategories
                    .filter(sub => !formData.categoryId || sub.categoryId === parseInt(formData.categoryId))
                    .map(subCategory => (
                      <option key={subCategory.id} value={subCategory.id}>
                        {subCategory.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Brand</label>
              <select
                className="form-select"
                value={formData.brandId}
                onChange={(e) => handleInputChange('brandId', e.target.value)}
              >
                <option value="">Select Brand</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
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

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.newArrivals}
                  onChange={(e) => handleInputChange('newArrivals', e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span className="form-label" style={{ margin: 0 }}>Mark as New Arrival</span>
              </label>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.discount}
                  onChange={(e) => handleInputChange('discount', e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span className="form-label" style={{ margin: 0 }}>Mark as Offer Product</span>
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Pricing</h3>
            </div>

            <div className="form-group">
              <label className="form-label">MRP</label>
              <input
                type="text"
                className="form-input"
                value={formData.mrp || ''}
                onChange={(e) => handleInputChange('mrp', e.target.value)}
                placeholder="599.00"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Selling Price *</label>
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
              <label className="form-label">HSN Code</label>
              <input
                type="text"
                className="form-input"
                value={formData.hsnCode || ''}
                onChange={(e) => handleInputChange('hsnCode', e.target.value)}
                placeholder="Enter HSN code (optional)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bundle Offers</label>
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <div style={{ marginBottom: '12px', fontSize: '14px', color: '#6b7280' }}>Set special prices for multiple color selections</div>
                {(formData.bundleOffers || []).map((offer, index) => (
                  <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ minWidth: '80px', fontSize: '14px' }}>{offer.colorCount} Color{offer.colorCount > 1 ? 's' : ''}:</span>
                    <input
                      type="text"
                      value={offer.price}
                      onChange={(e) => {
                        const newOffers = [...(formData.bundleOffers || [])]
                        newOffers[index].price = e.target.value
                        handleInputChange('bundleOffers', newOffers)
                      }}
                      placeholder="Price"
                      style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newOffers = (formData.bundleOffers || []).filter((_, i) => i !== index)
                        handleInputChange('bundleOffers', newOffers)
                      }}
                      style={{ padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const currentOffers = formData.bundleOffers || []
                    const nextColorCount = currentOffers.length + 2
                    handleInputChange('bundleOffers', [...currentOffers, { colorCount: nextColorCount, price: '' }])
                  }}
                  style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px' }}
                >
                  <Plus size={16} /> Add Bundle Offer
                </button>
              </div>
            </div>
          </div>
        </div>



          <div className="form-section">
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
  

        <div className="form-section">
          <div className="section-header">
            <h3>Colors & Sizes</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Add product variants with different colors and sizes</p>
          </div>

          <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>Color Information</h4>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Color Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentColor.name}
                    onChange={(e) => setCurrentColor(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Red, Blue, Black"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <ColorPicker
                      value={currentColor.code}
                      onChange={(color) => setCurrentColor(prev => ({ ...prev, code: color.toHexString() }))}
                      defaultFormat="hex"
                      showText
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Color Images (Optional)</label>
                <div className="color-image-upload">
                  <div className="color-upload-area" onClick={() => document.getElementById('color-image-upload').click()}>
                    <input
                      type="file"
                      id="color-image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleColorImageUpload}
                      style={{ display: 'none' }}
                    />
                    <Upload size={32} />
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Upload color images</span>
                  </div>
                  {currentColor.images.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {currentColor.images.map((img, i) => (
                        <div key={i} className="color-image-preview">
                          <img src={img} alt={`Color ${i + 1}`} />
                          <button
                            type="button"
                            onClick={() => setCurrentColor(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                            className="remove-color-image"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>Sizes</h4>
              
              {currentColor.sizes.map((size, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 120px 120px 140px 70px', gap: '12px', alignItems: 'end', marginBottom: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '13px' }}>Size</label>
                    <select
                      className="form-select"
                      value={size.size}
                      onChange={(e) => updateSizeField(i, 'size', e.target.value)}
                      style={{ height: '42px' }}
                    >
                      <option value="">Select</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                      <option value="XXXL">XXXL</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '13px' }}>Price</label>
                    <input
                      type="text"
                      className="form-input"
                      value={size.price}
                      onChange={(e) => updateSizeField(i, 'price', e.target.value)}
                      placeholder="499.00"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '13px' }}>Quantity</label>
                    <input
                      type="number"
                      className="form-input"
                      value={size.quantity}
                      onChange={(e) => updateSizeField(i, 'quantity', e.target.value)}
                      placeholder="10"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '13px' }}>Variant ID</label>
                    <input
                      type="text"
                      className="form-input"
                      value={size.sizeVariantId}
                      onChange={(e) => updateSizeField(i, 'sizeVariantId', e.target.value)}
                      placeholder="123456"
                    />
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <button
                      type="button"
                      onClick={() => removeSizeFromCurrentColor(i)}
                      className="btn btn-secondary"
                      style={{ height: '42px', padding: '0 10px', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '100px 120px 120px 140px 70px', gap: '12px', alignItems: 'end' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '13px' }}>Size</label>
                  <select
                    className="form-select"
                    value={currentSize.size}
                    onChange={(e) => setCurrentSize(prev => ({ ...prev, size: e.target.value }))}
                    style={{ height: '42px' }}
                  >
                    <option value="">Select Size</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="XXXL">XXXL</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '13px' }}>Price</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentSize.price}
                    onChange={(e) => setCurrentSize(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="499.00"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '13px' }}>Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={currentSize.quantity}
                    onChange={(e) => setCurrentSize(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="10"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: '13px' }}>Variant ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={currentSize.sizeVariantId}
                    onChange={(e) => setCurrentSize(prev => ({ ...prev, sizeVariantId: e.target.value }))}
                    placeholder="123456"
                  />
                </div>
                <div style={{ marginBottom: '18px' }}>
                  <button type="button" onClick={addSize} className="btn btn-secondary" style={{ height: '42px', padding: '0 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '13px' }}>
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px' }}>
              <button 
                type="button" 
                onClick={addColor} 
                className="btn btn-primary"
                disabled={!currentColor.name || !currentColor.code || currentColor.sizes.length === 0}
                style={{ padding: '10px 20px', fontSize: '14px' }}
              >
                <Plus size={16} /> {editingColorIndex !== null ? 'Update Color Variant' : 'Add Color Variant'}
              </button>
              {editingColorIndex !== null && (
                <button 
                  type="button" 
                  onClick={cancelEditColor} 
                  className="btn btn-outline"
                  style={{ padding: '10px 20px', fontSize: '14px' }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>

          {formData.colors.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>Added Color Variants ({formData.colors.length})</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {formData.colors.map((color, i) => (
                  <div key={i} style={{ position: 'relative', background: editingColorIndex === i ? '#eff6ff' : 'white', border: editingColorIndex === i ? '2px solid #3b82f6' : '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, display: 'flex', gap: '4px' }}>
                      <button 
                        type="button" 
                        onClick={() => editColor(i)}
                        style={{ width: '28px', height: '28px', background: 'rgba(59, 130, 246, 0.95)', color: 'white', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => removeColor(i)}
                        style={{ width: '28px', height: '28px', background: 'rgba(239, 68, 68, 0.95)', color: 'white', border: 'none', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                    
                    {color.image ? (
                      <img 
                        src={color.image} 
                        alt={color.name} 
                        style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ width: '100%', height: '180px', background: 'linear-gradient(135deg, ' + color.code + ' 0%, ' + color.code + 'dd 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '48px', fontWeight: 'bold' }}>
                        {color.name.charAt(0)}
                      </div>
                    )}
                    
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: color.code, border: '2px solid #e5e7eb' }}></div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '16px', color: '#111827' }}>{color.name}</div>
                          <div style={{ fontSize: '12px', color: '#9ca3af', fontFamily: 'monospace' }}>{color.code}</div>
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Available Sizes:</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {color.sizes.map((size, sIdx) => (
                          <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f9fafb', borderRadius: '6px', fontSize: '13px' }}>
                            <span style={{ fontWeight: '600', color: '#111827' }}>{size.size}</span>
                            <div style={{ display: 'flex', gap: '12px', color: '#6b7280' }}>
                              <span>₹{size.price}</span>
                              <span>Qty: {size.quantity}</span>
                              {size.sizeVariantId && <span style={{ fontFamily: 'monospace', background: '#fef3c7', padding: '2px 6px', borderRadius: '3px' }}>ID: {size.sizeVariantId}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Tags</h3>
          </div>

          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="tags-input">
              <div className="tags-list">
                {formData.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="remove-tag"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="add-tag-input">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button type="button" onClick={addTag} className="add-tag-btn">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>


      </form>
    </div>
  )
}

export default EditProduct
