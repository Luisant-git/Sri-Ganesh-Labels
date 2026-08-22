import React, { useState, useEffect, useRef } from 'react'
import { TrendingUp, Users, ShoppingCart, Package, Star, IndianRupee, ImageIcon } from 'lucide-react'
import { getQuickStats, getRecentActivity, getTopPerformers } from '../api/overviewApi'
import { getSalesComparison } from '../api/dashboardApi'
import html2canvas from 'html2canvas'

const Overview = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [recentActivity, setRecentActivity] = useState([])
  const [topPerformers, setTopPerformers] = useState([])
  const [salesComparisonType, setSalesComparisonType] = useState('yearly');
  const [salesComparisonData, setSalesComparisonData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth().toString());
  const salesComparisonRef = useRef(null);

  useEffect(() => {
    fetchOverviewData()
  }, [])

  useEffect(() => {
    fetchSalesComparisonData();
  }, [salesComparisonType, selectedYear, selectedMonth]);

  const fetchSalesComparisonData = async () => {
    try {
      const data = await getSalesComparison(salesComparisonType, selectedYear, selectedMonth);
      setSalesComparisonData(data);
    } catch (error) {
      console.error('Error fetching sales comparison:', error);
    }
  };

  const downloadSalesComparisonAsImage = async () => {
    try {
      const clone = salesComparisonRef.current.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '1000px';
      document.body.appendChild(clone);
      await new Promise(resolve => setTimeout(resolve, 80));
      const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        windowWidth: 1000,
        windowHeight: clone.scrollHeight,
      });
      document.body.removeChild(clone);
      const link = document.createElement('a');
      link.download = `sales-comparison-${salesComparisonType}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading sales comparison image:', error);
      alert('Failed to download sales comparison image');
    }
  };

  const fetchOverviewData = async () => {
    try {
      const [statsData, activityData, performersData] = await Promise.all([
        getQuickStats(),
        getRecentActivity(),
        getTopPerformers()
      ])
      setStats(statsData)
      setRecentActivity(activityData)
      setTopPerformers(performersData)
    } catch (error) {
      console.error('Error fetching overview data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickStats = stats ? [
    { label: 'Total Revenues', value: stats.totalRevenue.toLocaleString(), icon: IndianRupee, color: 'blue' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: TrendingUp, color: 'green' },
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users, color: 'purple' },
    { label: 'Avg. Order Value', value: `₹${stats.avgOrderValue.toLocaleString()}`, icon: ShoppingCart, color: 'orange' }
  ] : []

  if (loading) {
    return <div className="overview"><div className="page-header"><h1>Loading...</h1></div></div>
  }

  return (
    <div className="overview">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Overview</h1>
          <p>Quick snapshot of your business performance</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {salesComparisonType === 'monthly' && (
            <>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563' }}>Filter by month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  backgroundColor: 'white',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#374151',
                  cursor: 'pointer'
                }}
              >
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                  <option key={month} value={i}>{month}</option>
                ))}
              </select>
            </>
          )}
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#4b5563' }}>Filter by year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              outline: 'none',
              backgroundColor: 'white',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - i;
              return <option key={year} value={year}>{year}</option>;
            })}
          </select>
        </div>
      </div>

      <div className="quick-stats">
        {quickStats.map((stat, index) => (
          <div key={index} className={`quick-stat-card ${stat.color}`}>
            <div className="stat-icon">
              <stat.icon size={24} />
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Sales Comparison Table */}
      <div
        ref={salesComparisonRef}
        style={{
          marginBottom: '32px',
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', backgroundColor: '#a5d6a7', padding: '10px', borderRadius: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827', textAlign: 'center', width: '100%' }}>
            Sri Ganesh Labels {salesComparisonType === 'yearly' ? 'Monthwise' : salesComparisonType === 'monthly' ? 'Weekwise' : 'Daywise'} Sales
          </h3>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
            <button
              onClick={downloadSalesComparisonAsImage}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#10b981',
                color: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Download table as image"
            >
              <ImageIcon size={14} />
              <span>Download</span>
            </button>
            <div style={{ width: '1px', height: '20px', backgroundColor: '#81c784', margin: '0 4px' }}></div>
            <button
              onClick={() => setSalesComparisonType('yearly')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: salesComparisonType === 'yearly' ? '#10b981' : 'white',
                color: salesComparisonType === 'yearly' ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Yearly
            </button>
            <button
              onClick={() => setSalesComparisonType('monthly')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: salesComparisonType === 'monthly' ? '#10b981' : 'white',
                color: salesComparisonType === 'monthly' ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setSalesComparisonType('weekly')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: salesComparisonType === 'weekly' ? '#10b981' : 'white',
                color: salesComparisonType === 'weekly' ? 'white' : '#374151',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              Weekly
            </button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <thead>
              <tr style={{ backgroundColor: '#fff3cd' }}>
                <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#111827', fontWeight: 700 }}>{salesComparisonType === 'yearly' ? 'Month' : salesComparisonType === 'monthly' ? 'Week' : 'Day'}</th>
                <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#111827', fontWeight: 700 }}>Total Customer</th>
                <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#111827', fontWeight: 700 }}>Total Bills</th>
                <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#111827', fontWeight: 700 }}>Total QTY</th>
                <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#111827', fontWeight: 700 }}>Online Payment</th>
                <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#111827', fontWeight: 700 }}>COD Payment</th>
                <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#111827', fontWeight: 700 }}>Total Amount</th>
                <th style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', color: '#111827', fontWeight: 700 }}>COD Return</th>
              </tr>
            </thead>
            <tbody>
              {salesComparisonData.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 700, backgroundColor: '#fff8e1' }}>{row.period}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 500, backgroundColor: '#fff8e1' }}>{row.totalCustomer}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 500, backgroundColor: '#fff8e1' }}>{row.totalBills}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 500, backgroundColor: '#fff8e1' }}>{row.totalQty}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 500, backgroundColor: '#fff8e1' }}>₹{row.onlinePayment}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 500, backgroundColor: '#fff8e1' }}>₹{row.codPayment}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 700, backgroundColor: '#fff8e1' }}>₹{row.totalAmount}</td>
                  <td style={{ padding: '12px', border: '1px solid #e5e7eb', textAlign: 'center', fontWeight: 500, backgroundColor: '#fff8e1' }}>{row.totalCodReturn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="overview-grid">
        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'order' && <ShoppingCart size={16} />}
                  {activity.type === 'customer' && <Users size={16} />}
                  {activity.type === 'product' && <Package size={16} />}
                  {activity.type === 'review' && <Star size={16} />}
                  {activity.type === 'stock' && <TrendingUp size={16} />}
                </div>
                <div className="activity-content">
                  <p>{activity.message}</p>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Top Performers</h3>
          </div>
          <div className="performers-list">
            {topPerformers.map((performer, index) => (
              <div key={index} className="performer-item" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img 
                  src={performer.image || 'https://via.placeholder.com/40'} 
                  alt={performer.name} 
                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} 
                />
                <div className="performer-info" style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>{performer.name}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{performer.metric}</p>
                </div>
                <div className={`performer-status ${performer.status}`}>
                  {performer.status === 'trending' && <TrendingUp size={16} />}
                  {performer.status === 'stable' && <span className="stable-dot"></span>}
                  {performer.status === 'declining' && <TrendingUp size={16} className="declining" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview
