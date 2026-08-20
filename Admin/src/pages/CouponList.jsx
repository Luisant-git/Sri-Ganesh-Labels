import React, { useState, useEffect } from 'react'
import { Search, Filter, Plus, Edit, Trash2, Eye, Percent } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getCoupons, deleteCoupon } from '../api/couponApi'
import DataTable from '../components/DataTable'

const CouponList = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const data = await getCoupons()
      setCoupons(data)
    } catch (error) {
      console.error('Failed to fetch coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (id) => {
    navigate(`/edit-coupon/${id}`)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id)
        fetchCoupons()
        toast.success('Coupon deleted successfully')
      } catch (error) {
        toast.error('Failed to delete coupon: ' + error.message)
      }
    }
  }

  const columns = [
    { 
      key: 'code', 
      label: 'Coupon Code',
      render: (value, row) => (
        <div className="coupon-code">
          <Percent size={16} className="coupon-icon" />
          <span className="code">{value}</span>
        </div>
      )
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (value) => value === 'percentage' ? 'Percentage' : 'Fixed'
    },
    { 
      key: 'value', 
      label: 'Discount',
      render: (value, row) => row.type === 'percentage' ? `${value}%` : `₹${value}`
    },
    { 
      key: 'minOrderAmount', 
      label: 'Min Order',
      render: (value) => `₹${value}`
    },
    { 
      key: 'maxDiscount', 
      label: 'Max Discount',
      render: (value) => value ? `₹${value}` : 'No limit'
    },
    { 
      key: 'specificUsers', 
      label: 'Customer',
      render: (value, row) => {
        if (!row.specificUsers || row.specificUsers.length === 0) return 'All';
        if (row.specificUsers.length === 1) return `${row.specificUsers[0].name || 'N/A'} (${row.specificUsers[0].phone})`;
        return `${row.specificUsers.length} Customers`;
      }
    },
    { 
      key: 'applyTo', 
      label: 'Applies To',
      render: (value) => {
        if (!value || value.length === 0) return 'Subtotal';
        return value.map(t => {
          if (t === 'subtotal') return 'Subtotal';
          if (t === 'delivery') return 'Delivery';
          if (t === 'cod') return 'COD';
          return t;
        }).join(', ');
      }
    },
    { 
      key: 'usageCount', 
      label: 'Usage',
      render: (value, row) => (
        <span className="usage-info">{value}/{row.usageLimit || '∞'}</span>
      )
    },
    { 
      key: 'isActive', 
      label: 'Status',
      render: (value, row) => {
        const isExpired = row.expiryDate && new Date(row.expiryDate) < new Date()
        const status = isExpired ? 'expired' : (value ? 'active' : 'inactive')
        return <span className={`status ${status}`}>{status}</span>
      }
    },
    { 
      key: 'expiryDate', 
      label: 'Expires',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'No expiry'
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
    <div className="coupon-list">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Coupons</h1>
          <p>Manage discount coupons and promotional codes</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/add-coupon')}>
          <Plus size={20} />
          Add Coupon
        </button>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search coupons..."
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
          data={coupons}
          columns={columns}
          searchTerm={searchTerm}
          searchKey="code"
        />
      )}
    </div>
  )
}

export default CouponList