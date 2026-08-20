import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { createProduct, getCategories, uploadImage } from '../api'

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    mrp: '',
    basePrice: '',
    hsnCode: '',
    gallery: [],
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
      const productData = {
        name: formData.name,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        mrp: formData.mrp,
        basePrice: formData.basePrice,
        hsnCode: formData.hsnCode || null,
        gallery: formData.gallery,
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
        mrp: '',
        basePrice: '',
        hsnCode: '',
        gallery: [],
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
                value={formData.mrp}
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
                value={formData.hsnCode}
                onChange={(e) => handleInputChange('hsnCode', e.target.value)}
                placeholder="Enter HSN code (optional)"
              />
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

      </form>
    </div>
  )
}

export default AddProduct