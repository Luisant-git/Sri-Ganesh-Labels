import React, { useState } from 'react'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createBrand, uploadImage } from '../api'
import '../styles/pages/add-brand.scss'

const AddBrand = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
  })
  const [logo, setLogo] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const uploadResult = await uploadImage(file)
        setLogo({
          file,
          url: uploadResult.url,
          filename: uploadResult.filename
        })
        toast.success('Logo uploaded successfully!')
      } catch (err) {
        toast.error('Failed to upload logo')
      }
    }
  }

  const removeLogo = () => {
    setLogo(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const brandData = {
        name: formData.name,
        description: formData.description,
        image: logo ? logo.url : null
      }
      
      await createBrand(brandData)
      toast.success('Brand created successfully!')
      navigate('/brand-list')
      
      // Reset form
      setFormData({ name: '', description: '' })
      setLogo(null)
    } catch (err) {
      toast.error(err.message || 'Failed to create brand')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="add-brand">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Add Brand</h1>
          <p>Create a new brand for your products</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="brand-form">
        <div className="form-grid">
          <div className="form-section">
            <div className="section-header">
              <h3>Brand Information</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Brand Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter brand name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter brand description"
                rows={4}
              />
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3>Brand Logo</h3>
            </div>

            <div className="logo-upload-section">
              {!logo ? (
                <div className="logo-upload-area">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="logo-input"
                  />
                  <label htmlFor="logo-upload" className="upload-label">
                    <Upload size={48} />
                    <p>Click to upload brand logo</p>
                    <span>PNG, JPG, SVG up to 5MB</span>
                  </label>
                </div>
              ) : (
                <div className="logo-preview">
                  <img src={logo.url || "/placeholder.svg"} alt="Brand Logo" />
                  <button
                    type="button"
                    className="remove-logo"
                    onClick={removeLogo}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Brand...' : 'Create Brand'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddBrand
