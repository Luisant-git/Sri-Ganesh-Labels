import React, { useState } from 'react'
import { Search, Filter, AlertTriangle, Package, TrendingDown, Edit, Plus } from 'lucide-react'
import DataTable from '../components/DataTable'

const AllStockList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState('all')

  const stockData = [
    {
      id: 1,
      product: 'Wireless Headphones',
      sku: 'WH-001',
      category: 'Electronics',
      currentStock: 45,
      minStock: 10,
      maxStock: 100,
      unitPrice: '₹2,999',
      totalValue: '₹1,34,955',
      status: 'in-stock',
      lastUpdated: '2024-01-15'
    },
    {
      id: 2,
      product: 'Cotton T-Shirt',
      sku: 'CT-002',
      category: 'Clothing',
      currentStock: 8,
      minStock: 15,
      maxStock: 200,
      unitPrice: '₹599',
      totalValue: '₹4,792',
      status: 'low-stock',
      lastUpdated: '2024-01-14'
    },
    {
      id: 3,
      product: 'Smartphone Case',
      sku: 'SC-003',
      category: 'Accessories',
      currentStock: 0,
      minStock: 5,
      maxStock: 50,
      unitPrice: '₹299',
      totalValue: '₹0',
      status: 'out-of-stock',
      lastUpdated: '2024-01-13'
    },
    {
      id: 4,
      product: 'Running Shoes',
      sku: 'RS-004',
      category: 'Footwear',
      currentStock: 25,
      minStock: 10,
      maxStock: 80,
      unitPrice: '₹3,499',
      totalValue: '₹87,475',
      status: 'in-stock',
      lastUpdated: '2024-01-12'
    },
    {
      id: 5,
      product: 'Coffee Mug',
      sku: 'CM-005',
      category: 'Home & Kitchen',
      currentStock: 80,
      minStock: 20,
      maxStock: 150,
      unitPrice: '₹199',
      totalValue: '₹15,920',
      status: 'in-stock',
      lastUpdated: '2024-01-11'
    }
  ]

  const getStockStatus = (current, min) => {
    if (current === 0) return 'out-of-stock'
    if (current <= min) return 'low-stock'
    return 'in-stock'
  }

  const getStockIcon = (status) => {
    switch (status) {
      case 'out-of-stock': return <AlertTriangle size={16} />
      case 'low-stock': return <TrendingDown size={16} />
      default: return <Package size={16} />
    }
  }

  const columns = [
    {
      key: 'product',
      label: 'Product',
      render: (value, row) => (
        <div className="product-info">
          <div className="product-name">{value}</div>
          <div className="product-sku">SKU: {row.sku}</div>
        </div>
      )
    },
    { key: 'category', label: 'Category' },
    {
      key: 'currentStock',
      label: 'Current Stock',
      render: (value, row) => (
        <div className="stock-info">
          <span className={`stock-value ${getStockStatus(value, row.minStock)}`}>
            {value}
          </span>
          <div className="stock-range">
            Min: {row.minStock} | Max: {row.maxStock}
          </div>
        </div>
      )
    },
    { key: 'unitPrice', label: 'Unit Price' },
    { key: 'totalValue', label: 'Total Value' },
    {
      key: 'status',
      label: 'Status',
      render: (value, row) => (
        <div className={`stock-status ${value}`}>
          {getStockIcon(value)}
          <span>{value.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
        </div>
      )
    },
    { key: 'lastUpdated', label: 'Last Updated' },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="action-btn edit" title="Update Stock">
            <Edit size={16} />
          </button>
          <button className="action-btn add" title="Add Stock">
            <Plus size={16} />
          </button>
        </div>
      )
    }
  ]

  const stockSummary = {
    totalProducts: stockData.length,
    inStock: stockData.filter(item => item.status === 'in-stock').length,
    lowStock: stockData.filter(item => item.status === 'low-stock').length,
    outOfStock: stockData.filter(item => item.status === 'out-of-stock').length,
    totalValue: stockData.reduce((sum, item) => {
      const value = parseInt(item.totalValue.replace(/[₹,]/g, ''))
      return sum + value
    }, 0)
  }

  return (
    <div className="all-stock-list">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Stock Management</h1>
          <p>Monitor and manage your inventory levels</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={20} />
          Add Stock
        </button>
      </div>

      <div className="stock-summary">
        <div className="summary-card">
          <div className="summary-icon total">
            <Package size={24} />
          </div>
          <div className="summary-content">
            <h3>{stockSummary.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon in-stock">
            <Package size={24} />
          </div>
          <div className="summary-content">
            <h3>{stockSummary.inStock}</h3>
            <p>In Stock</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon low-stock">
            <TrendingDown size={24} />
          </div>
          <div className="summary-content">
            <h3>{stockSummary.lowStock}</h3>
            <p>Low Stock</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon out-of-stock">
            <AlertTriangle size={24} />
          </div>
          <div className="summary-content">
            <h3>{stockSummary.outOfStock}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-content">
            <h3>₹{stockSummary.totalValue.toLocaleString()}</h3>
            <p>Total Inventory Value</p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Stock Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>

          <select className="filter-select">
            <option value="all">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="accessories">Accessories</option>
            <option value="footwear">Footwear</option>
            <option value="home-kitchen">Home & Kitchen</option>
          </select>

          <button className="btn btn-outline">
            <Filter size={20} />
            More Filters
          </button>
        </div>
      </div>

      <div className="table-container">
        <DataTable
          data={stockData}
          columns={columns}
          searchTerm={searchTerm}
          searchKey="product"
        />
      </div>
    </div>
  )
}

export default AllStockList
