import React, { useState } from 'react'
import { Search, Filter, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import '../styles/pages/tracker-stocks.scss'

const TrackerStocks = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const trackedStocks = [
    {
      id: 1,
      product: 'Wireless Headphones',
      currentStock: 45,
      threshold: 20,
      trend: 'up',
      movement: '+5',
      lastUpdated: '2 hours ago',
      status: 'normal'
    },
    {
      id: 2,
      product: 'Cotton T-Shirt',
      currentStock: 8,
      threshold: 15,
      trend: 'down',
      movement: '-12',
      lastUpdated: '1 hour ago',
      status: 'low'
    },
    {
      id: 3,
      product: 'Smartphone Case',
      currentStock: 0,
      threshold: 5,
      trend: 'down',
      movement: '-3',
      lastUpdated: '30 minutes ago',
      status: 'critical'
    }
  ]

  const getTrendIcon = (trend) => {
    return trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical': return <AlertTriangle size={16} />
      case 'low': return <TrendingDown size={16} />
      default: return <TrendingUp size={16} />
    }
  }

  return (
    <div className="tracker-stocks">
      <div className="page-header">
        <div className="header-left">
          <h1>Stock Tracker</h1>
          <p>Monitor stock movements and trends</p>
        </div>
      </div>

      <div className="tracker-stats">
        <div className="stat-card critical">
          <div className="stat-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3>3</h3>
            <p>Critical Items</p>
          </div>
        </div>
        <div className="stat-card low">
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
          <div className="stat-content">
            <h3>8</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="stat-card normal">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>45</h3>
            <p>Normal Stock</p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search tracked items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select className="filter-select">
            <option value="all">All Status</option>
            <option value="critical">Critical</option>
            <option value="low">Low Stock</option>
            <option value="normal">Normal</option>
          </select>
          <button className="btn btn-outline">
            <Filter size={20} />
            More Filters
          </button>
        </div>
      </div>

      <div className="tracker-list">
        {trackedStocks.map(item => (
          <div key={item.id} className={`tracker-item ${item.status}`}>
            <div className="item-info">
              <div className="item-status">
                {getStatusIcon(item.status)}
              </div>
              <div className="item-details">
                <h4>{item.product}</h4>
                <p>Current Stock: {item.currentStock} | Threshold: {item.threshold}</p>
              </div>
            </div>
            <div className="item-trend">
              <div className={`trend-indicator ${item.trend}`}>
                {getTrendIcon(item.trend)}
                <span>{item.movement}</span>
              </div>
              <div className="last-updated">{item.lastUpdated}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrackerStocks
