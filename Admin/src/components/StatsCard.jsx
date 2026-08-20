import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const StatsCard = ({ title, value, change, trend, icon: Icon, color }) => {
  return (
    <div className={`stats-card ${color}`}>
      <div className="stats-content">
        <div className="stats-header">
          <h3>{title}</h3>
          <div className="stats-icon">
            <Icon size={24} />
          </div>
        </div>
        <div className="stats-value">
          <span className="value">{value}</span>
          <div className={`stats-change ${trend}`}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{change}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatsCard
