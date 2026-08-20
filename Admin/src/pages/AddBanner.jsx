import React, { useState } from 'react'
import { ArrowLeft, Upload, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createBanner } from '../api/bannerApi'
import { uploadImage } from '../api/uploadApi'
import '../styles/pages/add-banner.scss'

const AddBanner = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    buttonLink: '',
    status: 'active'
  })
  const [bannerImage, setBannerImage] = useState(null)
  const [mobileBannerImage, setMobileBannerImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageUpload = (e, isMobile = false) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageData = {
          file,
          url: event.target.result
        }
        if (isMobile) {
          setMobileBannerImage(imageData)
        } else {
          setBannerImage(imageData)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (isMobile = false) => {
    if (isMobile) {
      setMobileBannerImage(null)
    } else {
      setBannerImage(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!bannerImage) {
      toast.error('Please upload a banner image')
      return
    }

    setIsLoading(true)
    
    try {
      // Upload desktop image
      const imageResponse = await uploadImage(bannerImage.file)
      
      // Upload mobile image if provided
      let mobileImageUrl = null
      if (mobileBannerImage) {
        const mobileImageResponse = await uploadImage(mobileBannerImage.file)
        mobileImageUrl = mobileImageResponse.url
      }
      
      // Create banner with uploaded image URLs
      const bannerData = {
        title: formData.title,
        link: formData.buttonLink,
        image: imageResponse.url,
        mobileImage: mobileImageUrl,
        isActive: formData.status === 'active',
        rowNumber: 1
      }
      
      await createBanner(bannerData)
      toast.success('Banner created successfully!')
      navigate('/banner-list')
      
    } catch (error) {
      toast.error(error.message || 'Failed to create banner')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="add-banner">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Add Banner</h1>
          <p>Create a new promotional banner</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="banner-form">
        <div className="form-grid">
          <div className="form-section">
            <div className="section-header">
              <h3>Banner Content</h3>
            </div>

            <div className="form-group">
              <label className="form-label">Banner Title</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter banner title"
              />
            </div>


            <div className="form-row">

              <div className="form-group">
                <label className="form-label">Button Link</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.buttonLink}
                  onChange={(e) => handleInputChange('buttonLink', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="form-row">

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
            <div className="section-header">
              <h3>Desktop Banner Image</h3>
            </div>

            <div className="image-upload-section">
              {!bannerImage ? (
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="banner-upload"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
                    className="image-input"
                  />
                  <label htmlFor="banner-upload" className="upload-label">
                    <Upload size={48} />
                    <p>Click to upload desktop banner</p>
                    <span>PNG, JPG up to 10MB (Recommended: 1920x600px)</span>
                  </label>
                </div>
              ) : (
                <div className="image-preview">
                  <img src={bannerImage.url || "/placeholder.svg"} alt="Desktop Banner" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => removeImage(false)}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="section-header" style={{ marginTop: '24px' }}>
              <h3>Mobile Banner Image (Optional)</h3>
            </div>

            <div className="image-upload-section">
              {!mobileBannerImage ? (
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="mobile-banner-upload"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="image-input"
                  />
                  <label htmlFor="mobile-banner-upload" className="upload-label">
                    <Upload size={48} />
                    <p>Click to upload mobile banner</p>
                    <span>PNG, JPG up to 10MB (Recommended: 768x400px)</span>
                  </label>
                </div>
              ) : (
                <div className="image-preview">
                  <img src={mobileBannerImage.url || "/placeholder.svg"} alt="Mobile Banner" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => removeImage(true)}
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
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Banner'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddBanner
