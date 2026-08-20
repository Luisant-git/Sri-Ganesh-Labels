import React, { useState, useEffect } from 'react'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createSubCategory, getCategories, uploadImage } from '../api'
import '../styles/pages/add-sub-category.scss'

const AddSubCategory = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    orderNumber: 0,
    status: 'active'
  })
  const [categories, setCategories] = useState([])
  const [image, setImage] = useState(null)
  const [sizeChart, setSizeChart] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const uploadResult = await uploadImage(file)
        setImage({
          file,
          url: uploadResult.url,
          filename: uploadResult.filename
        })
        toast.success('Image uploaded successfully!')
      } catch (err) {
        toast.error('Failed to upload image')
      }
    }
  }

  const handleSizeChartUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const uploadResult = await uploadImage(file)
        setSizeChart({
          file,
          url: uploadResult.url,
          filename: uploadResult.filename
        })
        toast.success('Size chart uploaded successfully!')
      } catch (err) {
        toast.error('Failed to upload size chart')
      }
    }
  }

  const removeSizeChart = () => {
    setSizeChart(null)
  }

  const removeImage = () => {
    setImage(null)
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories()
        setCategories(categoriesData)
      } catch (err) {
        toast.error('Failed to load categories')
      }
    }
    fetchCategories()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const subcategoryData = {
        name: formData.name,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        orderNumber: parseInt(formData.orderNumber) || 0,
        image: image ? image.url : null,
        sizeChart: sizeChart ? sizeChart.url : null
      }
      
      await createSubCategory(subcategoryData)
      toast.success('Sub category created successfully!')
      navigate('/subcategory-list')
      
      // Reset form
      setFormData({ name: '', description: '', categoryId: '', orderNumber: 0, status: 'active' })
      setImage(null)
      setSizeChart(null)
    } catch (err) {
      toast.error(err.message || 'Failed to create sub category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-sub-category">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Add Sub Category</h1>
          <p>Create a new product sub category</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="sub-category-form">
        <div className="form-grid">
          <div className="form-section">
            <div className="section-header">
              <h3>Sub Category Information</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Sub Category Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter sub category name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Parent Category *</label>
              <select
                className="form-select"
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                required
              >
                <option value="">Select Parent Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter sub category description"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Order Number</label>
              <input
                type="number"
                className="form-input"
                value={formData.orderNumber}
                onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                placeholder="Enter display order (0 = first)"
                min="0"
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Sub Category Image</h3>
            </div>

            <div className="image-upload-section">
              {!image ? (
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="image-input"
                  />
                  <label htmlFor="image-upload" className="upload-label">
                    <Upload size={48} />
                    <p>Click to upload sub category image</p>
                    <span>PNG, JPG up to 5MB</span>
                  </label>
                </div>
              ) : (
                <div className="image-preview">
                  <img src={image.url || "/placeholder.svg"} alt="Sub Category" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={removeImage}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="section-header" style={{ marginTop: '2rem' }}>
              <h3>Size Chart (Optional)</h3>
            </div>

            <div className="image-upload-section">
              {!sizeChart ? (
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="sizechart-upload"
                    accept="image/*"
                    onChange={handleSizeChartUpload}
                    className="image-input"
                  />
                  <label htmlFor="sizechart-upload" className="upload-label">
                    <Upload size={48} />
                    <p>Click to upload size chart</p>
                    <span>PNG, JPG up to 5MB</span>
                  </label>
                </div>
              ) : (
                <div className="image-preview">
                  <img src={sizeChart.url || "/placeholder.svg"} alt="Size Chart" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={removeSizeChart}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Sub Category...' : 'Create Sub Category'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddSubCategory
