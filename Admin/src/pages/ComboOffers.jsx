import React, { useState } from 'react'
import { Search, Filter, Plus, Edit, Trash2, Eye, Gift } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import DataTable from '../components/DataTable'
import '../styles/pages/combo-offers.scss'

const ComboOffers = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'table' or 'grid'

  const comboOffers = [
    {
      id: 1,
      name: 'Electronics Bundle',
      products: ['Wireless Headphones', 'Smartphone Case'],
      originalPrice: '₹3,298',
      offerPrice: '₹2,799',
      discount: '15%',
      status: 'active',
      validUntil: '2024-02-15',
      sales: 45
    },
    {
      id: 2,
      name: 'Fashion Combo Deal',
      products: ['Cotton T-Shirt', 'Running Shoes'],
      originalPrice: '₹4,098',
      offerPrice: '₹3,499',
      discount: '15%',
      status: 'active',
      validUntil: '2024-02-20',
      sales: 23
    },
    {
      id: 3,
      name: 'Winter Wear Bundle',
      products: ['Hoodie', 'Track Pants', 'Winter Cap'],
      originalPrice: '₹2,500',
      offerPrice: '₹1,999',
      discount: '20%',
      status: 'inactive',
      validUntil: '2024-01-31',
      sales: 67
    }
  ]

  const handleEdit = (id) => {
    console.log('Edit combo offer:', id)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this combo offer?')) {
      console.log('Delete combo offer:', id)
    }
  }

  const columns = [
    { 
      key: 'name', 
      label: 'Combo Name',
      render: (value) => (
        <div className="combo-name">
          <Gift size={16} className="combo-icon" />
          <span>{value}</span>
        </div>
      )
    },
    { 
      key: 'products', 
      label: 'Products',
      render: (value) => (
        <div className="product-list">
          {value.slice(0, 2).map((product, index) => (
            <span key={index} className="product-tag">{product}</span>
          ))}
          {value.length > 2 && <span className="more-products">+{value.length - 2} more</span>}
        </div>
      )
    },
    { key: 'originalPrice', label: 'Original Price' },
    { key: 'offerPrice', label: 'Offer Price' },
    { 
      key: 'discount', 
      label: 'Discount',
      render: (value) => <span className="discount-badge">{value}</span>
    },
    { 
      key: 'sales', 
      label: 'Sales',
      render: (value) => <span className="sales-count">{value}</span>
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`status ${value}`}>{value}</span>
      )
    },
    { key: 'validUntil', label: 'Valid Until' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="action-btn view" title="View">
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
    <div className="combo-offers">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Combo Offers</h1>
          <p>Create and manage product bundle offers</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/create-combo')}>
          <Plus size={20} />
          Create Combo
        </button>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search combo offers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <button className="btn btn-outline">
            <Filter size={20} />
            Filters
          </button>
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable 
          data={comboOffers}
          columns={columns}
          searchTerm={searchTerm}
          searchKey="name"
        />
      ) : (
        <div className="combo-grid">
          {comboOffers.filter(combo => 
            searchTerm === '' || combo.name.toLowerCase().includes(searchTerm.toLowerCase())
          ).map(combo => (
            <div key={combo.id} className="combo-card">
              <div className="combo-header">
                <div className="combo-icon">
                  <Gift size={24} />
                </div>
                <div className="combo-actions">
                  <button className="action-btn view">
                    <Eye size={16} />
                  </button>
                  <button className="action-btn edit" onClick={() => handleEdit(combo.id)}>
                    <Edit size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(combo.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="combo-content">
                <h3>{combo.name}</h3>
                <div className="combo-products">
                  {combo.products.map((product, index) => (
                    <span key={index} className="product-tag">{product}</span>
                  ))}
                </div>
                <div className="combo-pricing">
                  <div className="original-price">{combo.originalPrice}</div>
                  <div className="offer-price">{combo.offerPrice}</div>
                  <div className="discount">{combo.discount} OFF</div>
                </div>
                <div className="combo-footer">
                  <span className={`status ${combo.status}`}>{combo.status}</span>
                  <span className="valid-until">Valid until {combo.validUntil}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ComboOffers
