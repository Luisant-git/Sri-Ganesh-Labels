import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Eye, X, Upload } from 'lucide-react'
import { toast } from 'react-toastify'
import DataTable from '../components/DataTable'
import { getSizeCharts, createSizeChart, updateSizeChart, deleteSizeChart } from '../api/sizeChartApi'
import { uploadImage } from '../api/uploadApi'

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

const SizeChartPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [charts, setCharts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewModal, setViewModal] = useState({ show: false, chart: null })
  const [editModal, setEditModal] = useState({ show: false, chart: null })
  const [addModal, setAddModal] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', isActive: true, rowNumber: 1 })
  const [addForm, setAddForm] = useState({ title: '', isActive: true, rowNumber: 1 })
  const [editImage, setEditImage] = useState(null)
  const [addImage, setAddImage] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchCharts()
  }, [])

  const fetchCharts = async () => {
    try {
      const data = await getSizeCharts()
      setCharts(data)
    } catch (error) {
      toast.error('Failed to fetch size charts')
    } finally {
      setLoading(false)
    }
  }

  const handleView = (chart) => {
    setViewModal({ show: true, chart })
  }

  const handleEdit = (chart) => {
    setEditForm({
      title: chart.title,
      isActive: chart.rowNumber > 0,
      rowNumber: chart.rowNumber || 1
    })
    setEditModal({ show: true, chart })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)
    
    try {
      let imageUrl = editModal.chart.image
      
      if (editImage) {
        const imageResponse = await uploadImage(editImage.file)
        imageUrl = imageResponse.url
      }
      
      const updateData = {
        ...editForm,
        image: imageUrl
      }
      
      await updateSizeChart(editModal.chart.id, updateData)
      toast.success('Size chart updated successfully!')
      setEditModal({ show: false, chart: null })
      setEditImage(null)
      fetchCharts()
    } catch (error) {
      toast.error('Failed to update size chart')
    } finally {
      setUpdating(false)
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!addImage) {
      toast.error('Please upload an image')
      return
    }
    
    setAdding(true)
    try {
      const imageResponse = await uploadImage(addImage.file)
      await createSizeChart({ ...addForm, image: imageResponse.url })
      toast.success('Size chart added successfully!')
      setAddModal(false)
      setAddForm({ title: '', isActive: true, rowNumber: 1 })
      setAddImage(null)
      fetchCharts()
    } catch (error) {
      toast.error('Failed to add size chart')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this size chart?')) {
      try {
        await deleteSizeChart(id)
        toast.success('Size chart deleted successfully!')
        fetchCharts()
      } catch (error) {
        toast.error('Failed to delete size chart')
      }
    }
  }

  const handleEditImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setEditImage({ file, url: event.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAddImage({ file, url: event.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const columns = [
    { 
      key: 'title', 
      label: 'Chart Title',
      render: (value, row) => (
        <div className="banner-info">
          <img src={row.image} alt={value} style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '8px'}} />
          <span>{value}</span>
        </div>
      )
    },
    { 
      key: 'rowNumber', 
      label: 'Status',
      render: (value) => (
        <span className={`status ${value > 0 ? 'active' : 'inactive'}`}>{value > 0 ? 'Active' : 'Inactive'}</span>
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
          <button className="action-btn view" onClick={() => handleView(row)} title="View">
            <Eye size={16} />
          </button>
          <button className="action-btn edit" onClick={() => handleEdit(row)} title="Edit">
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
          <h1>Size Charts</h1>
          <p>Manage your size chart images</p>
        </div>
        <button className="btn btn-primary" onClick={() => setAddModal(true)}>
          <Plus size={20} />
          Add Size Chart
        </button>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search size charts..."
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
          data={charts}
          columns={columns}
          searchTerm={searchTerm}
          searchKey="title"
        />
      )}

      {/* View Modal */}
      <Modal open={viewModal.show} onClose={() => setViewModal({ show: false, chart: null })}>
        <div className="modal-content view-modal">
          <h2>Size Chart Details</h2>
          <img src={viewModal.chart?.image} alt={viewModal.chart?.title} className="modal-product-image" />
          <div className="modal-product-info">
            <p><strong>Title:</strong> {viewModal.chart?.title}</p>
            <p><strong>Status:</strong> {viewModal.chart?.rowNumber > 0 ? 'Active' : 'Inactive'}</p>
            <p><strong>Order:</strong> {viewModal.chart?.rowNumber}</p>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editModal.show} onClose={() => setEditModal({ show: false, chart: null })}>
        <form className="modal-content edit-modal" onSubmit={handleUpdate}>
          <h2>Edit Size Chart</h2>
          <div className="form-group">
            <label className="form-label">Image</label>
            <div className="image-edit-section">
              {(editImage?.url || editModal.chart?.image) ? (
                <div className="image-preview-wrapper">
                  <img src={editImage?.url || editModal.chart?.image} alt="Chart" className="current-image" />
                  <button
                    type="button"
                    className="change-image-btn"
                    onClick={() => document.getElementById('edit-chart-image').click()}
                  >
                    <Upload size={14} />
                    Change
                  </button>
                </div>
              ) : (
                <div className="image-upload-area" onClick={() => document.getElementById('edit-chart-image').click()}>
                  <Upload size={28} />
                  <p>Upload image</p>
                  <span>PNG, JPG</span>
                </div>
              )}
              <input
                type="file"
                id="edit-chart-image"
                accept="image/*"
                onChange={handleEditImageUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
              required
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
              min="0"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setEditModal({ show: false, chart: null })}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={updating}>{updating ? 'Updating...' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)}>
        <form className="modal-content edit-modal" onSubmit={handleAdd}>
          <h2>Add Size Chart</h2>
          <div className="form-group">
            <label className="form-label">Image *</label>
            <div className="image-edit-section">
              {addImage?.url ? (
                <div className="image-preview-wrapper">
                  <img src={addImage.url} alt="Chart" className="current-image" />
                  <button
                    type="button"
                    className="change-image-btn"
                    onClick={() => document.getElementById('add-chart-image').click()}
                  >
                    <Upload size={14} />
                    Change
                  </button>
                </div>
              ) : (
                <div className="image-upload-area" onClick={() => document.getElementById('add-chart-image').click()}>
                  <Upload size={28} />
                  <p>Upload image</p>
                  <span>PNG, JPG</span>
                </div>
              )}
              <input
                type="file"
                id="add-chart-image"
                accept="image/*"
                onChange={handleAddImageUpload}
                style={{ display: 'none' }}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              type="text"
              value={addForm.title}
              onChange={(e) => setAddForm({...addForm, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={addForm.isActive}
              onChange={(e) => setAddForm({...addForm, isActive: e.target.value === 'true'})}
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
              value={addForm.rowNumber}
              onChange={(e) => setAddForm({...addForm, rowNumber: parseInt(e.target.value)})}
              min="0"
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={() => setAddModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={adding}>{adding ? 'Adding...' : 'Add Chart'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default SizeChartPage
