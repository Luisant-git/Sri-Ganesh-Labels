import React, { useState } from 'react'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createCategory, uploadImage } from '../api'
import '../styles/pages/add-category.scss'

const AddCategory = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    status: 'active',
    featured: false
  })
  const [image, setImage] = useState(null)
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

  const removeImage = () => {
    setImage(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const categoryData = {
        name: formData.name,
        description: formData.description,
        image: image ? image.url : null
      }
      
      await createCategory(categoryData)
      toast.success('Category created successfully!')
      navigate('/category-list')
      
      // Reset form
      setFormData({ name: '', description: '', parentCategory: '', status: 'active', featured: false })
      setImage(null)
    } catch (err) {
      toast.error(err.message || 'Failed to create category')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-category">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Add Category</h1>
          <p>Create a new product category</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="category-form">
        <div className="form-grid">
          <div className="form-section">
            <div className="section-header">
              <h3>Category Information</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter category description"
                rows={4}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Category Image</h3>
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
                    <p>Click to upload category image</p>
                    <span>PNG, JPG up to 5MB</span>
                  </label>
                </div>
              ) : (
                <div className="image-preview">
                  <img src={image.url || "/placeholder.svg"} alt="Category" />
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
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-outline">
            Save as Draft
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Category...' : 'Create Category'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddCategory
