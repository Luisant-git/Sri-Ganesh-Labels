import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Truck, Eye, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DataTable from '../components/DataTable'
import { getShippingRules, deleteShippingRule } from '../api/shippingApi'
import './ShippingSettings.scss'

const ShippingSettings = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [shippingList, setShippingList] = useState([])
  const [viewModal, setViewModal] = useState({ open: false, data: null })

  useEffect(() => {
    fetchShippingRules()
  }, [])

  const fetchShippingRules = async () => {
    try {
      const data = await getShippingRules()
      setShippingList(data)
    } catch (error) {
      toast.error('Failed to fetch shipping rules')
    }
  }

  const handleEdit = (id) => {
    navigate(`/edit-shipping/${id}`)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this shipping rule?')) {
      try {
        await deleteShippingRule(id)
        toast.success('Shipping rule deleted successfully')
        fetchShippingRules()
      } catch (error) {
        toast.error('Failed to delete shipping rule')
      }
    }
  }

  const formatWeightRules = (weightRules) => {
    if (!Array.isArray(weightRules) || weightRules.length === 0) {
      return 'No weight-based rules'
    }

    return weightRules
      .slice()
      .sort((a, b) => Number(a.weightKg) - Number(b.weightKg))
      .map((rule) => {
        const weight = Number(rule.weightKg)
        const weightLabel = Number.isInteger(weight) ? `${weight} kg` : `${weight.toFixed(2)} kg`
        return `${weightLabel} = ₹${Number(rule.rate).toFixed(2)}`
      })
      .join(' • ')
  }

  const columns = [
    { 
      key: 'state', 
      label: 'State',
      render: (value) => (
        <div className="coupon-code" style={{display: 'flex', alignItems: 'center'}}>
          <Truck size={16} className="coupon-icon" />
          <span className="code" style={{marginLeft: '8px'}}>{value}</span>
        </div>
      )
    },
    { 
      key: 'flatShippingRate', 
      label: 'Shipping Rate',
      render: (value) => `₹${value}`
    },
    {
      key: 'codAvailable',
      label: 'COD Available',
      render: (value) => (
        <span style={{
          padding: '4px 12px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600',
          backgroundColor: value ? '#d1fae5' : '#fee2e2',
          color: value ? '#065f46' : '#991b1b'
        }}>
          {value ? 'Yes' : 'No'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="action-btn view" onClick={() => setViewModal({ open: true, data: row })} title="View">
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
    <div className="shipping-settings">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Shipping Settings</h1>
          <p>Manage shipping rates by state</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/add-shipping')}>
          <Plus size={20} />
          Add Shipping
        </button>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search shipping..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <DataTable 
        data={shippingList}
        columns={columns}
        searchTerm={searchTerm}
        searchKey="state"
      />

      {viewModal.open && (
        <div className="modal-backdrop" onClick={() => setViewModal({ open: false, data: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setViewModal({ open: false, data: null })}>
              <X size={20} />
            </button>
            <div className="modal-content view-modal" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
              <h2>Shipping Rule Details</h2>
              <div className="modal-product-info">
                <p><strong>State:</strong> {viewModal.data?.state}</p>
                <p><strong>Flat Shipping Rate:</strong> ₹{viewModal.data?.flatShippingRate}</p>
                <p><strong>COD Available:</strong> {viewModal.data?.codAvailable ? 'Yes' : 'No'}</p>
                {Array.isArray(viewModal.data?.weightRates) && viewModal.data.weightRates.length > 0 && (
                  <>
                    <p><strong>Weight Rules:</strong></p>
                    <table className="weight-table">
                      <thead>
                        <tr>
                          <th>Weight</th>
                          <th>Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewModal.data.weightRates
                          .slice()
                          .sort((a, b) => Number(a.weightKg) - Number(b.weightKg))
                          .map((rule, index) => {
                            const weight = Number(rule.weightKg)
                            return (
                              <tr key={`${weight}-${index}`}>
                                <td>{Number.isInteger(weight) ? `${weight} kg` : `${weight.toFixed(2)} kg`}</td>
                                <td>₹{Number(rule.rate).toFixed(2)}</td>
                              </tr>
                            )
                          })}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

export default ShippingSettings;
