import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, Edit, Trash2, Eye, X, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DataTable from '../components/DataTable'
import { getBanners, getBannerById, updateBanner, deleteBanner } from '../api/bannerApi'
import { uploadImage } from '../api/uploadApi'

// Modal component
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

const BannerList = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModal, setViewModal] = useState({ show: false, banner: null })
  const [editModal, setEditModal] = useState({ show: false, banner: null })
  const [editForm, setEditForm] = useState({ title: '', link: '', isActive: true, rowNumber: 1 })
  const [editImage, setEditImage] = useState(null)
  const [editMobileImage, setEditMobileImage] = useState(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const data = await getBanners()
      setBanners(data)
    } catch (error) {
      toast.error('Failed to fetch banners')
    } finally {
      setLoading(false)
    }
  }

  const handleView = async (id) => {
    try {
      const banner = await getBannerById(id)
      setViewModal({ show: true, banner })
    } catch (error) {
      toast.error('Failed to fetch banner details')
    }
  }

  const handleEdit = async (id) => {
    try {
      const banner = await getBannerById(id)
      setEditForm({
        title: banner.title,
        link: banner.link,
        isActive: banner.isActive,
        rowNumber: banner.rowNumber || 1
      })
      setEditImage(null)
      setEditMobileImage(null)
      setEditModal({ show: true, banner })
    } catch (error) {
      toast.error('Failed to fetch banner details')
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    
    try {
      let imageUrl = editModal.banner.image
      let mobileImageUrl = editModal.banner.mobileImage
      
      if (editImage) {
        const imageResponse = await uploadImage(editImage.file)
        imageUrl = imageResponse.url
      }
      
      if (editMobileImage) {
        const mobileImageResponse = await uploadImage(editMobileImage.file)
        mobileImageUrl = mobileImageResponse.url
      }
      
      const updateData = {
        ...editForm,
        image: imageUrl,
        mobileImage: mobileImageUrl
      }
      
      await updateBanner(editModal.banner.id, updateData)
      toast.success('Banner updated successfully!')
      setEditModal({ show: false, banner: null })
      setEditImage(null)
      setEditMobileImage(null)
      fetchBanners()
    } catch (error) {
      toast.error(error.message || 'Failed to update banner')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner(id)
        toast.success('Banner deleted successfully!')
        fetchBanners()
      } catch (error) {
        toast.error('Failed to delete banner')
      }
    }
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
          setEditMobileImage(imageData)
        } else {
          setEditImage(imageData)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const columns = [
    { 
      key: 'title', 
      label: 'Banner Title',
      render: (value, row) => (
        <div className="banner-info">
          <img src={row.image} alt={value} style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '8px'}} />
          <span>{value}</span>
        </div>
      )
    },
    { key: 'link', label: 'Link' },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (value) => (
        <span className={`status ${value ? 'active' : 'inactive'}`}>{value ? 'Active' : 'Inactive'}</span>
      )
    },
    { key: 'rowNumber', label: 'Order' },
    { 
      key: 'createdAt', 
      label: 'Created',
      render: (value) => new Date(value).toLocaleDateString("en-GB"),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="action-btn view" onClick={() => handleView(row.id)} title="View">
            <Eye size={16} />
          </button>
          <button className="action-btn edit" onClick={() => handleEdit(row.id)} title="Edit">
            <Edit size={16} />
          </button>
          <button className="action-btn delete" onClick={() => handleDelete(row.id)} title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="banner-list">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Banners</h1>
          <p>Manage your website banners and promotions</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/add-banner')}>
          <Plus size={20} />
          Add Banner
        </button>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search banners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <DataTable 
          data={banners}
          columns={columns}
          searchTerm={searchTerm}
          searchKey="title"
        />
      )}

      {/* View Modal */}
      <Modal open={viewModal.show} onClose={() => setViewModal({ show: false, banner: null })}>
        <div className="modal-content view-modal" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <h2>Banner Details</h2>
          <div style={{ marginBottom: '16px' }}>
            <strong>Desktop Banner:</strong>
            <img src={viewModal.banner?.image} alt={viewModal.banner?.title} className="modal-product-image" style={{ width: '100%', maxWidth: '400px', marginTop: '8px' }} />
          </div>
          {viewModal.banner?.mobileImage && (
            <div style={{ marginBottom: '16px' }}>
              <strong>Mobile Banner:</strong>
              <img src={viewModal.banner?.mobileImage} alt={`${viewModal.banner?.title} Mobile`} className="modal-product-image" style={{ width: '100%', maxWidth: '300px', marginTop: '8px' }} />
            </div>
          )}
          <div className="modal-product-info">
            <p><strong>Title:</strong> {viewModal.banner?.title}</p>
            <p><strong>Link:</strong> {viewModal.banner?.link}</p>
            <p><strong>Status:</strong> {viewModal.banner?.isActive ? 'Active' : 'Inactive'}</p>
            <p><strong>Order:</strong> {viewModal.banner?.rowNumber}</p>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModal.show} onClose={() => setEditModal({ show: false, banner: null })}>
        <form className="modal-content edit-modal" onSubmit={handleUpdate} style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <h2>Edit Banner</h2>
          <div className="form-group">
            <label className="form-label">Desktop Banner Image</label>
            <div className="image-edit-section">
              {(editImage?.url || editModal.banner?.image) ? (
                <div className="image-preview-wrapper">
                  <img src={editImage?.url || editModal.banner?.image} alt="Desktop Banner" className="current-image" />
                  <button
                    type="button"
                    className="change-image-btn"
                    onClick={() => document.getElementById('edit-banner-image').click()}
                  >
                    <Upload size={14} />
                    Change
                  </button>
                </div>
              ) : (
                <div className="image-upload-area" onClick={() => document.getElementById('edit-banner-image').click()}>
                  <Upload size={28} />
                  <p>Upload desktop image</p>
                  <span>PNG, JPG (1920x600px)</span>
                </div>
              )}
              <input
                type="file"
                id="edit-banner-image"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, false)}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mobile Banner Image</label>
            <div className="image-edit-section">
              {(editMobileImage?.url || editModal.banner?.mobileImage) ? (
                <div className="image-preview-wrapper">
                  <img src={editMobileImage?.url || editModal.banner?.mobileImage} alt="Mobile Banner" className="current-image" />
                  <button
                    type="button"
                    className="change-image-btn"
                    onClick={() => document.getElementById('edit-mobile-banner-image').click()}
                  >
                    <Upload size={14} />
                    Change
                  </button>
                </div>
              ) : (
                <div className="image-upload-area" onClick={() => document.getElementById('edit-mobile-banner-image').click()}>
                  <Upload size={28} />
                  <p>Upload mobile image</p>
                  <span>PNG, JPG (768x400px - Optional)</span>
                </div>
              )}
              <input
                type="file"
                id="edit-mobile-banner-image"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, true)}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Link</label>
            <input
              className="form-input"
              type="url"
              value={editForm.link}
              onChange={(e) => setEditForm({...editForm, link: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={editForm.isActive}
              onChange={(e) => setEditForm({...editForm, isActive: e.target.value === 'true'})}
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Order</label>
            <input
              className="form-input"
              type="number"
              value={editForm.rowNumber}
              onChange={(e) => setEditForm({...editForm, rowNumber: parseInt(e.target.value)})}
              min="1"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setEditModal({ show: false, banner: null })}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={updating}>{updating ? 'Updating...' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default BannerList