import React, { useState, useEffect, useRef } from "react";
import {
  Truck,
  Package,
  Download,
  Search,
  X,
  Receipt,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Eye,
  Image as ImageIcon,
  CreditCard,
  Wallet
} from "lucide-react";
import DataTable from "../components/DataTable";
import { 
  getSalesReport, 
  getSalesReportSummary,
  getShippingReport,
  getShippingReportSummary,
  getOrderStats
} from "../api/order";
import * as XLSX from 'xlsx-js-style';

import html2canvas from 'html2canvas';
import '../styles/pages/report.scss';

const Reports = () => {
  const [activeTab, setActiveTab] = useState("sales");
  const [salesData, setSalesData] = useState([]);
  const [shippingData, setShippingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [salesStatusFilter, setSalesStatusFilter] = useState("all");
  const [salesSummary, setSalesSummary] = useState({
    totalSales: 0,
    totalCustomers: 0,
    totalQuantity: 0,
    totalValue: 0,
    totalShippingValue: 0,
    totalCodValue: 0,
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
    totalOnlineDiscount: 0
  });
  const [shippingSummary, setShippingSummary] = useState({
    totalShipments: 0,
    totalChargedWeight: 0,
    totalCourierCharges: 0,
    totalSettlement: 0
  });
  const modalRef = useRef(null);
  const summaryRef = useRef(null);

  useEffect(() => {
    if (activeTab === "sales") {
      fetchSalesReport();
      fetchSalesSummary();
    } else {
      fetchShippingReport();
      fetchShippingSummary();
    }
  }, [activeTab, startDate, endDate]);

  // Fetch Sales Report
  const fetchSalesReport = async () => {
    try {
      setLoading(true);
      const response = await getSalesReport(startDate || undefined, endDate || undefined);
      const data = response.data || response;
      setSalesData(data);
    } catch (error) {
      console.error("Error fetching sales report:", error);

    } finally {
      setLoading(false);
    }
  };

  // Fetch Sales Summary
  const fetchSalesSummary = async () => {
    try {
      const data = await getOrderStats(startDate || undefined, endDate || undefined);
      setSalesSummary(data);
    } catch (error) {
      console.error("Error fetching sales summary:", error);
    }
  };

  // Fetch Shipping Report
  const fetchShippingReport = async () => {
    try {
      setLoading(true);
      const response = await getShippingReport(startDate || undefined, endDate || undefined);
      const data = response.data || response;
      setShippingData(data);
    } catch (error) {
      console.error("Error fetching shipping report:", error);

    } finally {
      setLoading(false);
    }
  };

  // Fetch Shipping Summary
  const fetchShippingSummary = async () => {
    try {
      const response = await getShippingReportSummary(startDate || undefined, endDate || undefined);
      const data = response.data || response;
      setShippingSummary(data);
    } catch (error) {
      console.error("Error fetching shipping summary:", error);
    }
  };

  // Download summary as image
  const downloadSummaryAsImage = async () => {
    if (!summaryRef.current) return;

    try {
      // Create a clone for mobile view
      const clone = summaryRef.current.cloneNode(true);
      clone.style.position = 'fixed';
      clone.style.left = '-9999px';
      clone.style.top = '0';
      clone.style.width = '400px';
      
      // Adjust card layout for mobile
      const cardsContainer = clone.querySelector('.summary-cards-container');
      if (cardsContainer) {
        cardsContainer.style.flexDirection = 'column';
        cardsContainer.style.width = '100%';
        Array.from(cardsContainer.querySelectorAll('.stat-card')).forEach(card => {
          card.style.width = '100%';
          card.style.marginBottom = '10px';
          const h3 = card.querySelector('h3');
          if (h3) h3.style.whiteSpace = 'nowrap';
        });
      }

      document.body.appendChild(clone);
      await new Promise(resolve => setTimeout(resolve, 100));

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
      const dateRange = startDate && endDate ? `${startDate}_to_${endDate}` : startDate ? `from_${startDate}` : endDate ? `to_${endDate}` : 'all';
      link.download = `${activeTab}-summary-${dateRange}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

    } catch (error) {
      console.error('Error downloading summary image:', error);

    }
  };

  const applySearch = (data) => {
    if (!searchTerm && salesStatusFilter === "all") return data;
    
    return data.filter(item => {
      const matchesSearch = !searchTerm || 
        item.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = salesStatusFilter === "all" || 
        (item.status?.toLowerCase() === salesStatusFilter.toLowerCase());
      
      return matchesSearch && matchesStatus;
    });
  };

  const handleViewOrder = (row) => {
    setSelectedOrder(row);
    setShowViewModal(true);
  };

  const getStatusClass = (status) => {
    if (!status) return '';
    return status.toLowerCase();
  };

  const getPaymentClass = (method) => {
    if (!method) return '';
    return method.toLowerCase();
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toFixed(2)}`;
  };

  const formatNumber = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    return num;
  };

  const getStatusCounts = () => {
    const counts = {
      all: salesData.length,
      accepted: salesData.filter(item => item.status === 'Accepted').length,
      shipped: salesData.filter(item => item.status === 'Shipped').length,
      delivered: salesData.filter(item => item.status === 'Delivered').length,
      cancelled: salesData.filter(item => item.status === 'Cancelled').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Table Columns
  const baseColumns = [
    { key: "sno", label: "S.No", width: "60px" },
    { key: "orderId", label: "Order ID", render: (value) => <span style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{value}</span> },
    { key: "trackingId", label: "Tracking ID", render: (value) => value || "-" },
    {
      key: "customer",
      label: "Customer",
      render: (value, row) => (
        <div className="customer-profile">
         
          <div className="customer-details">
            <div className="customer-name">{value}</div>
            <div className="customer-phone">{row.phone}</div>
            <div className="customer-city">{row.city}</div>
          </div>
        </div>
      )
    },
    { key: "itemsCount", label: "Products", render: (value) => `${value || 0} items` },
    { key: "quantity", label: "Quantity" },
    { key: "total", label: "Final Total", render: (value) => formatCurrency(value) },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <div className={`order-status ${getStatusClass(value)}`}>
          <span>{value || "N/A"}</span>
        </div>
      )
    },
    { key: "paymentMethod", label: "Payment", render: (value) => (
      <span className={`payment-status ${getPaymentClass(value)}`}>
        {value || "N/A"}
      </span>
    ) },
    { key: "orderDate", label: "Date", render: (value) => value ? new Date(value).toLocaleDateString('en-GB') : '-' },
    { key: "shippingDate", label: "Shipped Date", render: (value) => value ? new Date(value).toLocaleDateString('en-GB') : "-" }
  ];

  const shippingColumns = [
    ...baseColumns,
    { key: "subtotal", label: "Subtotal", render: (value) => formatCurrency(value) },
    { key: "deliveryFee", label: "Delivery Fee", render: (_, row) => formatCurrency((parseFloat(row.deliveryFee) || 0) + (parseFloat(row.shippingFee) || 0)) },
    { key: "codFee", label: "COD Fee", render: (value) => formatCurrency(value) },
    { key: "discount", label: "Discount", render: (value) => formatCurrency(value) },
    { key: "chargedWeight", label: "Weight (gms)", render: (value) => formatNumber(value) },
    { key: "courierCharge", label: "Courier Charge", render: (value) => formatCurrency(value) },
    { key: "codCharge", label: "COD/online commission (Admin)", render: (value) => formatCurrency(value) },
    { key: "settlementAmt", label: "Settlement AMT", render: (value) => formatCurrency(value) },
    { 
      key: "totalProfit", 
      label: "Total profit", 
      render: (_, row) => formatCurrency((row.settlementAmt || 0) - (row.courierCharge || 0)) 
    },
    {
      key: "actions",
      label: "Actions",
      width: "80px",
      render: (_, row) => (
        <div className="action-buttons">
          <button className="action-btn view" title="View Details" onClick={() => handleViewOrder(row)}>
            <Eye size={16} />
          </button>
        </div>
      )
    }
  ];

  const salesColumns = [
    ...baseColumns,
    { key: "chargedWeight", label: "Weight (gms)", render: (value) => formatNumber(value) },
    { key: "courierCharge", label: "Courier Charge", render: (value) => formatCurrency(value) },
    { key: "codCharge", label: "COD/online commission (Admin)", render: (value) => formatCurrency(value) },
    { 
      key: "settlementAmt", 
      label: "Settlement AMT", 
      render: (value) => formatCurrency(value)
    },
    { 
      key: "totalProfit", 
      label: "Total profit", 
      render: (_, row) => formatCurrency((row.settlementAmt || 0) - (row.courierCharge || 0)) 
    },
    {
      key: "actions",
      label: "Actions",
      width: "80px",
      render: (_, row) => (
        <div className="action-buttons">
          <button className="action-btn view" title="View Details" onClick={() => handleViewOrder(row)}>
            <Eye size={16} />
          </button>
        </div>
      )
    }
  ];

  // Export Functions
  const exportToExcel = (data, filename) => {
    if (data.length === 0) {
      return;
    }

    const excelData = data.map((row, index) => ({
      'S.No': index + 1,
      'Order ID': row.orderId,
      'Tracking ID': row.trackingId || '-',
      'Customer Name': row.customer,
      'Phone': row.phone,
      'City': row.city,
      'Order Date': row.orderDate ? new Date(row.orderDate).toLocaleDateString('en-GB') : '-',
      'Shipping Date': row.shippingDate ? new Date(row.shippingDate).toLocaleDateString('en-GB') : '-',
      'Status': row.status || '-',
      'Payment Method': row.paymentMethod,
      'Items': row.itemsCount,
      'Quantity': row.quantity,
      'Subtotal': row.subtotal ? parseFloat(row.subtotal) : 0,
      'Delivery Fee': (parseFloat(row.deliveryFee) || 0) + (parseFloat(row.shippingFee) || 0),
      'COD Fee': row.codFee ? parseFloat(row.codFee) : 0,
      'Discount': row.discount ? parseFloat(row.discount) : 0,
      'Total': row.total ? parseFloat(row.total) : 0,
      'COD/online commission (Admin)': row.codCharge ? parseFloat(row.codCharge) : 0,
      'Settlement AMT': row.settlementAmt ? parseFloat(row.settlementAmt) : 0,
      'Weight (gms)': row.chargedWeight || 0,
      'Courier Charge': row.courierCharge ? parseFloat(row.courierCharge) : 0,
      'Total profit': (parseFloat(row.settlementAmt) || 0) - (parseFloat(row.courierCharge) || 0),
      'Cancel Reason': row.status === 'Cancelled' ? (row.cancelRemarks || '-') : '-'
    }));

    // Add Total Row
    const totals = {
      'S.No': '',
      'Order ID': '',
      'Tracking ID': '',
      'Customer Name': '',
      'Phone': '',
      'City': '',
      'Order Date': '',
      'Shipping Date': '',
      'Status': 'TOTAL',
      'Payment Method': '',
      'Items': excelData.reduce((sum, r) => sum + (r['Items'] || 0), 0),
      'Quantity': excelData.reduce((sum, r) => sum + (r['Quantity'] || 0), 0),
      'Subtotal': parseFloat(excelData.reduce((sum, r) => sum + (r['Subtotal'] || 0), 0).toFixed(2)),
      'Delivery Fee': parseFloat(excelData.reduce((sum, r) => sum + (r['Delivery Fee'] || 0), 0).toFixed(2)),
      'COD Fee': parseFloat(excelData.reduce((sum, r) => sum + (r['COD Fee'] || 0), 0).toFixed(2)),
      'Discount': parseFloat(excelData.reduce((sum, r) => sum + (r['Discount'] || 0), 0).toFixed(2)),
      'Total': parseFloat(excelData.reduce((sum, r) => sum + (r['Total'] || 0), 0).toFixed(2)),
      'COD/online commission (Admin)': parseFloat(excelData.reduce((sum, r) => sum + (r['COD/online commission (Admin)'] || 0), 0).toFixed(2)),
      'Settlement AMT': parseFloat(excelData.reduce((sum, r) => sum + (r['Settlement AMT'] || 0), 0).toFixed(2)),
      'Weight (gms)': '',
      'Courier Charge': parseFloat(excelData.reduce((sum, r) => sum + (r['Courier Charge'] || 0), 0).toFixed(2)),
      'Total profit': parseFloat(excelData.reduce((sum, r) => sum + (r['Total profit'] || 0), 0).toFixed(2)),
      'Cancel Reason': ''
    };
    
    // Add empty row for gap
    excelData.push({
      'S.No': '', 'Order ID': '', 'Tracking ID': '', 'Customer Name': '', 'Phone': '', 'City': '', 'Order Date': '', 'Shipping Date': '', 'Status': '', 'Payment Method': '', 'Items': '', 'Quantity': '', 'Subtotal': '', 'Delivery Fee': '', 'COD Fee': '', 'Discount': '', 'Total': '', 'COD/online commission (Admin)': '', 'Settlement AMT': '', 'Weight (gms)': '', 'Courier Charge': '', 'Total profit': '', 'Cancel Reason': ''
    });
    
    excelData.push(totals);

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Apply background color to TOTAL row
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    const lastRowIndex = range.e.r;
    
    for (let c = 0; c <= range.e.c; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: lastRowIndex, c: c });
      if (!worksheet[cellAddress]) continue;
      
      worksheet[cellAddress].s = {
        fill: { 
          fgColor: { rgb: "E8EAF6" }, // Light indigo background
          patternType: "solid"
        },
        font: { 
          bold: true,
          color: { rgb: "3F51B5" } // Indigo text
        },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "double", color: { rgb: "000000" } }
        },
        alignment: {
          vertical: "center",
          horizontal: "center"
        }
      };
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, filename);
    
    const dateRange = startDate && endDate ? `_${startDate}_to_${endDate}` : startDate ? `_from_${startDate}` : endDate ? `_to_${endDate}` : '';
    const statusFilterText = salesStatusFilter !== "all" ? `_${salesStatusFilter}` : '';
    XLSX.writeFile(workbook, `${filename}${dateRange}${statusFilterText}_${new Date().toISOString().split('T')[0]}.xlsx`);

  };

  const exportShippingReport = () => {
    const sortedData = [...filteredShippingData].sort((a, b) => {
      const order = { 'Shipped': 1, 'Delivered': 2 };
      const aVal = order[a.status] || 99;
      const bVal = order[b.status] || 99;
      return aVal - bVal;
    });
    const dataWithSno = sortedData.map((item, idx) => ({ ...item, sno: idx + 1 }));
    exportToExcel(dataWithSno, 'Shipping_Report');
  };

  const exportSalesReport = () => {
    const sortedData = [...filteredSalesData].sort((a, b) => {
      const order = { 'Shipped': 1, 'Delivered': 2 };
      const aVal = order[a.status] || 99;
      const bVal = order[b.status] || 99;
      return aVal - bVal;
    });
    const dataWithSno = sortedData.map((item, idx) => ({ ...item, sno: idx + 1 }));
    exportToExcel(dataWithSno, 'Sales_Report');
  };

  const resetDateRange = () => {
    setStartDate("");
    setEndDate("");
  };

  const filteredSalesData = applySearch(salesData).map((item, idx) => ({ ...item, sno: idx + 1 }));
  const filteredShippingData = (() => {
    if (!searchTerm) return shippingData.map((item, idx) => ({ ...item, sno: idx + 1 }));
    return shippingData
      .filter(item => 
        item.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((item, idx) => ({ ...item, sno: idx + 1 }));
  })();

  const getModalStatusClass = (status) => {
    if (!status) return '';
    return status.toLowerCase();
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="reports-page">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Reports</h1>
          <p>View and export shipping and sales reports</p>
        </div>
      </div>

      {/* Main Status Tabs */}
      <div className="status-tabs">
        <button className={activeTab === "shipping" ? "tab active" : "tab"} onClick={() => setActiveTab("shipping")}>
          <Truck size={18} />
          <span>Shipping Report</span>
        </button>
        <button className={activeTab === "sales" ? "tab active" : "tab"} onClick={() => setActiveTab("sales")}>
          <Receipt size={18} />
          <span>Sales Report</span>
        </button>
      </div>

      {/* Summary Cards with Download Image Button */}
      <div ref={summaryRef}>
        {/* Sales Summary Cards */}
        {activeTab === "sales" && (
          <div className="summary-section">
            <div className="summary-header">
              <h3>Sales Summary</h3>
              <button onClick={downloadSummaryAsImage} className="download-img-btn" title="Download as image">
                <ImageIcon size={16} /> Download
              </button>
            </div>
            <div className="summary-cards-container orders-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <h3>{salesSummary.totalCustomers}</h3>
                  <p>Total Customers</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                  <Package size={24} />
                </div>
                <div className="stat-content">
                  <h3>{salesSummary.totalSales}</h3>
                  <p style={{ marginBottom: '4px' }}>Total Bills</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
                    <span>COD: {salesSummary.totalCodBills || 0}</span>
                    <span style={{ color: '#d1d5db' }}>|</span>
                    <span>Online: {salesSummary.totalOnlineBills || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', fontSize: '9px', color: '#ef4444', fontWeight: '600', marginTop: '4px' }}>
                    <span>COD Return: {salesSummary.totalCodReturnBills || 0}</span>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
                  <Package size={24} />
                </div>
                <div className="stat-content">
                  <h3>{salesSummary.totalQuantity}</h3>
                  <p style={{ marginBottom: '4px' }}>Total Quantity</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
                    <span>COD: {salesSummary.totalCodQuantity || 0}</span>
                    <span style={{ color: '#d1d5db' }}>|</span>
                    <span>Online: {salesSummary.totalOnlineQuantity || 0}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', fontSize: '9px', color: '#ef4444', fontWeight: '600', marginTop: '4px' }}>
                    <span>COD Return: {salesSummary.totalCodReturnQuantity || 0}</span>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                  <ShoppingBag size={24} />
                </div>
                <div className="stat-content">
                  <h3>₹{(() => {
                    const baseValue = salesSummary.totalBaseValue || 0;
                    return baseValue.toFixed(2);
                  })()}</h3>
                  <p style={{ marginBottom: '4px' }}>Total Base Value (Products)</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
                    <span>COD: ₹{(salesSummary.totalCodBaseValue || 0).toFixed(2)}</span>
                    <span style={{ color: '#d1d5db' }}>|</span>
                    <span>Online: ₹{((salesSummary.totalBaseValue || 0) - (salesSummary.totalCodBaseValue || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}>
                  <Receipt size={24} />
                </div>
                <div className="stat-content">
                  <h3>₹{salesSummary.totalValue?.toFixed(2) || '0.00'}</h3>
                  <p style={{ marginBottom: '4px' }}>Total Value</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
                    <span>COD: ₹{salesSummary.totalCodValue?.toFixed(2) || '0.00'}</span>
                    <span style={{ color: '#d1d5db' }}>|</span>
                    <span>Online: ₹{((salesSummary.totalValue || 0) - (salesSummary.totalCodValue || 0))?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  <CreditCard size={24} />
                </div>
                <div className="stat-content">
                  <h3>₹{Math.round(salesSummary.totalCommission || 0)}</h3>
                  <p style={{ marginBottom: '4px' }}>Total Commission</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
                    <span>COD: ₹{Math.round(salesSummary.totalCodCommission || 0)}</span>
                    <span style={{ color: '#d1d5db' }}>|</span>
                    <span>Online: ₹{Math.round(salesSummary.totalOnlineCommission || 0)}</span>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
                  <Receipt size={24} />
                </div>
                <div className="stat-content">
                  <h3>₹{Math.round(salesSummary.totalSettlement || 0)}</h3>
                  <p style={{ marginBottom: '4px' }}>Total Settlement</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
                    <span>COD: ₹{Math.round(salesSummary.totalCodSettlement || 0)}</span>
                    <span style={{ color: '#d1d5db' }}>|</span>
                    <span>Online: ₹{Math.round(salesSummary.totalOnlineSettlement || 0)}</span>
                  </div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                  <Truck size={24} />
                </div>
                <div className="stat-content">
                  <h3>₹{salesSummary.totalShippingValue?.toFixed(2) || '0.00'}</h3>
                  <p style={{ marginBottom: '4px' }}>Shipped Value</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
                    <span>COD: ₹{salesSummary.totalCodShipping?.toFixed(2) || '0.00'}</span>
                    <span style={{ color: '#d1d5db' }}>|</span>
                    <span>Online: ₹{salesSummary.totalOnlineShipping?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', fontSize: '9px', color: '#ef4444', fontWeight: '600', marginTop: '4px' }}>
                    <span>COD Return: ₹{salesSummary.totalCodReturnShipping?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                  <Wallet size={24} />
                </div>
                <div className="stat-content">
                  <h3>₹{Math.round((salesSummary.totalSettlement || 0) - (salesSummary.totalShippingValue || 0))}</h3>
                  <p style={{ marginBottom: '4px' }}>Final Amount</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
                    <span>COD: ₹{Math.round((salesSummary.totalCodSettlement || 0) - (salesSummary.totalCodShipping || 0))}</span>
                    <span style={{ color: '#d1d5db' }}>|</span>
                    <span>Online: ₹{Math.round((salesSummary.totalOnlineSettlement || 0) - (salesSummary.totalOnlineShipping || 0))}</span>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
                  <Receipt size={24} />
                </div>
                <div className="stat-content">
                  <h3>₹{salesSummary.totalDiscount?.toFixed(2) || '0.00'}</h3>
                  <p>Total Discount</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <h3>₹{(() => {
                    const profitLoss = ((salesSummary.totalSettlement || 0) - (salesSummary.totalShippingValue || 0)) - ((salesSummary.totalBaseValue || 0) - (salesSummary.totalDiscount || 0));
                    return Math.round(profitLoss);
                  })()}</h3>
                  <p style={{ marginBottom: '4px' }}>Profit/Loss</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
                    <span>COD: ₹{(() => {
                      const codProfit = (salesSummary.totalCodSettlement || 0) - ((salesSummary.totalCodShipping || 0) + (salesSummary.totalCodReturnShipping || 0)) - ((salesSummary.totalCodBaseValue || 0) - (salesSummary.totalCodDiscount || 0));
                      return Math.round(codProfit);
                    })()}</span>
                    <span style={{ color: '#d1d5db' }}>|</span>
                    <span>Online: ₹{(() => {
                      const onlineSettlement = (salesSummary.totalOnlineSettlement || 0);
                      const onlineShipping = (salesSummary.totalOnlineShipping || 0);
                      const onlineBaseValue = (salesSummary.totalBaseValue || 0) - (salesSummary.totalCodBaseValue || 0);
                      const onlineDiscount = (salesSummary.totalDiscount || 0) - (salesSummary.totalCodDiscount || 0);
                      const onlineProfit = (onlineSettlement - onlineShipping) - (onlineBaseValue - onlineDiscount);
                      return Math.round(onlineProfit);
                    })()}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Shipping Summary Cards */}
        {activeTab === "shipping" && (
          <div className="summary-section">
            <div className="summary-header">
              <h3>Shipping Summary</h3>
              <button onClick={downloadSummaryAsImage} className="download-img-btn" title="Download as image">
                <ImageIcon size={16} /> Download
              </button>
            </div>
            <div className="summary-cards-container orders-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
                  <Truck size={24} />
                </div>
                <div className="stat-content">
                  <h3>{shippingSummary.totalShipments}</h3>
                  <p>Total Shipments</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}>
                  <Package size={24} />
                </div>
                <div className="stat-content">
                  <h3>{formatNumber(shippingSummary.totalChargedWeight).toFixed(2)} </h3>
                  <p>Total Weight (gms)</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  <DollarSign size={24} />
                </div>
                <div className="stat-content">
                  <h3>{formatCurrency(shippingSummary.totalCourierCharges)}</h3>
                  <p>Total Courier Charges</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <h3>{formatCurrency(shippingSummary.totalSettlement)}</h3>
                  <p>Total Settlement</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Sales Report Status Filter Tabs - Moved outside summaryRef to exclude from download */}
      {activeTab === "sales" && (
        <div className="sales-status-tabs">
          <button className={salesStatusFilter === "all" ? "active" : ""} onClick={() => setSalesStatusFilter("all")}>
            All ({statusCounts.all})
          </button>
          <button className={salesStatusFilter === "accepted" ? "active" : ""} onClick={() => setSalesStatusFilter("accepted")}>
            Accepted ({statusCounts.accepted})
          </button>
          <button className={salesStatusFilter === "shipped" ? "active" : ""} onClick={() => setSalesStatusFilter("shipped")}>
            Shipped ({statusCounts.shipped})
          </button>
          <button className={salesStatusFilter === "delivered" ? "active" : ""} onClick={() => setSalesStatusFilter("delivered")}>
            Delivered ({statusCounts.delivered})
          </button>
          <button className={salesStatusFilter === "cancelled" ? "active" : ""} onClick={() => setSalesStatusFilter("cancelled")}>
            Cancelled ({statusCounts.cancelled})
          </button>
        </div>
      )}

      {/* Filters Section */}
      <div className="filters-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by order ID, tracking ID, customer, phone, city or payment..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="search-input" 
          />
        </div>
        <div className="date-filter-container">
          <div className="date-inputs-group">
            <label>From:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <label>To:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <button type="button" onClick={resetDateRange} className="reset-date-btn">
              <X size={16} />
            </button>
          </div>
          <button className="download-report-btn" onClick={activeTab === "shipping" ? exportShippingReport : exportSalesReport}>
            <Download size={16} /> Download Report
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <DataTable 
            data={activeTab === "shipping" ? filteredShippingData : filteredSalesData} 
            columns={activeTab === "shipping" ? shippingColumns : salesColumns} 
            searchTerm="" 
            searchKey="orderId" 
          />
        </div>
      </div>

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} ref={modalRef}>
            <div className="modal-header">
              <h2 style={{ margin: 0 }}>Order Details - {selectedOrder.orderId}</h2>
              <button onClick={() => setShowViewModal(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body two-column-layout">
              {/* Left Column */}
              <div className="left-column">
                <div className="order-info">
                  <h4>Order Information</h4>
                  <div className="info-row">
                    <span className="info-label">Customer:</span>
                    <span className="info-value">{selectedOrder.customer}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Phone:</span>
                    <span className="info-value">{selectedOrder.phone}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span className="info-value">
                      <span className={`status-badge ${getModalStatusClass(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </span>
                  </div>
                  {selectedOrder.status === 'Cancelled' && (
                    <div className="info-row">
                      <span className="info-label">Cancel Reason:</span>
                      <span className="info-value" style={{ color: '#dc2626', fontWeight: '500' }}>
                        {selectedOrder.cancelRemarks || '-'}
                      </span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Payment:</span>
                    <span className="info-value">{selectedOrder.paymentMethod}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Subtotal:</span>
                    <span className="info-value">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Delivery Fee:</span>
                    <span className="info-value">{formatCurrency((parseFloat(selectedOrder.deliveryFee) || 0) + (parseFloat(selectedOrder.shippingFee) || 0))}</span>
                  </div>
                  <div className="info-row total">
                    <span className="info-label">Total:</span>
                    <span className="info-value">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                  {selectedOrder.chargedWeight > 0 && (
                    <div className="info-row">
                      <span className="info-label">Weight (gms):</span>
                      <span className="info-value">{selectedOrder.chargedWeight} g</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Courier Charge:</span>
                    <span className="info-value">{formatCurrency(selectedOrder.courierCharge)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">COD/online commission (Admin):</span>
                    <span className="info-value">{formatCurrency(selectedOrder.codCharge)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Settlement:</span>
                    <span className="info-value">{formatCurrency(selectedOrder.settlementAmt)}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label" style={{ fontWeight: 'bold' }}>Total Profit:</span>
                    <span className="info-value" style={{ fontWeight: 'bold', color: '#10b981' }}>
                      {formatCurrency((selectedOrder.settlementAmt || 0) - (selectedOrder.courierCharge || 0))}
                    </span>
                  </div>
                </div>

                <div className="shipping-address">
                  <h4>Order Summary</h4>
                  <div className="info-row">
                    <span className="info-label">Products:</span>
                    <span className="info-value">{selectedOrder.itemsCount} items</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Quantity:</span>
                    <span className="info-value">{selectedOrder.quantity}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Order Date:</span>
                    <span className="info-value">{selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('en-GB') : '-'}</span>
                  </div>
                  {selectedOrder.shippingDate && (
                    <div className="info-row">
                      <span className="info-label">Shipping Date:</span>
                      <span className="info-value">{new Date(selectedOrder.shippingDate).toLocaleDateString('en-GB')}</span>
                    </div>
                  )}
                  {selectedOrder.couponCode && selectedOrder.couponCode !== 'N/A' && (
                    <div className="info-row">
                      <span className="info-label">Coupon:</span>
                      <span className="info-value">{selectedOrder.couponCode}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Order Items */}
              <div className="right-column">
                <div className="order-items-section">
                  <h4>Order Items</h4>
                  <div className="order-items">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <img src={item.imageUrl} alt={item.name} />
                        <div className="item-details">
                          <p className="item-name"><strong>{item.name}</strong></p>
                          <p className="item-variant">Size: {item.size}, Color: {item.color}</p>
                          {item.sizeVariantId && (
                            <p className="variant-id">Variant ID: <strong>{item.sizeVariantId}</strong></p>
                          )}
                          <p className="item-price">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;