import React from 'react';
import { Search, Calendar, Bell, UserCircle, ArrowUp, ArrowDown, Globe, Facebook, FileText, ChevronDown } from 'lucide-react';
import { FaPinterest } from 'react-icons/fa';
import './analytics.scss'
// Reusable Stats Card Component
const StatsCard = ({ title, period, value, change, trend, icon: Icon }) => {
  const isUp = trend === 'up';
  return (
    <div className="stats-card">
      <div className="stats-card__header">
        <div className="stats-card__info">
          <p className="stats-card__title">{title}</p>
          <p className="stats-card__period">{period}</p>
        </div>
        <div className="stats-card__icon">
          <Icon size={24} />
        </div>
      </div>
      <div className="stats-card__body">
        <h3 className="stats-card__value">{value}</h3>
        <div className={`stats-card__change ${isUp ? 'up' : 'down'}`}>
          {isUp ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          <span>{change}</span>
        </div>
      </div>
    </div>
  );
};

// Main Analytics Component
const Analytics = () => {
  const statsData = [
    { title: 'Total Traffic', value: '59,845', change: '11%', trend: 'up', icon: Globe },
    { title: 'Facebook Traffic', value: '14,365', change: '11%', trend: 'up', icon: Facebook },
    { title: 'Pinterest Traffic', value: '18,023', change: '17%', trend: 'down', icon: FaPinterest},
    { title: 'Organic Traffic', value: '27,457', change: '11%', trend: 'up', icon: FileText },
  ];

  const visitorsData = [
    { name: 'Dhaka', color: 'var(--chart-color-1)' },
    { name: 'Chattogram', color: 'var(--chart-color-2)' },
    { name: 'Rajshahi', color: 'var(--chart-color-3)' },
    { name: 'Khulna', color: 'var(--chart-color-4)' },
    { name: 'Rangpur', color: 'var(--chart-color-5)' },
    { name: 'Barishal', color: 'var(--chart-color-6)' },
  ];
  
  const osData = [
    { name: 'Android', percentage: 28, color: 'var(--chart-color-red)' },
    { name: 'iOS', percentage: 23, color: 'var(--chart-color-purple)' },
    { name: 'Windows', percentage: 19, color: 'var(--chart-color-blue)' },
    { name: 'Linux', percentage: 14, color: 'var(--chart-color-yellow)' },
    { name: 'Mac', percentage: 9, color: 'var(--chart-color-green)' },
    { name: 'Others', percentage: 5, color: 'var(--chart-color-indigo)' },
  ];

  return (
    <div className="analytics-container">
      {/* Header */}
      <header className="analytics-header">
        <h1 className="header-title">Analytics</h1>
        <div className="header-actions">
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>
          <button className="icon-btn date-btn">
            <Calendar size={20} />
            <span>30 May</span>
          </button>
          <button className="icon-btn">
            <Bell size={20} />
          </button>
          <button className="icon-btn">
            <UserCircle size={24} />
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="analytics-grid">
        {/* Total Traffic */}
        <div className="card total-traffic">
          <div className="card-header">
            <div className="card-title-group">
              <h3>Total Traffic</h3>
              <span className="change-badge up"><ArrowUp size={14}/> +42%</span>
            </div>
            <div className="sort-by">
              <span>Sort by</span>
              <button className="date-filter">Last 7 days <ChevronDown size={16} /></button>
            </div>
          </div>
          <div className="chart-container">
            <svg width="100%" height="200" viewBox="0 0 500 200" preserveAspectRatio="none">
              <path d="M0,120 Q50,80 100,90 T200,70 T300,100 T400,60 T500,80" stroke="var(--primary-color)" strokeWidth="2.5" fill="none" />
              <path d="M0,150 Q50,110 100,120 T200,100 T300,130 T400,90 T500,110" stroke="#cccccc" strokeWidth="2" fill="none" />
              <g className="chart-labels" fontSize="12" fill="#999">
                <text x="20" y="195">22 July</text>
                <text x="90" y="195">24 July</text>
                <text x="170" y="195">26 July</text>
                <text x="260" y="195">28 July</text>
                <text x="340" y="195">29 July</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Visitors Area */}
        <div className="card visitors-area">
          <div className="card-header">
            <h3>Visitors Area</h3>
            <div className="sort-by">
              <span>Sort by</span>
              <button className="date-filter">Last 7 days <ChevronDown size={16} /></button>
            </div>
          </div>
          <div className="pie-chart-content">
            <div className="pie-chart-container">
               {/* Using CSS conic-gradient for a simpler pie chart */}
               <div className="pie-chart"></div>
            </div>
            <ul className="legend">
              {visitorsData.map(item => (
                <li key={item.name}>
                  <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Stats Cards Grid */}
        <div className="stats-grid-container">
          {statsData.map((stat, index) => (
            <StatsCard key={index} {...stat} period="Last 30 days" />
          ))}
        </div>

        {/* Operating System */}
        <div className="card os-stats">
           <div className="card-header">
            <h3>Operating System</h3>
            <div className="sort-by">
              <span>Sort by</span>
              <button className="date-filter">Last 30 days <ChevronDown size={16} /></button>
            </div>
          </div>
          <div className="donut-chart-content">
             <ul className="legend">
              {osData.map(item => (
                <li key={item.name}>
                  <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                  {item.name} ({item.percentage}%)
                </li>
              ))}
            </ul>
            <div className="donut-chart-container">
              {/* Using CSS conic-gradient for donut chart */}
              <div className="donut-chart"></div>
            </div>
          </div>
        </div>

        {/* Social Media Traffic */}
        <div className="card social-media-traffic">
          <div className="card-header">
            <div className="card-title-group">
              <h3>Social Media Traffic</h3>
              <span className="change-badge down"><ArrowDown size={14}/> -13%</span>
            </div>
            <div className="sort-by">
              <span>Sort by</span>
              <button className="date-filter">Last 30 days <ChevronDown size={16} /></button>
            </div>
          </div>
          <div className="chart-container">
             <svg width="100%" height="200" viewBox="0 0 500 200" preserveAspectRatio="none">
              <path d="M0,100 Q50,120 100,100 T200,140 T300,90 T400,120 T500,100" stroke="var(--danger-color)" strokeWidth="2.5" fill="none" />
              <path d="M0,80 Q50,90 100,85 T200,100 T300,70 T400,90 T500,80" stroke="#cccccc" strokeWidth="2" fill="none" />
              <g className="chart-labels" fontSize="12" fill="#999">
                <text x="20" y="195">21 Sep</text>
                <text x="90" y="195">23 Sep</text>
                <text x="170" y="195">25 Sep</text>
                <text x="260" y="195">27 Sep</text>
                <text x="340" y="195">28 Sep</text>
              </g>
            </svg>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;