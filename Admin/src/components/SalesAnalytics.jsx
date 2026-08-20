import React, { useState, useEffect } from 'react';
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getSalesAnalytics } from '../api/dashboardApi';

const SalesAnalytics = () => {
  const [salesData, setSalesData] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const data = await getSalesAnalytics();
      setSalesData(data);
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
    }
  };

  const totalIncome = salesData.reduce((sum, item) => sum + item.sales, 0);
  const avgSales = salesData.length > 0 ? totalIncome / salesData.length : 0;
  
  const dateRange = salesData.length > 0 
    ? `${salesData[0].month} - ${salesData[salesData.length - 1].month} ${new Date().getFullYear()}`
    : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  
  const maxSales = Math.max(...salesData.map(d => d.sales), 1);
  const chartHeight = 200;
  const chartWidth = 500;
  const pointSpacing = chartWidth / (salesData.length - 1 || 1);
  
  const pathData = salesData.map((item, i) => {
    const x = i * pointSpacing;
    const y = chartHeight - (item.sales / maxSales) * chartHeight;
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');
  
  const areaPath = salesData.length > 0 ? `${pathData} L${chartWidth},${chartHeight} L0,${chartHeight} Z` : '';
  return (
    <>
      <div className="card-header">
        <h3>Sales Analytic</h3>
        <div className="sort-by">
          <span>Period</span>
          <button className="date-filter">
            {dateRange} <ChevronDown size={16} />
          </button>
        </div>
      </div>
      <div className="analytics-summary">
        <div className="summary-item">
          <p>Income</p>
          <h4>₹{totalIncome.toFixed(0)}</h4>
        </div>
        <div className="summary-item">
          <p>Avg Sales</p>
          <h4>₹{avgSales.toFixed(0)}</h4>
        </div>
        <div className="summary-item">
          <p>Total Months</p>
          <h4>{salesData.length}</h4>
        </div>
      </div>
      <div className="chart-container">
        <svg width="100%" height="260" viewBox="0 0 500 260" preserveAspectRatio="none">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary-color)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--primary-color)" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Y-axis grid lines */}
          {[0, 25, 50, 75, 100].map(percent => (
            <line key={percent} x1="0" y1={chartHeight * (1 - percent/100)} x2="500" y2={chartHeight * (1 - percent/100)} stroke="#f0f0f0" strokeWidth="0.5" />
          ))}
          
          {/* Area */}
          {areaPath && <path d={areaPath} fill="url(#areaGradient)" />}
          
          {/* Line */}
          {pathData && (
            <path
              d={pathData}
              stroke="var(--primary-color)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          
          {/* Data points */}
          {salesData.map((item, i) => {
            const cx = i * pointSpacing;
            const cy = chartHeight - (item.sales / maxSales) * chartHeight;
            return (
              <g key={i}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="8"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={hoveredPoint === i ? "5" : "3"}
                  fill="var(--primary-color)"
                  style={{ pointerEvents: 'none', transition: 'r 0.2s' }}
                />
                {hoveredPoint === i && (
                  <g>
                    <rect
                      x={cx - 35}
                      y={cy < 40 ? cy + 10 : cy - 35}
                      width="70"
                      height="28"
                      fill="#1f2937"
                      rx="4"
                      style={{ pointerEvents: 'none' }}
                    />
                    <text
                      x={cx}
                      y={cy < 40 ? cy + 23 : cy - 23}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                      fontWeight="600"
                      style={{ pointerEvents: 'none' }}
                    >
                      {item.month}
                    </text>
                    <text
                      x={cx}
                      y={cy < 40 ? cy + 34 : cy - 12}
                      textAnchor="middle"
                      fill="white"
                      fontSize="11"
                      fontWeight="700"
                      style={{ pointerEvents: 'none' }}
                    >
                      ₹{item.sales.toFixed(0)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          
          {/* X-axis labels */}
          <g className="chart-labels" fontSize="9" fill="#999">
            {salesData.map((item, i) => (
              <text key={i} x={i * pointSpacing} y="225" textAnchor="middle">
                {item.month}
              </text>
            ))}
          </g>
          
          {/* Y-axis labels */}
          <g className="y-axis-labels" fontSize="9" fill="#999">
            <text x="-5" y="205" textAnchor="end">0</text>
            <text x="-5" y="155" textAnchor="end">{(maxSales * 0.25).toFixed(0)}</text>
            <text x="-5" y="105" textAnchor="end">{(maxSales * 0.5).toFixed(0)}</text>
            <text x="-5" y="55" textAnchor="end">{(maxSales * 0.75).toFixed(0)}</text>
            <text x="-5" y="5" textAnchor="end">{maxSales.toFixed(0)}</text>
          </g>
        </svg>
      </div>
    </>
  );
};

export default SalesAnalytics;