import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import DataTable from '../components/DataTable'
import { getShippingRules, deleteShippingRule } from '../api/shippingApi'

const ShippingSettings = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [shippingList, setShippingList] = useState([])

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
    </div>
  )
};

export default ShippingSettings;
