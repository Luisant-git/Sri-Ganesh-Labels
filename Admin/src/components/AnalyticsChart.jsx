import React from 'react'

const AnalyticsChart = ({ metric }) => {
  const getChartData = () => {
    switch (metric) {
      case 'revenue':
        return 'Revenue Analytics Chart'
      case 'orders':
        return 'Orders Analytics Chart'
      case 'customers':
        return 'Customers Analytics Chart'
      default:
        return 'Analytics Chart'
    }
  }

  return (
    <div className="analytics-chart">
      <div className="chart-placeholder">
        <p>{getChartData()}</p>
        <div className="chart-mock">
          <div className="chart-bars">
            {Array.from({ length: 7 }, (_, i) => (
              <div 
                key={i} 
                className="chart-bar" 
                style={{ height: `${Math.random() * 100 + 20}px` }}
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsChart
