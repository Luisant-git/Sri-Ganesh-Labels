import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Calendar,
  Bell,
  UserCircle,
  Wallet,
  ShoppingCart,
  Users,
  Truck,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Package,
  Clock,
  Receipt,
  TrendingUp,
  ShoppingBag,
  CreditCard,
  ImageIcon,
  Archive,
  CheckCircle,
  AlertCircle,
  UserCheck
} from 'lucide-react';

// Import child components
import SalesAnalytics from '../components/SalesAnalytics';
import TopSellingProducts from '../components/TopSellingProducts';
import { getDashboardStats, getSalesAnalytics, getTopProducts, getCurrentOffers, getRecentOrders } from '../api/dashboardApi';
import { getProducts } from '../api/productApi';
import { getOrderStats, getProductReport } from '../api/order';
import { getCustomerStats } from '../api/customerApi';
import html2canvas from 'html2canvas';
import './Dashboard.scss'

// You can create a separate component for this, but for simplicity, it's here
const StatsCard = ({ title, value, period, change, trend, icon: Icon }) => {
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

// Main Dashboard Component
const Dashboard = () => {
  const [statsData, setStatsData] = useState([]);
  const [offers, setOffers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const productsScrollRef = React.useRef(null);
  const statsRef = useRef(null);
  const returnSummaryRef = useRef(null);
  const productStatsRef = useRef(null);
  const customerStatsRef = useRef(null);
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    totalInitialStock: 0,
    totalSaleStock: 0,
    totalCurrentStock: 0,
    totalSalesAmount: 0,
  });
  const [customerStats, setCustomerStats] = useState({
    totalCustomers: 0,
    loginCustomers: 0,
    orderedCustomers: 0,
    cancelledCustomers: 0,
    abandonedCustomers: 0,
  });
  const [orderStats, setOrderStats] = useState({
    totalSales: 0,
    totalCustomers: 0,
    totalQuantity: 0,
    totalValue: 0,
    totalShippingValue: 0,
    totalCodValue: 0,
    totalOnlineValue: 0,
    totalCodReturnValue: 0,
    totalCommission: 0,
    totalSettlement: 0,
    totalCodBills: 0,
    totalOnlineBills: 0,
    totalCodQuantity: 0,
    totalOnlineQuantity: 0,
    totalCodShipping: 0,
    totalOnlineShipping: 0,
    totalCodCommission: 0,
    totalOnlineCommission: 0,
    totalCodSettlement: 0,
    totalOnlineSettlement: 0,
    totalBaseValue: 0,
    totalCodBaseValue: 0,
    totalOnlineBaseValue: 0,
    totalDiscount: 0,
    totalCodDiscount: 0,
    totalOnlineDiscount: 0,
    totalCodReturnBills: 0,
    totalCodReturnQuantity: 0,
    totalCodReturnBaseValue: 0,
    totalCodReturnDiscount: 0,
    totalCodReturnShipping: 0,
    totalCodReturnCommission: 0,
    totalCodReturnSettlement: 0,
    totalCodReturnCustomers: 0
  });

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const getYearDateRange = () => {
    return {
      startDate: `${selectedYear}-01-01`,
      endDate: `${selectedYear}-12-31`
    };
  };

  const scrollProducts = (direction) => {
    if (productsScrollRef.current) {
      const scrollAmount = 300;
      productsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchOrderStats();
    fetchProductStats();
    fetchCustomerStatsData();
  }, [selectedYear]);

  const fetchDashboardData = async () => {
    try {
      const [stats, offersData, ordersData, productsData] = await Promise.all([
        getDashboardStats(selectedYear),
        getCurrentOffers(),
        getRecentOrders(),
        getProducts()
      ]);

      const lowStock = productsData.filter(p => {
        const hasLowStock = p.colors?.some(color => 
          color.sizes?.some(size => parseInt(size.quantity || 0) < 5)
        );
        return hasLowStock && p.status !== 'inactive';
      }).slice(0, 10);

      setStatsData([
        {
          title: 'Total Revenue',
          period: 'Last 30 days',
          value: stats.totalRevenue.value,
          change: stats.totalRevenue.change,
          trend: stats.totalRevenue.trend,
          icon: Wallet
        },
        {
          title: 'Total Order',
          period: 'Last 30 days',
          value: stats.totalOrder.value,
          change: stats.totalOrder.change,
          trend: stats.totalOrder.trend,
          icon: ShoppingCart
        },
        {
          title: 'Total Customer',
          period: 'Last 30 days',
          value: stats.totalCustomer.value,
          change: stats.totalCustomer.change,
          trend: stats.totalCustomer.trend,
          icon: Users
        },
        {
          title: 'Pending Delivery',
          period: 'Last 30 days',
          value: stats.pendingDelivery.value,
          change: stats.pendingDelivery.change,
          trend: stats.pendingDelivery.trend,
          icon: Truck
        }
      ]);

      setOffers(offersData);
      setRecentOrders(ordersData);
      setLowStockProducts(lowStock);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const { startDate, endDate } = getYearDateRange();
      const stats = await getOrderStats(startDate, endDate);
      setOrderStats(stats);
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  const fetchProductStats = async () => {
    try {
      const { startDate, endDate } = getYearDateRange();
      const data = await getProductReport(startDate, endDate);
      if (Array.isArray(data)) {
        setProductStats({
          totalProducts: data.length,
          totalInitialStock: data.reduce((sum, p) => sum + (p.initialStock || 0), 0),
          totalSaleStock: data.reduce((sum, p) => sum + (p.saleStock || 0), 0),
          totalCurrentStock: data.reduce((sum, p) => sum + (p.currentStock || 0), 0),
          totalSalesAmount: data.reduce((sum, p) => sum + (p.totalSalesAmount || 0), 0),
        });
      }
    } catch (error) {
      console.error('Error fetching product stats:', error);
    }
  };

  const fetchCustomerStatsData = async () => {
    try {
      const { startDate, endDate } = getYearDateRange();
      const stats = await getCustomerStats(startDate, endDate);
      setCustomerStats(stats);
    } catch (error) {
      console.error('Error fetching customer stats:', error);
    }
  };

  const downloadProductStatsAsImage = async () => {
    try {
      const clone = productStatsRef.current.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '400px';
      document.body.appendChild(clone);
      await new Promise(resolve => setTimeout(resolve, 80));
      const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        windowWidth: 400,
        windowHeight: clone.scrollHeight,
      });
      document.body.removeChild(clone);
      const link = document.createElement('a');
      link.download = `product-sales-summary-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading product stats image:', error);
    }
  };

  const downloadCustomerStatsAsImage = async () => {
    try {
      const clone = customerStatsRef.current.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '400px';
      document.body.appendChild(clone);
      await new Promise(resolve => setTimeout(resolve, 80));
      const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        windowWidth: 400,
        windowHeight: clone.scrollHeight,
      });
      document.body.removeChild(clone);
      const link = document.createElement('a');
      link.download = `customers-summary-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading customer stats image:', error);
    }
  };

  const downloadStatsAsImage = async () => {
    try {
      const clone = statsRef.current.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '400px';

      const cardsContainer = clone.querySelector('[data-summary-cards]');
      if (cardsContainer) {
        cardsContainer.style.flexDirection = 'column';
        cardsContainer.style.width = '100%';
        Array.from(cardsContainer.querySelectorAll('.stat-card')).forEach(c => {
          c.style.flex = 'none';
          c.style.minWidth = 'unset';
          c.style.width = '100%';
          const h3 = c.querySelector('h3');
          if (h3) h3.style.whiteSpace = 'nowrap';
        });
      }

      document.body.appendChild(clone);
      await new Promise(resolve => setTimeout(resolve, 80));

      const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        windowWidth: 400,
        windowHeight: clone.scrollHeight,
      });

      document.body.removeChild(clone);

      const link = document.createElement('a');
      link.download = `sales-summary-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading stats image:', error);
      alert('Failed to download stats image');
    }
  };

  const downloadReturnSummaryAsImage = async () => {
    try {
      const clone = returnSummaryRef.current.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '400px';
      document.body.appendChild(clone);
      await new Promise(resolve => setTimeout(resolve, 80));
      const canvas = await html2canvas(clone, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        windowWidth: 400,
        windowHeight: clone.scrollHeight,
      });
      document.body.removeChild(clone);
      const link = document.createElement('a');
      link.download = `return-summary-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading return summary image:', error);
    }
  };

  const todayDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  if (loading) {
    return <div className="dashboard-container">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
 
      <header className="dashboard-header">
        <h1 className="header-title">Dashboard</h1>
        <div className="header-actions">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
            <div className="search-bar">
              <Search size={20} className="search-icon" />
              <input type="text" placeholder="Search..." />
            </div>
          </div>
        </div>
      </header>

      {/* Sales Summary Card */}
      <div
        ref={statsRef}
        style={{
          marginTop: '20px',
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: '#111827',
            }}
          >
            Sales Summary
          </h3>

          <button
            type="button"
            onClick={downloadStatsAsImage}
            style={{
              padding: '8px 14px',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: '#10b981',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 500,
            }}
            title="Download summary as image"
          >
            <ImageIcon size={16} />
            <span>Download</span>
          </button>
        </div>

        <div
          data-summary-cards
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* First Row: 5 Cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#ecfdf5', borderRadius: '8px', color: '#10b981' }}>
                  <Users size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Customers</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{orderStats.totalCustomers}</h3>
            </div>

            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}>
                  <Package size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Bills</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{orderStats.totalSales}</h3>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', fontSize: '11px', color: '#9ca3af', fontWeight: 500, marginTop: '6px' }}>
                <span>COD: {orderStats.totalCodBills || 0}</span>
                <span style={{ color: '#d1d5db' }}>|</span>
                <span>Online: {orderStats.totalOnlineBills || 0}</span>
              </div>
            </div>

            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#f59e0b' }}>
                  <Package size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Quantity</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{orderStats.totalQuantity}</h3>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', fontSize: '11px', color: '#9ca3af', fontWeight: 500, marginTop: '6px' }}>
                <span>COD: {orderStats.totalCodQuantity || 0}</span>
                <span style={{ color: '#d1d5db' }}>|</span>
                <span>Online: {orderStats.totalOnlineQuantity || 0}</span>
              </div>
            </div>

            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#f3e8ff', borderRadius: '8px', color: '#9333ea' }}>
                  <ShoppingBag size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Base Value</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>₹{(orderStats.totalBaseValue || 0).toFixed(2)}</h3>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', fontSize: '11px', color: '#9ca3af', fontWeight: 500, marginTop: '6px' }}>
                <span>COD: ₹{(orderStats.totalCodBaseValue || 0).toFixed(2)}</span>
                <span style={{ color: '#d1d5db' }}>|</span>
                <span>Online: ₹{(orderStats.totalOnlineBaseValue || 0).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '8px', color: '#22c55e' }}>
                  <Receipt size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Value</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>₹{(orderStats.totalValue || 0).toFixed(2)}</h3>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', fontSize: '11px', color: '#9ca3af', fontWeight: 500, marginTop: '6px' }}>
                <span>COD: ₹{(orderStats.totalCodValue || 0).toFixed(2)}</span>
                <span style={{ color: '#d1d5db' }}>|</span>
                <span>Online: ₹{(orderStats.totalOnlineValue || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Second Row: 5 Cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
                  <CreditCard size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Commission</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>₹{Math.round(orderStats.totalCommission || 0)}</h3>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', fontSize: '11px', color: '#9ca3af', fontWeight: 500, marginTop: '6px' }}>
                <span>COD: ₹{Math.round(orderStats.totalCodCommission || 0)}</span>
                <span style={{ color: '#d1d5db' }}>|</span>
                <span>Online: ₹{Math.round(orderStats.totalOnlineCommission || 0)}</span>
              </div>
            </div>

            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#d1fae5', borderRadius: '8px', color: '#059669' }}>
                  <Receipt size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Settlement</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>₹{Math.round(orderStats.totalSettlement || 0)}</h3>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', fontSize: '11px', color: '#9ca3af', fontWeight: 500, marginTop: '6px' }}>
                <span>COD: ₹{Math.round(orderStats.totalCodSettlement || 0)}</span>
                <span style={{ color: '#d1d5db' }}>|</span>
                <span>Online: ₹{Math.round(orderStats.totalOnlineSettlement || 0)}</span>
              </div>
            </div>

            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#e0e7ff', borderRadius: '8px', color: '#4f46e5' }}>
                  <Truck size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Shipped Value</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>₹{(orderStats.totalShippingValue || 0).toFixed(2)}</h3>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', fontSize: '11px', color: '#9ca3af', fontWeight: 500, marginTop: '6px' }}>
                <span>COD: ₹{(orderStats.totalCodShipping || 0).toFixed(2)}</span>
                <span style={{ color: '#d1d5db' }}>|</span>
                <span>Online: ₹{(orderStats.totalOnlineShipping || 0).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#e0f2fe', borderRadius: '8px', color: '#0284c7' }}>
                  <Wallet size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Final Amount</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>₹{Math.round((orderStats.totalSettlement || 0) - (orderStats.totalShippingValue || 0))}</h3>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', fontSize: '11px', color: '#9ca3af', fontWeight: 500, marginTop: '6px' }}>
                <span>COD: ₹{Math.round((orderStats.totalCodSettlement || 0) - (orderStats.totalCodShipping || 0))}</span>
                <span style={{ color: '#d1d5db' }}>|</span>
                <span>Online: ₹{Math.round((orderStats.totalOnlineSettlement || 0) - (orderStats.totalOnlineShipping || 0))}</span>
              </div>
            </div>

            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#ef4444' }}>
                  <Receipt size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Discount</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>₹{(orderStats.totalDiscount || 0).toFixed(2)}</h3>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', fontSize: '11px', color: '#9ca3af', fontWeight: 500, marginTop: '6px' }}>
                <span>COD: ₹{(orderStats.totalCodDiscount || 0).toFixed(2)}</span>
                <span style={{ color: '#d1d5db' }}>|</span>
                <span>Online: ₹{(orderStats.totalOnlineDiscount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#e8f5e9', borderRadius: '8px', color: '#2e7d32' }}>
                  <TrendingUp size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Profit/Loss</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>₹{(() => {
                const profitLoss = ((orderStats.totalSettlement || 0) - (orderStats.totalShippingValue || 0)) - ((orderStats.totalBaseValue || 0) - (orderStats.totalDiscount || 0));
                return Math.round(profitLoss);
              })()}</h3>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '8px', fontSize: '11px', color: '#9ca3af', fontWeight: 500, marginTop: '6px' }}>
                <span>COD: ₹{(() => {
                  const codProfit = (orderStats.totalCodSettlement || 0) - ((orderStats.totalCodShipping || 0) + (orderStats.totalCodReturnShipping || 0)) - ((orderStats.totalCodBaseValue || 0) - (orderStats.totalCodDiscount || 0));
                  return Math.round(codProfit);
                })()}</span>
                <span style={{ color: '#d1d5db' }}>|</span>
                <span>Online: ₹{(() => {
                  const onlineSettlement = (orderStats.totalOnlineSettlement || 0);
                  const onlineShipping = (orderStats.totalOnlineShipping || 0);
                  const onlineBaseValue = (orderStats.totalBaseValue || 0) - (orderStats.totalCodBaseValue || 0);
                  const onlineDiscount = (orderStats.totalDiscount || 0) - (orderStats.totalCodDiscount || 0);
                  const onlineProfit = (onlineSettlement - onlineShipping) - (onlineBaseValue - onlineDiscount);
                  return Math.round(onlineProfit);
                })()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* Product Sales Summary */}
      <div
        ref={productStatsRef}
        style={{
          marginTop: '20px',
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>Product Sales Summary</h3>
          <button
            type="button"
            onClick={downloadProductStatsAsImage}
            style={{
              padding: '8px 14px',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: '#10b981',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 500,
            }}
            title="Download product summary as image"
          >
            <ImageIcon size={16} />
            <span>Download</span>
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: '1 1 0', minWidth: '160px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}>
                <ShoppingCart size={20} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Products</p>
            </div>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{productStats.totalProducts}</h3>
          </div>
          <div style={{ flex: '1 1 0', minWidth: '160px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#f59e0b' }}>
                <Archive size={20} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Initial Stock</p>
            </div>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{productStats.totalInitialStock}</h3>
          </div>
          <div style={{ flex: '1 1 0', minWidth: '160px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', backgroundColor: '#d1fae5', borderRadius: '8px', color: '#10b981' }}>
                <CheckCircle size={20} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Sale Stock</p>
            </div>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{productStats.totalSaleStock}</h3>
          </div>
          <div style={{ flex: '1 1 0', minWidth: '160px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#ef4444' }}>
                <Package size={20} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Current Stock</p>
            </div>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{productStats.totalCurrentStock}</h3>
          </div>
          <div style={{ flex: '1 1 0', minWidth: '160px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', backgroundColor: '#ede9fe', borderRadius: '8px', color: '#8b5cf6' }}>
                <TrendingUp size={20} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Sales Amount</p>
            </div>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>₹{productStats.totalSalesAmount.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Return Summary */}
      <div
        ref={returnSummaryRef}
        style={{
          marginTop: '20px',
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>Return Summary</h3>
          <button
            type="button"
            onClick={downloadReturnSummaryAsImage}
            style={{
              padding: '8px 14px',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: '#10b981',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 500,
            }}
            title="Download return summary as image"
          >
            <ImageIcon size={16} />
            <span>Download</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {/* Card 1: Total Return Customers */}
          <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#ef4444' }}>
                <Users size={20} />
              </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Return Customers</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{orderStats.totalCodReturnCustomers || 0}</h3>
            </div>

            {/* Card 2: Total Return Bills */}
            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#ef4444' }}>
                  <Package size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Return Bills</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{orderStats.totalCodReturnBills || 0}</h3>
            </div>

            {/* Card 3: Total Return Quantity */}
            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#ef4444' }}>
                  <Package size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Return Quantity</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{orderStats.totalCodReturnQuantity || 0}</h3>
            </div>

            {/* Card 4: Total Return Base Value */}
            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#ef4444' }}>
                  <ShoppingBag size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Return Base Value</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>₹{(orderStats.totalCodReturnBaseValue || 0).toFixed(2)}</h3>
            </div>

            {/* Card 5: Total Return Value */}
            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#ef4444' }}>
                  <Receipt size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Return Value</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>₹{(orderStats.totalCodReturnValue || 0).toFixed(2)}</h3>
            </div>

            {/* Card 6: Return Shipped Value */}
            <div style={{ flex: '1 1 0', minWidth: '180px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ padding: '8px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#ef4444' }}>
                  <Truck size={20} />
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Return Shipped Value</p>
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>₹{(orderStats.totalCodReturnShipping || 0).toFixed(2)}</h3>
            </div>
          </div>
        </div>

      {/* Customers Summary */}
      <div
        ref={customerStatsRef}
        style={{
          marginTop: '20px',
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827' }}>Customers Summary</h3>
          <button
            type="button"
            onClick={downloadCustomerStatsAsImage}
            style={{
              padding: '8px 14px',
              borderRadius: '999px',
              border: 'none',
              backgroundColor: '#10b981',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 500,
            }}
            title="Download customer summary as image"
          >
            <ImageIcon size={16} />
            <span>Download</span>
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: '1 1 0', minWidth: '160px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}>
                <Users size={20} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Total Logged Customers</p>
            </div>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{customerStats.totalCustomers}</h3>
          </div>
          <div style={{ flex: '1 1 0', minWidth: '160px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', backgroundColor: '#ecfdf5', borderRadius: '8px', color: '#10b981' }}>
                <UserCheck size={20} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Non Order Customers</p>
            </div>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{customerStats.loginCustomers}</h3>
          </div>
          <div style={{ flex: '1 1 0', minWidth: '160px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#f59e0b' }}>
                <ShoppingBag size={20} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Ordered Customers</p>
            </div>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{customerStats.orderedCustomers}</h3>
          </div>
          <div style={{ flex: '1 1 0', minWidth: '160px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', backgroundColor: '#fef2f2', borderRadius: '8px', color: '#dc2626' }}>
                <AlertCircle size={20} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Cancelled Customers</p>
            </div>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{customerStats.cancelledCustomers}</h3>
          </div>
          <div style={{ flex: '1 1 0', minWidth: '160px', padding: '16px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ padding: '8px', backgroundColor: '#fff7ed', borderRadius: '8px', color: '#f97316' }}>
                <AlertCircle size={20} />
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Abandoned Customers</p>
            </div>
            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>{customerStats.abandonedCustomers}</h3>
          </div>
        </div>
      </div>

      {/* <main className="dashboard-grid">
       
        {statsData.length > 0 && statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}

     
        <div className="card recent-orders">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <span className="order-count">{recentOrders.length} orders</span>
          </div>
          <div className="orders-table" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{order.customer}</div>
                        <div className="customer-email">{order.email}</div>
                        <div className="customer-phone">{order.phone}</div>
                      </div>
                    </td>
                    <td>{order.items} items</td>
                    <td>{order.total}</td>
                    <td>
                      <span className={`order-status ${order.status}`}>
                        {order.status === 'pending' && <Clock size={16} />}
                        {order.status === 'processing' && <Package size={16} />}
                        {order.status === 'shipped' && <Truck size={16} />}
                        {order.status === 'delivered' && <CheckCircle size={16} />}
                        <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </span>
                    </td>
                    <td>{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

     
        <div className="card low-stock-products">
          <div className="card-header">
            <h3>Low Stock Alert</h3>
            <span className="stock-count">{lowStockProducts.length} products</span>
          </div>
          <div className="stock-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {lowStockProducts.length > 0 ? lowStockProducts.map((product) => {
              const lowStockVariants = [];
              product.colors?.forEach(color => {
                color.sizes?.forEach(size => {
                  if (parseInt(size.quantity || 0) < 5) {
                    lowStockVariants.push(`${color.name} - ${size.size} (${size.quantity})`);
                  }
                });
              });
              return (
                <div key={product.id} className="stock-item">
                  <img src={product.gallery?.[0]?.url || product.colors?.[0]?.image || '/placeholder.svg'} alt={product.name} />
                  <div className="stock-info">
                    <h4>{product.name}</h4>
                    <p className="stock-level" style={{ fontSize: '12px', color: '#dc2626' }}>
                      {lowStockVariants.join(', ')}
                    </p>
                  </div>
                  <span className="stock-badge low">{lowStockVariants.length}</span>
                </div>
              );
            }) : <p style={{color: '#6b7280', textAlign: 'center'}}>No low stock products</p>}
          </div>
        </div>

   
        <div className="card sales-analytics">
          <SalesAnalytics />
        </div>

     
        <div className="card top-products">
          <div className="card-header">
            <h3>Top Selling Products</h3>
            <div className="nav-arrows">
              <button onClick={() => scrollProducts('left')}><ArrowLeft size={16} /></button>
              <button onClick={() => scrollProducts('right')}><ArrowRight size={16} /></button>
            </div>
          </div>
          <TopSellingProducts scrollRef={productsScrollRef} />
        </div>

        
        <div className="card current-offers">
          <div className="card-header">
            <h3>Current Offer</h3>
          </div>
          <div className="offers-list">
            {offers.map((offer, index) => (
              <div key={index} className="offer-item">
                <p className="offer-title">{offer.title}</p>
                <p className="offer-status">{offer.status}</p>
                <div className="offer-progress-bar">
                  <div 
                    className={`progress ${offer.type}`}
                    style={{ width: `${offer.progress}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main> */}
    </div>
  );
};

export default Dashboard;