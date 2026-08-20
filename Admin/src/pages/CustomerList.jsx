import React, { useState, useEffect, useRef } from 'react'
import { Search, UserPlus, Download, Package, Image as ImageIcon, X, CreditCard, Users, UserCheck, ShoppingBag, AlertCircle, Phone } from 'lucide-react'
import { getAllCustomers, getAllCustomersForExport, getCustomerStats } from '../api/customerApi'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'; 

const CustomerList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all')
  const [customerStats, setCustomerStats] = useState({
  totalCustomers: 0,
  loginCustomers: 0,
  orderedCustomers: 0,
  cancelledCustomers: 0,
  abandonedCustomers: 0
});

const statsRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers()
    }, 500)
    return () => clearTimeout(timer)
  },  [page, searchTerm, customerTypeFilter, startDate, endDate])

  // Debounced date filter for stats (only one useEffect)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomerStats()
    }, 500)
    return () => clearTimeout(timer)
  }, [startDate, endDate])

const fetchCustomerStats = async () => {
  try {
    // Pass null/undefined if dates are empty
    const stats = await getCustomerStats(
      startDate || undefined, 
      endDate || undefined
    );
    setCustomerStats(stats);
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    setCustomerStats({
      totalCustomers: 0,
      loginCustomers: 0,
      orderedCustomers: 0,
      cancelledCustomers: 0,
      abandonedCustomers: 0
    });
  }
};


const downloadCustomerStatsAsImage = async () => {
  if (!statsRef.current) return;

  try {
    const canvas = await html2canvas(statsRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY,
      scrollX: -window.scrollX,
      windowHeight: statsRef.current.scrollHeight,
    });

    const link = document.createElement('a');
    link.download = `customers-summary-stats-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error downloading stats image:', error);
    alert('Failed to download stats image');
  }
};

  const fetchCustomers = async () => {
    setLoading(true)
    try {
const response = await getAllCustomers(
  page,
  limit,
  searchTerm,
  customerTypeFilter, 
  startDate,
  endDate
);
      setCustomers(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (filter) => {
    setCustomerTypeFilter(filter)
    setPage(1)
  }


  const resetDateRange = () => {
  setStartDate('');
  setEndDate('');
};
  const exportCustomersExcel = async () => {
  try {
    let allCustomers = [];
    let currentPage = 1;
    const limit = 100; // small batch size (safe)
    let totalPages = 1;

    // 🔁 Fetch all pages
    while (currentPage <= totalPages) {
      const response = await getAllCustomers(
        currentPage,
        limit,
        searchTerm,
        customerTypeFilter, // statusFilter
        startDate,
        endDate
      );

      allCustomers = [...allCustomers, ...response.data];
      totalPages = response.totalPages;
      currentPage++;
    }

    if (allCustomers.length === 0) {
      alert('No customers found');
      return;
    }

    // 📄 Convert to Excel
    const excelData = allCustomers.map((customer, index) => ({
      'S.No': index + 1,
      'Customer Name': customer.name || 'N/A',
      'Email': customer.email || 'N/A',
      'Phone': customer.phone || 'N/A',
      'Total Orders': customer.ordersCount || 0,
      'Total Spent': `₹${(customer.totalSpent || 0).toFixed(2)}`,
      'Status': customer.status || 'N/A',
      'Join Date': customer.joinDate
        ? new Date(customer.joinDate).toLocaleDateString('en-GB')
        : 'N/A',
      'Last Order': customer.lastOrder
        ? new Date(customer.lastOrder).toLocaleDateString('en-GB')
        : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

    XLSX.writeFile(
      workbook,
      `customers_${new Date().toISOString().split('T')[0]}.xlsx`
    );

  } catch (error) {
    console.error('Export error:', error);
    alert('Export failed');
  }
};

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      render: (value, row) => (
        <div className="customer-profile">
          <div className="customer-avatar">
            {value.charAt(0).toUpperCase()}
          </div>
          <div className="customer-details">
            <div className="customer-name">{value}</div>
            <div className="customer-email">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Contact',
      render: (value, row) => (
        <div className="contact-info">
          <div className="phone">
            <Phone size={14} />
            {value}
          </div>
        </div>
      )
    },
    { key: 'ordersCount', label: 'Orders', render: (value) => `${value} orders` },
    { key: 'totalSpent', label: 'Total Spent', render: (value) => `₹${value.toFixed(2)}` },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`customer-status ${value.toLowerCase()}`}>
          {value}
        </span>
      )
    },
    { key: 'joinDate', label: 'Join Date', render: (value) => new Date(value).toLocaleDateString() },
    { key: 'lastOrder', label: 'Last Order', render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A' },
  ]

  return (
    <div className="customer-list">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Customers</h1>
          <p>Manage your customer database</p>
        </div>
      </div>
{/* Customers Summary + Stats (OrdersList image-download style) */}
<div
  className="orders-stats"
  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
>
  <div
    ref={statsRef}
    style={{
      marginTop: '4px',
      padding: '12px 16px',
      borderRadius: '12px',
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
    }}
  >
    {/* Header row with title + subtitle + image-download button */}
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h3
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: 600,
            color: '#111827',
          }}
        >
          Customers Summary
        </h3>
       
      </div>

      {/* SAME LOOK as OrdersList: green pill, image icon, "Download" */}
      <button
        type="button"
        onClick={downloadCustomerStatsAsImage}
        style={{
          padding: '6px 10px',
          borderRadius: '999px',
          border: 'none',
          backgroundColor: '#10b981',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          fontWeight: 500,
        }}
        title="Download summary as image"
      >
        <ImageIcon size={14} />
        <span>Download</span>
      </button>
    </div>

    {/* Stat cards row – same visual as OrdersList cards */}
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
      }}
    >
      {/* Total Customers */}
      <div
        className="stat-card"
        style={{ flex: '1 1 0', minWidth: '180px', cursor: 'pointer' }}
        onClick={() => handleCardClick('all')}
      >
        <div
          className="stat-icon"
          style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}
        >
          <Users size={24} />
        </div>
        <div className="stat-content">
          <h3>{customerStats.totalCustomers}</h3>
          <p>Total Logged Customers</p>
        </div>
      </div>

      {/* Login Customers */}
      <div
        className="stat-card"
        style={{ flex: '1 1 0', minWidth: '180px', cursor: 'pointer' }}
        onClick={() => handleCardClick('login')}
      >
        <div
          className="stat-icon"
          style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}
        >
          <UserCheck size={24} />
        </div>
        <div className="stat-content">
          <h3>{customerStats.loginCustomers}</h3>
          <p>Non Order Customers</p>
        </div>
      </div>

      {/* Ordered Customers */}
      <div
        className="stat-card"
        style={{ flex: '1 1 0', minWidth: '180px', cursor: 'pointer' }}
       onClick={() => handleCardClick('ordered')}
      >
        <div
          className="stat-icon"
          style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}
        >
          <ShoppingBag size={24} />
        </div>
        <div className="stat-content">
          <h3>{customerStats.orderedCustomers}</h3>
          <p>Ordered Customers</p>
        </div>
      </div>

      {/* Cancelled Customers */}
      <div
        className="stat-card"
        style={{ flex: '1 1 0', minWidth: '180px', cursor: 'pointer' }}
        onClick={() => handleCardClick('cancelled')}
      >
        <div
          className="stat-icon"
          style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
        >
          <X size={24} />
        </div>
        <div className="stat-content">
          <h3>{customerStats.cancelledCustomers}</h3>
          <p>Cancelled Customers</p>
        </div>
      </div>

      {/* Abandoned Customers */}
      <div
        className="stat-card"
        style={{ flex: '1 1 0', minWidth: '180px', cursor: 'pointer' }}
        onClick={() => handleCardClick('abandoned')}
      >
        <div
          className="stat-icon"
          style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}
        >
          <AlertCircle size={24} />
        </div>
        <div className="stat-content">
          <h3>{customerStats.abandonedCustomers}</h3>
          <p>Abandoned Customers</p>
        </div>
      </div>
    </div>
  </div>
</div>

<div className="status-tabs">
  <button
    className={customerTypeFilter === "all" ? "tab active" : "tab"}
    onClick={() => handleCardClick("all")}
  >
    All
  </button>
  <button
    className={customerTypeFilter === "login" ? "tab active" : "tab"}
    onClick={() => handleCardClick("login")}
  >
    Non Order Customers ({customerStats.loginCustomers})
  </button>
  <button
    className={customerTypeFilter === "ordered" ? "tab active" : "tab"}
    onClick={() => handleCardClick("ordered")}
  >
    Ordered Customers ({customerStats.orderedCustomers})
  </button>
  <button
    className={customerTypeFilter === "cancelled" ? "tab active" : "tab"}
    onClick={() => handleCardClick("cancelled")}
  >
    Cancelled Customers ({customerStats.cancelledCustomers})
  </button>
  <button
    className={customerTypeFilter === "abandoned" ? "tab active" : "tab"}
    onClick={() => handleCardClick("abandoned")}
  >
    Abandoned Customers ({customerStats.abandonedCustomers})
  </button>
</div>
      <div className="filters-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
<div
  className="date-filter-container"
  style={{ display: 'flex', gap: '12px', alignItems: 'center' }}
>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
    }}
  >
    <label
      style={{
        fontSize: '13px',
        fontWeight: '500',
        color: '#555',
        margin: 0,
      }}
    >
      From:
    </label>
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      style={{
        padding: '6px 10px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '13px',
        outline: 'none',
        backgroundColor: 'white',
      }}
    />

    <label
      style={{
        fontSize: '13px',
        fontWeight: '500',
        color: '#555',
        margin: 0,
      }}
    >
      To:
    </label>
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      style={{
        padding: '6px 10px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '13px',
        outline: 'none',
        backgroundColor: 'white',
      }}
    />

    {/* RESET ICON */}
   <button
     type="button"
     onClick={() => {
       setStartDate("");
       setEndDate("");
     }}
     className="reset-date-btn"
     title="Reset dates"
   >
     <X size={16} />
   </button>
  </div>

  <button
    onClick={exportCustomersExcel}
    title="Export Customers to Excel"
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 14px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#4169E1',
      color: '#ffffff',
      fontSize: '13px',
      fontWeight: 500,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    }}
  >
    <Download size={16} /> Download Report
  </button>
</div>
      </div>

      <div className="table-container">
        {loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.key}>{column.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map((row) => (
                    <tr key={row.id}>
                      {columns.map((column) => (
                        <td key={column.key}>
                          {column.render 
                            ? column.render(row[column.key], row)
                            : row[column.key]
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination-controls">
              <button 
                className="pagination-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
              >
                Previous
              </button>
              <span className="pagination-info">Page {page} of {totalPages} ({total} customers)</span>
              <button 
                className="pagination-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CustomerList
