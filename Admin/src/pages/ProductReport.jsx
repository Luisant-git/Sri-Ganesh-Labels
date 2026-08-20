import React, { useState, useEffect, useRef } from 'react';
import { Download, X, Package, TrendingUp, Camera, ShoppingCart, Archive, CheckCircle } from 'lucide-react';
import { Select } from 'antd';
import { getProductReport } from '../api/order';
import * as XLSX from 'xlsx-js-style';
import html2canvas from 'html2canvas';
import 'antd/dist/reset.css';
import '../styles/pages/report.scss';
import '../styles/pages/productReport.scss';

const ProductSalesReport = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const screenshotRef = useRef(null);
  
  // Separate filter states
  const [productFilter, setProductFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [variantFilter, setVariantFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [saleTypeFilter, setSaleTypeFilter] = useState('all'); // 'all', 'single', 'bundle'

  const [selectedProductSales, setSelectedProductSales] = useState(null);
  const [showSalesModal, setShowSalesModal] = useState(false);

  const handleViewSalesDetail = (product) => {
    if (!product.sales || product.sales.length === 0) return;
    setSelectedProductSales(product);
    setShowSalesModal(true);
  };

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await getProductReport(startDate, endDate);
      console.log('Product Report Data:', data);
      console.log('Sample product:', data[0]);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching product report:', error);
    } finally {
      setLoading(false);
    }
  };

  const takeScreenshot = async () => {
    if (screenshotRef.current) {
      try {
        setIsCapturing(true);
        const canvas = await html2canvas(screenshotRef.current, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const link = document.createElement('a');
        const dateRange = startDate && endDate ? `_${startDate}_to_${endDate}` : startDate ? `_from_${startDate}` : endDate ? `_to_${endDate}` : '';
        link.download = `product-sales-report${dateRange}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Error taking screenshot:', error);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const exportToExcel = () => {
    const excelData = filteredProducts.map((product, index) => ({
      'S.No': index + 1,
      'Product Name': product.productName,
      'Color': product.color,
      'Size': product.size,
      'Variant ID': product.sizeVariantId,
      'HSN Code': product.hsnCode,
      'Initial Stock': product.initialStock,
      'Current Stock': product.currentStock,
      'Sale Stock': product.saleStock,
      'Price': product.price,
      'Total Sales Amount': product.totalSalesAmount
    }));

    // Add totals row
    const totals = {
      'S.No': '',
      'Product Name': '',
      'Color': '',
      'Size': '',
      'Variant ID': '',
      'HSN Code': 'TOTAL',
      'Initial Stock': filteredProducts.reduce((sum, p) => sum + p.initialStock, 0),
      'Current Stock': filteredProducts.reduce((sum, p) => sum + p.currentStock, 0),
      'Sale Stock': filteredProducts.reduce((sum, p) => sum + p.saleStock, 0),
      'Price': '',
      'Total Sales Amount': filteredProducts.reduce((sum, p) => sum + p.totalSalesAmount, 0).toFixed(2)
    };

    excelData.push({});
    excelData.push(totals);

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Product Sales Report');

    const dateRange = startDate && endDate ? `_${startDate}_to_${endDate}` : startDate ? `_from_${startDate}` : endDate ? `_to_${endDate}` : '';
    XLSX.writeFile(workbook, `product-sales-report${dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Get unique values for dropdowns
  const uniqueProducts = [...new Set(products.map(p => p.productName))].filter(Boolean).sort();
  const uniqueColors = [...new Set(products.map(p => p.color))].filter(Boolean).sort();
  const uniqueSizes = [...new Set(products.map(p => p.size))].filter(Boolean).sort();
  const uniqueVariants = [...new Set(products.map(p => p.sizeVariantId))].filter(Boolean).sort();
  const uniquePrices = [...new Set(products.map(p => p.price))].filter(Boolean).sort((a, b) => a - b);
  const uniqueSubcategories = [...new Set(products.map(p => p.subcategoryName))].filter(Boolean).sort();
  
  console.log('Unique Subcategories:', uniqueSubcategories);
  console.log('Total products:', products.length);

  const filteredProducts = products.filter(product => {
    const matchesProduct = !productFilter || product.productName === productFilter;
    const matchesColor = !colorFilter || product.color === colorFilter;
    const matchesSize = !sizeFilter || product.size === sizeFilter;
    const matchesVariant = !variantFilter || String(product.sizeVariantId) === variantFilter;
    const matchesPrice = !priceFilter || String(product.price) === priceFilter;
    const matchesSubcategory = !subcategoryFilter || product.subcategoryName === subcategoryFilter;
    const matchesSearch = !searchTerm || 
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.size?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(product.sizeVariantId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(product.price || '').includes(searchTerm) ||
      String(product.totalSalesAmount || '').includes(searchTerm);

    // Sale Type filter: check if product's sales contain any of the requested type
    let matchesSaleType = true;
    if (saleTypeFilter === 'bundle') {
      matchesSaleType = product.sales?.some(s => s.saleType === 'Bundle') ?? false;
    } else if (saleTypeFilter === 'single') {
      matchesSaleType = product.sales?.some(s => s.saleType === 'Single') ?? false;
    }
    
    return matchesProduct && matchesColor && matchesSize && matchesVariant && matchesPrice && matchesSubcategory && matchesSearch && matchesSaleType;
  });

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '20px' }} className="reports-page">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>Product Sales Report</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>View delivered product sales with stock tracking and revenue</p>
        </div>
      </div>

      {/* Filters - Row 1: Dropdowns */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'nowrap', alignItems: 'flex-end', overflowX: 'auto' }}>
        <div style={{ flex: '0 0 200px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>Category Name</label>
          <Select
            showSearch
            allowClear
            placeholder="Select Category"
            value={subcategoryFilter || undefined}
            onChange={(value) => setSubcategoryFilter(value || '')}
            style={{ width: '200px' }}
            size="middle"
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={[
              ...uniqueSubcategories.map(subcategory => ({
                value: subcategory,
                label: subcategory
              }))
            ]}
          />
        </div>
        <div style={{ flex: '0 0 200px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>Product</label>
          <Select
            showSearch
            allowClear
            placeholder="Select Product"
            value={productFilter || undefined}
            onChange={(value) => setProductFilter(value || '')}
            style={{ width: '200px' }}
            size="middle"
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={[
              ...uniqueProducts.map(product => ({
                value: product,
                label: product
              }))
            ]}
          />
        </div>
        <div style={{ flex: '0 0 150px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>Color</label>
          <Select
            showSearch
            allowClear
            placeholder="Select Color"
            value={colorFilter || undefined}
            onChange={(value) => setColorFilter(value || '')}
            style={{ width: '150px' }}
            size="middle"
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={[
              ...uniqueColors.map(color => ({
                value: color,
                label: color
              }))
            ]}
          />
        </div>
        <div style={{ flex: '0 0 120px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>Size</label>
          <Select
            showSearch
            allowClear
            placeholder="Select Size"
            value={sizeFilter || undefined}
            onChange={(value) => setSizeFilter(value || '')}
            style={{ width: '120px' }}
            size="middle"
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={[
              ...uniqueSizes.map(size => ({
                value: size,
                label: size
              }))
            ]}
          />
        </div>
        <div style={{ flex: '0 0 150px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374141' }}>Variant ID</label>
          <Select
            showSearch
            allowClear
            placeholder="Select Variant"
            value={variantFilter || undefined}
            onChange={(value) => setVariantFilter(value || '')}
            style={{ width: '150px' }}
            size="middle"
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={[
              ...uniqueVariants.map(variant => ({
                value: variant,
                label: variant
              }))
            ]}
          />
        </div>
        <div style={{ flex: '0 0 120px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>Price</label>
          <Select
            showSearch
            allowClear
            placeholder="Select Price"
            value={priceFilter || undefined}
            onChange={(value) => setPriceFilter(value || '')}
            style={{ width: '120px' }}
            size="middle"
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={[
              ...uniquePrices.map(price => ({
                value: String(price),
                label: `₹${price}`
              }))
            ]}
          />
        </div>
      </div>

      {/* Filters - Row 2: Date, Sale Type, Actions */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'nowrap', alignItems: 'flex-end', overflowX: 'auto' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>Sale Type</label>
          <div style={{ display: 'flex', gap: '4px' }}>
            {[['all', 'All'], ['single', 'Single'], ['bundle', 'Bundle']].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setSaleTypeFilter(value)}
                style={{
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: '500',
                  border: '1px solid',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  borderColor: saleTypeFilter === value ? '#4169E1' : '#d1d5db',
                  background: saleTypeFilter === value ? '#4169E1' : 'white',
                  color: saleTypeFilter === value ? 'white' : '#6b7280',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', visibility: 'hidden' }}>&#8203;</label>
          <button
            onClick={() => { 
              setStartDate(''); 
              setEndDate(''); 
              setProductFilter('');
              setColorFilter('');
              setSizeFilter('');
              setVariantFilter('');
              setPriceFilter('');
              setSubcategoryFilter('');
              setSearchTerm('');
              setSaleTypeFilter('all');
            }}
            style={{ padding: '10px 16px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <X size={16} /> Reset All
          </button>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', visibility: 'hidden' }}>&#8203;</label>
          <button
            onClick={takeScreenshot}
            disabled={isCapturing}
            style={{ padding: '10px 16px', background: isCapturing ? '#93c5fd' : '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: isCapturing ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', minWidth: '130px', justifyContent: 'center' }}
          >
            {isCapturing ? (
              <>
                <div style={{ width: '16px', height: '16px', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                <span>Capturing...</span>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </>
            ) : (
              <>
                <Camera size={16} /> Screenshot
              </>
            )}
          </button>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', visibility: 'hidden' }}>&#8203;</label>
          <button
            onClick={exportToExcel}
            style={{ padding: '10px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-section">
        <div className="summary-cards-container orders-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
              <ShoppingCart size={24} />
            </div>
            <div className="stat-content">
              <h3>{filteredProducts.length}</h3>
              <p>Total Products</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
              <Archive size={24} />
            </div>
            <div className="stat-content">
              <h3>{filteredProducts.reduce((sum, p) => sum + p.initialStock, 0)}</h3>
              <p>Initial Stock</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h3>{filteredProducts.reduce((sum, p) => sum + p.saleStock, 0)}</h3>
              <p>Sale Stock</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
              <Package size={24} />
            </div>
            <div className="stat-content">
              <h3>{filteredProducts.reduce((sum, p) => sum + p.currentStock, 0)}</h3>
              <p>Current Stock</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#ede9fe', color: '#8b5cf6' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>₹{filteredProducts.reduce((sum, p) => sum + p.totalSalesAmount, 0).toFixed(2)}</h3>
              <p>Total Sales Amount</p>
            </div>
          </div>
        </div>
      </div>
      {/* Screenshot Container */}
      <div ref={screenshotRef} style={{ background: 'white' }}>
        {/* Filter Info for Screenshot */}
        {(startDate || endDate || subcategoryFilter || productFilter || colorFilter || sizeFilter || variantFilter || priceFilter || searchTerm) && (
          <div style={{ padding: '16px', background: '#f9fafb', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Applied Filters:</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#6b7280' }}>
              {startDate && <span><strong>From:</strong> {startDate}</span>}
              {endDate && <span><strong>To:</strong> {endDate}</span>}
              {subcategoryFilter && <span><strong>Category:</strong> {subcategoryFilter}</span>}
              {productFilter && <span><strong>Product:</strong> {productFilter}</span>}
              {colorFilter && <span><strong>Color:</strong> {colorFilter}</span>}
              {sizeFilter && <span><strong>Size:</strong> {sizeFilter}</span>}
              {variantFilter && <span><strong>Variant ID:</strong> {variantFilter}</span>}
              {priceFilter && <span><strong>Price:</strong> ₹{priceFilter}</span>}
              {searchTerm && <span><strong>Search:</strong> {searchTerm}</span>}
            </div>
          </div>
        )}

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>S.No</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Image</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Product</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Color</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Size</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Variant ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Sale Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Initial Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Sale Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Current Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Price</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#374151' }}>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                <td colSpan="12" style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                    <Package size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                    <div>No products found</div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>{index + 1}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <img src={product.imageUrl} alt={product.productName} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>{product.productName}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{product.color}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{product.size}</td>
                    <td style={{ padding: '12px 16px', fontSize: '13px', fontFamily: 'monospace', color: '#6b7280' }}>{String(product.sizeVariantId || '')}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {(() => {
                        const hasBundle = product.sales?.some(s => s.saleType === 'Bundle');
                        const hasSingle = product.sales?.some(s => s.saleType === 'Single');
                        if (hasBundle && hasSingle) return (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Bundle</span>
                            <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Single</span>
                          </div>
                        );
                        if (hasBundle) return <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Bundle</span>;
                        if (hasSingle) return <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>Single</span>;
                        return <span style={{ color: '#d1d5db', fontSize: '12px' }}>—</span>;
                      })()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>{product.initialStock}</td>
                    <td 
                      onClick={() => handleViewSalesDetail(product)}
                      style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        fontSize: '14px', 
                        color: product.saleStock > 0 ? '#10b981' : '#6b7280', 
                        fontWeight: '600',
                        cursor: product.saleStock > 0 ? 'pointer' : 'default',
                        textDecoration: product.saleStock > 0 ? 'underline' : 'none' 
                      }}
                    >
                      {product.saleStock}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#ef4444', fontWeight: '600' }}>{product.currentStock}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>₹{product.price}</td>
                    <td 
                      onClick={() => handleViewSalesDetail(product)}
                      style={{ 
                        padding: '12px 16px', 
                        textAlign: 'center', 
                        fontSize: '14px', 
                        color: product.saleStock > 0 ? '#7c3aed' : '#6b7280', 
                        fontWeight: '700',
                        cursor: product.saleStock > 0 ? 'pointer' : 'default',
                        textDecoration: product.saleStock > 0 ? 'underline' : 'none' 
                      }}
                    >
                      ₹{product.totalSalesAmount}
                    </td>
                  </tr>
                ))
              )}
              {/* Totals Row */}
              {filteredProducts.length > 0 && (
                <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb', fontWeight: '700' }}>
                  <td style={{ padding: '12px 16px' }}></td>
                  <td style={{ padding: '12px 16px' }}></td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#111827' }}>TOTAL</td>
                  <td style={{ padding: '12px 16px' }}></td>
                  <td style={{ padding: '12px 16px' }}></td>
                  <td style={{ padding: '12px 16px' }}></td>
                  <td style={{ padding: '12px 16px' }}></td>{/* Sale Type column */}
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#f59e0b', fontWeight: '700' }}>{filteredProducts.reduce((sum, p) => sum + p.initialStock, 0)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#10b981', fontWeight: '700' }}>{filteredProducts.reduce((sum, p) => sum + p.saleStock, 0)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#ef4444', fontWeight: '700' }}>{filteredProducts.reduce((sum, p) => sum + p.currentStock, 0)}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}></td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', color: '#7c3aed', fontWeight: '700' }}>₹{filteredProducts.reduce((sum, p) => sum + p.totalSalesAmount, 0).toFixed(2)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* Sales Invoices Modal */}
      {showSalesModal && selectedProductSales && (
        <div className="modal-overlay" onClick={() => setShowSalesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 style={{ margin: 0 }}>Sales Invoices - {selectedProductSales.productName}</h2>
              <button onClick={() => setShowSalesModal(false)} className="close-btn">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', background: '#f9fafb', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <img 
                  src={selectedProductSales.imageUrl} 
                  alt={selectedProductSales.productName} 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }} 
                />
                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '600' }}>{selectedProductSales.productName}</h4>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '13px', color: '#4b5563' }}>
                    <span><strong>Color:</strong> {selectedProductSales.color}</span>
                    <span><strong>Size:</strong> {selectedProductSales.size}</span>
                    <span><strong>Variant ID:</strong> <code style={{ background: '#f3f4f6', padding: '2px 4px', borderRadius: '4px' }}>{selectedProductSales.sizeVariantId}</code></span>
                    <span><strong>HSN Code:</strong> {selectedProductSales.hsnCode}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#10b981', fontWeight: '600' }}>Total Sold Qty: {selectedProductSales.saleStock}</span>
                    <span style={{ color: '#7c3aed', fontWeight: '700' }}>Total Sales Amount: ₹{selectedProductSales.totalSalesAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ overflowX: 'auto', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>S.No</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Order ID</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Date</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Customer</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Sale Type</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Price</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Qty</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Total</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProductSales.sales?.map((sale, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f3f4f6', background: index % 2 === 0 ? 'white' : '#f9fafb' }}>
                        <td style={{ padding: '10px 12px', color: '#6b7280' }}>{index + 1}</td>
                        <td style={{ padding: '10px 12px', fontWeight: '600', color: '#3b82f6' }}>ORD-{sale.orderId}</td>
                        <td style={{ padding: '10px 12px', color: '#6b7280' }}>
                          {new Date(sale.date).toLocaleDateString('en-GB')}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ fontWeight: '500', color: '#111827' }}>{sale.customer}</div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>{sale.phone}</div>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          {sale.saleType === 'Bundle' ? (
                            <div>
                              <span 
                                style={{ 
                                  display: 'inline-block',
                                  background: '#e0f2fe', 
                                  color: '#0369a1', 
                                  padding: '2px 8px', 
                                  borderRadius: '4px', 
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}
                                title={`Sold as part of: ${sale.parentName}`}
                              >
                                Bundle
                              </span>
                              <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sale.parentName}>
                                {sale.parentName}
                              </div>
                            </div>
                          ) : (
                            <span 
                              style={{ 
                                display: 'inline-block',
                                background: '#f3f4f6', 
                                color: '#4b5563', 
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                fontSize: '11px',
                                fontWeight: '600'
                              }}
                            >
                              Single
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>₹{parseFloat(sale.price).toFixed(2)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '600' }}>{sale.quantity}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: '700', color: '#7c3aed' }}>₹{(sale.price * sale.quantity).toFixed(2)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span className={`status-badge ${sale.status?.toLowerCase()}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSalesReport;
