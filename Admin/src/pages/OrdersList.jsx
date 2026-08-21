import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Truck,
  Package,
  CheckCircle,
  Clock,
  X,
  Download,
  FileText,
  Receipt,
  Image as ImageIcon,
  Users,
  CreditCard,
  TrendingUp,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import DataTable from "../components/DataTable";
import { fetchOrders as fetchOrdersApi, updateOrderStatus, uploadFile, deleteFile, deleteOrderFiles, pushToShiprocket, getOrderStats, removeOrderItem } from "../api/order";
import { getCourierPartners } from '../api/courierPartnerApi';
import { getCoupons } from '../api/couponApi';
import API_BASE_URL from "../api/config";
import jsPDF from "jspdf";
import * as XLSX from 'xlsx-js-style';
import html2canvas from 'html2canvas';
import { getProducts } from '../api/productApi';
import { toast } from 'react-toastify';

const capitalizeEachWord = (str) => {
  if (!str) return '';
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
};

const SELLER_DETAILS = [
  'SRI GANESH LABELS',
  'State Bank of India, Rajaji Road,',
  'Salem - 636 007, Tamil Nadu',
  'A/c No: 41202153215',
  'IFSC: SBIN0070328',
];

const PACKAGE_SLIP_SELLER_DETAILS = [
  'SRI GANESH LABELS',
  '300, Cherry Road, Salem-636007, Tamil Nadu',
  'GST No: 33ANCPK9033A1ZK',
];

const OrdersList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [courierName, setCourierName] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [trackingLink, setTrackingLink] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [couponFilter, setCouponFilter] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [courierPartners, setCourierPartners] = useState([]);
  const [cancelRemarks, setCancelRemarks] = useState("");
  const [codReturnRemarks, setCodReturnRemarks] = useState("");
  const [codCharge, setCodCharge] = useState("");
  const [courierCharge, setCourierCharge] = useState("");
  const modalRef = useRef(null);
  const statsRef = useRef(null);
  const returnSummaryRef = useRef(null);
  const [chargedWeight, setChargedWeight] = useState("");

const [orderStats, setOrderStats] = useState({
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
  totalCodReturnBills: 0,
  totalCodReturnQuantity: 0,
  totalCodReturnCustomers: 0,
  totalCodReturnBaseValue: 0,
  totalCodReturnValue: 0,
  totalCodReturnShipping: 0
});
  useEffect(() => {
    fetchOrders();
    fetchSignature();
    fetchCoupons();
    fetchCourierPartners();
  }, []);

  useEffect(() => {
  fetchOrderStats();
}, [startDate, endDate]);

  const fetchCoupons = async () => {
    try {
      const data = await getCoupons();
      setAvailableCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const fetchCourierPartners = async () => {
    try {
      const data = await getCourierPartners();
      setCourierPartners(data);
    } catch (error) {
      console.error('Error fetching courier partners:', error);
    }
  };

  const fetchSignature = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      const data = await response.json();
      if (data.signatureUrl) {
        setSignatureUrl(data.signatureUrl);
      }
    } catch (error) {
      console.error('Failed to fetch signature:', error);
    }
  };


  const fetchOrderStats = async () => {
  try {
    const stats = await getOrderStats(startDate, endDate);
    setOrderStats(stats);
  } catch (error) {
    console.error('Error fetching order stats:', error);
  }
};

  const fetchOrders = async () => {
    try {
      const data = await fetchOrdersApi();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const [editingAddress, setEditingAddress] = useState(false);
  const [editAddress, setEditAddress] = useState({});
  const [editingItems, setEditingItems] = useState(false);
  const [editItems, setEditItems] = useState([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [addProductSearch, setAddProductSearch] = useState('');
  const [addProductSelected, setAddProductSelected] = useState(null);
  const [addProductColor, setAddProductColor] = useState('');
  const [addProductSize, setAddProductSize] = useState('');
  const [addProductQty, setAddProductQty] = useState(1);
  const [addProductPrice, setAddProductPrice] = useState('');

  const handleSaveAddress = async () => {
    try {
      setSavingOrder(true);
      const formattedAddress = {
        ...editAddress,
        fullName: capitalizeEachWord(editAddress.fullName),
        addressLine1: capitalizeEachWord(editAddress.addressLine1),
        addressLine2: capitalizeEachWord(editAddress.addressLine2),
        city: capitalizeEachWord(editAddress.city),
        state: capitalizeEachWord(editAddress.state),
        landmark: capitalizeEachWord(editAddress.landmark),
      };
      await fetch(`${API_BASE_URL}/orders/${selectedOrder.id}/address`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress: formattedAddress }),
      });
      await fetchOrders();
      setSelectedOrder(prev => ({ ...prev, shippingAddress: formattedAddress }));
      setEditingAddress(false);
      toast.success('Shipping address updated');
    } catch (e) {
      toast.error('Failed to update address');
    } finally {
      setSavingOrder(false);
    }
  };

  const fetchAllProducts = async () => {
    if (allProducts.length > 0) return;
    try {
      const data = await getProducts();
      setAllProducts(data);
    } catch (e) {
      console.error('Failed to fetch products', e);
    }
  };

  const handleSaveItems = async () => {
    // Validate all items have required fields, exempting bundles from color and size
    for (let i = 0; i < editItems.length; i++) {
      const item = editItems[i];
      const itemName = item.name || `Item #${i + 1}`;
      
      if (!item.quantity || item.quantity <= 0) {
        toast.error(`Please enter a valid quantity (>0) for "${itemName}"`);
        return;
      }
      if (item.price === '' || item.price === null || item.price === undefined || item.price < 0) {
        toast.error(`Please enter a valid price (≥0) for "${itemName}"`);
        return;
      }
      if (item.type !== 'bundle') {
        if (!item.color) {
          toast.error(`Please select a color for "${itemName}"`);
          return;
        }
        if (!item.size) {
          toast.error(`Please select a size for "${itemName}"`);
          return;
        }
      }
    }
    
    try {
      setSavingOrder(true);
      // Recalculate subtotal and total from editItems
      const newSubtotal = editItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0);
      const discount = parseFloat(selectedOrder.discount) || 0;
      const deliveryFee = parseFloat(selectedOrder.deliveryFee) || 0;
      const shippingFee = parseFloat(selectedOrder.shippingFee) || 0;
      const codFee = parseFloat(selectedOrder.codFee) || 0;
      const newTotal = newSubtotal - discount + deliveryFee + shippingFee + codFee;
      
      const response = await fetch(`${API_BASE_URL}/orders/${selectedOrder.id}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: editItems, subtotal: parseFloat(newSubtotal.toFixed(2)), total: parseFloat(newTotal.toFixed(2)) }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order');
      }
      
      await fetchOrders();
      setSelectedOrder(prev => ({ ...prev, items: editItems, subtotal: newSubtotal.toFixed(2), total: newTotal.toFixed(2) }));
      setEditingItems(false);
      setAddProductSearch('');
      setAddProductSelected(null);
      setAddProductColor('');
      setAddProductSize('');
      setAddProductQty(1);
      setAddProductPrice('');
      toast.success('Order items updated');
    } catch (e) {
      console.error('Error updating items:', e);
      toast.error('Failed to update items');
    } finally {
      setSavingOrder(false);
    }
  };

  const getAddProductMatches = () => {
    if (!addProductSearch.trim()) return [];
    const q = addProductSearch.toLowerCase();
    const results = [];
    allProducts.forEach(prod => {
      // Match by product name
      if (prod.name?.toLowerCase().includes(q)) {
        results.push({ prod, matchType: 'name' });
        return;
      }
      // Match by variant ID across colors/sizes
      prod.colors?.forEach(c => {
        c.sizes?.forEach(s => {
          if (s.sizeVariantId?.toLowerCase().includes(q)) {
            results.push({ prod, matchType: 'variant', color: c.name, size: s.size });
          }
        });
      });
    });
    return results.slice(0, 10);
  };

  const handleAddProductToOrder = () => {
    if (!addProductSelected || !addProductColor || !addProductSize) {
      toast.error('Please select product, color and size');
      return;
    }
    
    if (addProductPrice === '' || addProductPrice === null || addProductPrice === undefined || parseFloat(addProductPrice) < 0) {
      toast.error('Please enter a valid price (≥0)');
      return;
    }
    
    if (!addProductQty || parseInt(addProductQty) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    
    const prod = addProductSelected;
    const colorObj = prod.colors?.find(c => c.name === addProductColor);
    const sizeObj = colorObj?.sizes?.find(s => s.size === addProductSize);
    const newItem = {
      productId: prod.id,
      name: prod.name,
      imageUrl: colorObj?.image || '',
      color: addProductColor,
      size: addProductSize,
      sizeVariantId: sizeObj?.sizeVariantId || '',
      price: parseFloat(addProductPrice) || parseFloat(sizeObj?.price) || parseFloat(prod.basePrice) || 0,
      quantity: parseInt(addProductQty) || 1,
      hsnCode: prod.hsnCode || '',
    };
    setEditItems(prev => [...prev, newItem]);
    setAddProductSearch('');
    setAddProductSelected(null);
    setAddProductColor('');
    setAddProductSize('');
    setAddProductQty(1);
    setAddProductPrice('');
    toast.success('Product added to order');
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const handleEditOrder = (order) => {
  setSelectedOrder(order);
  setNewStatus(order.status);
  setCourierName(order.courierName === "not provided" ? "" : (order.courierName || ""));
  setTrackingId(order.trackingId === "not provided" ? "" : (order.trackingId || ""));
  setTrackingLink(order.trackingLink === "not provided" ? "" : (order.trackingLink || ""));
  setCancelRemarks(order.cancelRemarks || "");
  setCodReturnRemarks(order.codReturnRemarks || "");
  
  // Calculate commission based on payment method
  const isOnline = order.paymentMethod?.toLowerCase() !== 'cod';
  const isCOD = order.paymentMethod?.toLowerCase() === 'cod';
  
  if (order.status === 'Delivered') {
    if (isOnline && !order.codCharge) {
      // Online payment: 2.36% commission (2% + 18% GST)
      const calculatedCharge = (parseFloat(order.total || 0) * 0.0236).toFixed(2);
      setCodCharge(calculatedCharge);
    } else if (isCOD && !order.codCharge) {
      // COD payment: 1.6% commission
      const calculatedCharge = (parseFloat(order.total || 0) * 0.016).toFixed(2);
      setCodCharge(calculatedCharge);
    } else {
      setCodCharge(order.codCharge || "");
    }
  } else {
    setCodCharge(order.codCharge || "");
  }

  setCourierCharge(order.courierCharge || "");
  setChargedWeight(order.chargedWeight || "");
  setShowEditModal(true);
};

  const generatePDFBlob = (pdf) => {
    return pdf.output('blob');
  };

  const generateInvoicePDF = (order, forDownload = false) => {
    const pdf = new jsPDF();
    const address = order.shippingAddress;

    // Invoice Title (Centered)
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('INVOICE', 105, 20, { align: 'center' });

    // Sold By Section (Left)
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'bold');
    pdf.text('Sold By :', 15, 35);
    pdf.setFont(undefined, 'normal');
    pdf.text(SELLER_DETAILS[0], 15, 40);
    pdf.text(SELLER_DETAILS[1], 15, 45);
    pdf.text(SELLER_DETAILS[2], 15, 50);
    pdf.text(SELLER_DETAILS[3], 15, 55);
    pdf.text(SELLER_DETAILS[4], 15, 60);

    pdf.line(15, 66, 190, 66);

    // Billing Address (Right Top)
    pdf.setFont(undefined, 'bold');
    pdf.text('Billing Address :', 120, 35);
    pdf.setFont(undefined, 'normal');
    if (address) {
      let billingY = 40;
      pdf.text(capitalizeEachWord(address.fullName || order.user?.name || 'N/A'), 120, billingY);
      billingY += 5;
      const addr1Lines = pdf.splitTextToSize(capitalizeEachWord(address.addressLine1 || address.address || ''), 70);
      pdf.text(addr1Lines, 120, billingY);
      billingY += addr1Lines.length * 5;
      if (address.addressLine2) {
        const addr2Lines = pdf.splitTextToSize(capitalizeEachWord(address.addressLine2), 70);
        pdf.text(addr2Lines, 120, billingY);
        billingY += addr2Lines.length * 5;
      }
      pdf.text(`${capitalizeEachWord(address.city || '')}, ${capitalizeEachWord(address.state || 'N/A')}, ${address.pincode || ''}`, 120, billingY);
      billingY += 5;
      pdf.text('IN', 120, billingY);
    }

    pdf.setFont(undefined, 'bold');
    pdf.text('Order Number:', 15, 80);
    pdf.setFont(undefined, 'normal');
    pdf.text(`ORD-${new Date().getFullYear()}-${order.id}`, 42, 80);

    pdf.setFont(undefined, 'bold');
    pdf.text('Shipping Address :', 120, 80);
    pdf.setFont(undefined, 'normal');
    if (address) {
      let shippingY = 85;
      pdf.text(capitalizeEachWord(address.fullName || order.user?.name || 'N/A'), 120, shippingY);
      shippingY += 5;
      pdf.text(address.mobile || order.user?.phone || 'N/A', 120, shippingY);
      shippingY += 5;
      const shipAddr1Lines = pdf.splitTextToSize(capitalizeEachWord(address.addressLine1 || address.address || ''), 70);
      pdf.text(shipAddr1Lines, 120, shippingY);
      shippingY += shipAddr1Lines.length * 5;
      if (address.addressLine2) {
        const shipAddr2Lines = pdf.splitTextToSize(capitalizeEachWord(address.addressLine2), 70);
        pdf.text(shipAddr2Lines, 120, shippingY);
        shippingY += shipAddr2Lines.length * 5;
      }
      pdf.text(`${capitalizeEachWord(address.city || '')}, ${capitalizeEachWord(address.state || 'N/A')}, ${address.pincode || ''}`, 120, shippingY);
      shippingY += 5;
      pdf.text('IN', 120, shippingY);
      shippingY += 5;
      pdf.setFont(undefined, 'bold');
      pdf.text('Place of supply:', 120, shippingY);
      pdf.setFont(undefined, 'normal');
      pdf.text(address.state?.toUpperCase() || 'N/A', 148, shippingY);
      shippingY += 5;
      pdf.setFont(undefined, 'bold');
      pdf.text('Place of delivery:', 120, shippingY);
      pdf.setFont(undefined, 'normal');
      pdf.text(address.state?.toUpperCase() || 'N/A', 152, shippingY);
    }

    pdf.setFont(undefined, 'bold');
    pdf.text('Order Date:', 15, 85);
    pdf.setFont(undefined, 'normal');
    pdf.text(new Date(order.createdAt).toLocaleDateString('en-GB'), 36, 85);

    pdf.setFont(undefined, 'bold');
    pdf.text('Invoice Number:', 15, 90);
    pdf.setFont(undefined, 'normal');
    pdf.text(`IN-${order.id}`, 44, 90);

    pdf.setFont(undefined, 'bold');
    pdf.text('Invoice Date:', 15, 95);
    pdf.setFont(undefined, 'normal');
    pdf.text(new Date(order.createdAt).toLocaleDateString('en-GB'), 40, 95);

    pdf.setFont(undefined, 'bold');
    pdf.text('Mode of Payment:', 15, 100);
    pdf.setFont(undefined, 'normal');
    pdf.text(order.paymentMethod || 'Online', 48, 100);

    const isCourierOrder = address?.deliveryMethod === 'Courier Partner';
    if (isCourierOrder) {
      pdf.setFont(undefined, 'bold');
      pdf.text('Courier Partner:', 15, 105);
      pdf.setFont(undefined, 'normal');
      pdf.text(address?.courierPartner || 'As selected by customer', 45, 105);
    }

    const tableTop = 128;
    pdf.setFillColor(220, 220, 220);
    pdf.rect(15, tableTop, 180, 8, 'F');
    pdf.setDrawColor(0);
    pdf.line(15, tableTop, 15, tableTop + 8);
    pdf.line(195, tableTop, 195, tableTop + 8);

    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    pdf.text('Sl.', 17, tableTop + 5);
    pdf.text('Description', 30, tableTop + 5);
    pdf.text('HSN', 90, tableTop + 5);
    pdf.text('Unit Price', 105, tableTop + 5);
    pdf.text('Qty', 130, tableTop + 5);
    pdf.text('Total', 160, tableTop + 5);

    pdf.rect(15, tableTop, 180, 8);
    pdf.line(25, tableTop, 25, tableTop + 8);
    pdf.line(85, tableTop, 85, tableTop + 8);
    pdf.line(100, tableTop, 100, tableTop + 8);
    pdf.line(125, tableTop, 125, tableTop + 8);
    pdf.line(150, tableTop, 150, tableTop + 8);

    pdf.setFont(undefined, 'normal');
    let yPos = tableTop + 13;
    const tableStartY = yPos;
    let prevRowEndY = tableTop + 8;

    order.items?.forEach((item, index) => {
      if (item.type === 'bundle' && item.bundleItems) {
        // For bundles, show each bundle item separately
        item.bundleItems.forEach((bundleItem, bIdx) => {
          const itemPrice = parseFloat(bundleItem.originalPrice) || 0;
          const itemQty = 1;
          const itemTotal = itemPrice;

          pdf.text((index + 1).toString() + String.fromCharCode(97 + bIdx), 17, yPos);
          const variantId = bundleItem.sizeVariantId ? ` (${bundleItem.sizeVariantId})` : '';
          const itemDesc = `${item.name.split(' Bundle')[0]} - ${bundleItem.size}, ${bundleItem.color}${variantId}`;
          const lines = pdf.splitTextToSize(itemDesc, 50);
          pdf.text(lines, 30, yPos);
          pdf.text(item.hsnCode || 'N/A', 90, yPos);
          pdf.text(`Rs.${itemPrice.toFixed(2)}`, 122, yPos, { align: 'right' });
          pdf.text(itemQty.toString(), 137, yPos, { align: 'center' });
          pdf.text(`Rs.${itemTotal.toFixed(2)}`, 193, yPos, { align: 'right' });

          const rowHeight = lines.length * 5 + 5;
          const rowEndY = yPos + rowHeight - 5;

          pdf.line(15, rowEndY, 195, rowEndY);
          pdf.line(25, prevRowEndY, 25, rowEndY);
          pdf.line(85, prevRowEndY, 85, rowEndY);
          pdf.line(100, prevRowEndY, 100, rowEndY);
          pdf.line(125, prevRowEndY, 125, rowEndY);
          pdf.line(150, prevRowEndY, 150, rowEndY);

          prevRowEndY = rowEndY;
          yPos += rowHeight;
        });
      } else {
        const itemPrice = parseFloat(item.price) || 0;
        const itemQty = item.quantity || 1;
        const itemTotal = itemPrice * itemQty;

        pdf.text((index + 1).toString(), 17, yPos);
        const variantId = item.sizeVariantId ? ` (${item.sizeVariantId})` : '';
        const itemDesc = item.size && item.color ? `${item.name} - ${item.size}, ${item.color}${variantId}` : item.name || 'N/A';
        const lines = pdf.splitTextToSize(itemDesc, 50);
        pdf.text(lines, 30, yPos);
        pdf.text(item.hsnCode || 'N/A', 90, yPos);
        pdf.text(`Rs.${itemPrice.toFixed(2)}`, 122, yPos, { align: 'right' });
        pdf.text(itemQty.toString(), 137, yPos, { align: 'center' });
        pdf.text(`Rs.${itemTotal.toFixed(2)}`, 193, yPos, { align: 'right' });

        const rowHeight = lines.length * 5 + 5;
        const rowEndY = yPos + rowHeight - 5;

        pdf.line(15, rowEndY, 195, rowEndY);
        pdf.line(25, prevRowEndY, 25, rowEndY);
        pdf.line(85, prevRowEndY, 85, rowEndY);
        pdf.line(100, prevRowEndY, 100, rowEndY);
        pdf.line(125, prevRowEndY, 125, rowEndY);
        pdf.line(150, prevRowEndY, 150, rowEndY);

        prevRowEndY = rowEndY;
        yPos += rowHeight;
      }
    });

    const subtotal = parseFloat(order.subtotal) || 0;
    const discount = parseFloat(order.discount) || 0;
    const deliveryFee = parseFloat(order.deliveryFee) || 0;
    const shippingFee = parseFloat(order.shippingFee || order.deliveryOption?.shippingFee) || 0;
    const codFee = parseFloat(order.codFee) || (order.deliveryOption?.codFee ? parseFloat(order.deliveryOption.codFee) : 0) || 0;
    const total = parseFloat(order.total) || 0;
    const deliveryGst = order.deliveryOption?.gst || {};
    const isSameState = deliveryGst.isSameState !== false;

    console.log('Generating PDF for order:', order.id, { subtotal, deliveryFee, shippingFee, codFee, total });

    const gstRate = 5;
    const afterDiscount = subtotal - discount;
    const totalWithDelivery = afterDiscount + deliveryFee + shippingFee + codFee;
    const baseAmount = totalWithDelivery / (1 + gstRate / 100);
    const gstAmount = totalWithDelivery - baseAmount;
    const cgstAmount = isSameState ? (gstAmount / 2) : 0;
    const sgstAmount = isSameState ? (gstAmount / 2) : 0;
    const igstAmount = !isSameState ? gstAmount : 0;
    const taxRate = (gstRate / 2).toFixed(2);
    const igstRate = gstRate.toFixed(2);

    yPos += 5;
    pdf.setFont(undefined, 'normal');
    pdf.text('Subtotal:', 30, yPos);
    pdf.text(`Rs.${subtotal.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 6;

    if (discount > 0) {
      pdf.text(`Discount (${order.couponCode || ''}):`, 30, yPos);
      pdf.text(`- Rs.${discount.toFixed(2)}`, 190, yPos, { align: 'right' });
      yPos += 6;
    }

    if (isCourierOrder) {
      pdf.text('Delivery Fee:', 30, yPos);
      pdf.setFont(undefined, 'italic');
      pdf.text('(As per courier partner charges)', 190, yPos, { align: 'right' });
      pdf.setFont(undefined, 'normal');
      yPos += 6;
    } else {
      pdf.text('Delivery Fee:', 30, yPos);
      pdf.text(`Rs.${deliveryFee.toFixed(2)}`, 190, yPos, { align: 'right' });
      yPos += 6;
    }

    if (shippingFee > 0) {
      pdf.text('Shipping Fee:', 30, yPos);
      pdf.text(`Rs.${shippingFee.toFixed(2)}`, 190, yPos, { align: 'right' });
      yPos += 6;
    }

    pdf.text('COD Fee:', 30, yPos);
    pdf.text(`Rs.${codFee.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 6;

    pdf.text('Taxable Amount:', 30, yPos);
    pdf.text(`Rs.${baseAmount.toFixed(2)}`, 190, yPos, { align: 'right' });
    yPos += 6;

    if (isSameState) {
      pdf.text(`CGST (${taxRate}%)`, 30, yPos);
      pdf.text(`Rs.${cgstAmount.toFixed(2)}`, 190, yPos, { align: 'right' });
      yPos += 6;
      pdf.text(`SGST (${taxRate}%)`, 30, yPos);
      pdf.text(`Rs.${sgstAmount.toFixed(2)}`, 190, yPos, { align: 'right' });
      yPos += 8;
    } else {
      pdf.text(`IGST (${igstRate}%)`, 30, yPos);
      pdf.text(`Rs.${igstAmount.toFixed(2)}`, 190, yPos, { align: 'right' });
      yPos += 8;
    }

    pdf.setFont(undefined, 'bold');
    pdf.text('TOTAL:', 30, yPos);
    pdf.text(`Rs.${total.toFixed(2)}`, 190, yPos, { align: 'right' });

    yPos += 8;
    pdf.setFont(undefined, 'bold');
    pdf.text('Amount in Words:', 30, yPos);
    pdf.setFont(undefined, 'normal');
    const amountInWords = convertToWords(total);
    pdf.text(amountInWords, 30, yPos + 5);

    const finalTableHeight = (yPos + 10) - tableTop;
    pdf.rect(15, tableTop, 180, finalTableHeight);

    let footerY = yPos + 50;
    const pageHeight = pdf.internal.pageSize.getHeight();
    if (footerY > pageHeight - 20) {
      pdf.addPage();
      footerY = 30;
    }
    pdf.setFont(undefined, 'bold');
    pdf.text('For SRI GANESH LABELS:', 140, footerY - 30);
    if (signatureUrl) {
      const signatureImg = new Image();
      signatureImg.src = signatureUrl;
      try {
        pdf.addImage(signatureImg, 'PNG', 140, footerY - 25, 40, 15);
      } catch (e) {
        console.log('Signature not loaded');
      }
    }
    pdf.setFont(undefined, 'normal');
    pdf.text('Authorized Signatory', 140, footerY - 5);

    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    pdf.text('Date & Time:', 20, footerY + 6);
    pdf.setFont(undefined, 'normal');
    pdf.text(new Date().toLocaleString('en-GB'), 45, footerY + 6);

    if (forDownload) {
      pdf.save(`invoice-${order.id}.pdf`);
    }
    return pdf;
  };

const handleUpdateStatus = async () => {
  try {
    setUploading(true);

    if (newStatus === 'Cancelled' && !cancelRemarks.trim()) {
      toast.error('Please enter cancellation remarks');
      setUploading(false);
      return;
    }

    if (newStatus === 'CODReturn' && !codReturnRemarks.trim()) {
      toast.error('Please enter COD return reason');
      setUploading(false);
      return;
    }

    let invoiceUrl = null;
    let packageSlipUrl = null;

    if (newStatus === 'Shipped') {
      // Fetch fresh order data directly from API
      const freshOrders = await fetchOrdersApi();
      const orderToUse = freshOrders.find(o => o.id === selectedOrder.id);

      if (!orderToUse) {
        alert('Order not found');
        setUploading(false);
        return;
      }

      console.log('Fresh order data:', orderToUse);
      console.log('Order created at:', orderToUse.createdAt);
      console.log('Current time:', new Date().toLocaleString('en-GB'));

      // Delete ALL old invoice and package slip files for this order
      await deleteOrderFiles(orderToUse.id).catch(e => console.log('Error deleting old files:', e));

      // Wait a moment to ensure deletion completes
      await new Promise(resolve => setTimeout(resolve, 500));

      // Always generate new PDFs
      try {
        console.log('Generating invoice at:', new Date().toLocaleString('en-GB'));
        const invoicePdf = generateInvoicePDF(freshOrders.find(o => o.id === selectedOrder.id), false);
        const invoiceBlob = generatePDFBlob(invoicePdf);
        const invoiceFile = new File([invoiceBlob], `invoice-${orderToUse.id}.pdf`, { type: 'application/pdf' });
        const invoiceResult = await uploadFile(invoiceFile);
        invoiceUrl = invoiceResult.url;

        const packagePdf = createPackageSlipPDF(orderToUse);
        const packageBlob = generatePDFBlob(packagePdf);
        const packageFile = new File([packageBlob], `packageslip-${orderToUse.id}.pdf`, { type: 'application/pdf' });
        const packageResult = await uploadFile(packageFile);
        packageSlipUrl = packageResult.url;
      } catch (uploadError) {
        console.error('Upload failed:', uploadError);
        alert('Failed to upload documents. Status will not be changed.');
        setUploading(false);
        return;
      }
    }

 await updateOrderStatus(
  selectedOrder.id,
  newStatus,
  invoiceUrl,
  packageSlipUrl,
  courierName || "not provided",
  trackingId || "not provided",
  trackingLink || "not provided",
  newStatus === 'Cancelled' ? cancelRemarks : null,
  newStatus === 'CODReturn' ? codReturnRemarks : null,
  newStatus === 'Shipped' ? chargedWeight || null : null,  // chargedWeight for Shipped
  newStatus === 'Shipped' ? courierCharge || null : (newStatus === 'Delivered' ? courierCharge || null : null),  // courierCharge for both
  newStatus === 'Delivered' ? codCharge || null : null     // codCharge only for Delivered
);
    await fetchOrders();
    setShowEditModal(false);
  } catch (error) {
    console.error("Error updating status:", error);
    alert('Failed to update order status');
  } finally {
    setUploading(false);
  }
};

  const handlePushToShiprocket = async (orderId) => {
    if (!window.confirm('Are you sure you want to push this order to Shiprocket?')) return;

    try {
      setLoading(true);
      await pushToShiprocket(orderId);
      alert('Order successfully pushed to Shiprocket!');
      await fetchOrders();
    } catch (error) {
      console.error('Shiprocket Error:', error);
      alert(error.message || 'Failed to push order to Shiprocket');
    } finally {
      setLoading(false);
    }
  };

  const createPackageSlipPDF = (order, yOffset = 0) => {
    const pdf = new jsPDF();
    const address = order.shippingAddress;

    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('PACKING SLIP', 105, 20, { align: 'center' });

    pdf.setFontSize(13);
    let startY = 35;

    if (order.paymentMethod?.toLowerCase() === 'cod') {
      pdf.setFont(undefined, 'bold');
      pdf.text('Cust ID :', 120, startY);
      pdf.text(`1857330518`, 145, startY);

      startY += 7;
      pdf.text('COD     :', 120, startY);
      pdf.text(`Rs.${parseFloat(order.total || 0).toFixed(2)}/-`, 145, startY);

      startY += 8;
    }

    pdf.setFont(undefined, 'bold');
    pdf.text('Sales Order No :', 120, startY);
    pdf.setFont(undefined, 'normal');
    pdf.text(`ORD-${new Date().getFullYear()}-${order.id}`, 165, startY);

    startY += 7;
    pdf.setFont(undefined, 'bold');
    pdf.text('Order Date :', 120, startY);
    pdf.setFont(undefined, 'normal');
    pdf.text(new Date(order.createdAt).toLocaleDateString('en-GB'), 158, startY);

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('SHIP TO:', 20, 60);
    pdf.setFont(undefined, 'normal');

    let shipY = 68;
    if (address) {
      pdf.setFont(undefined, 'bold');
      const shipToNameLines = pdf.splitTextToSize(`${capitalizeEachWord(address.fullName || order.user?.name || 'N/A')} (${address.mobile || order.user?.phone || 'N/A'})`, 92);
      pdf.text(shipToNameLines, 20, shipY);
      shipY += shipToNameLines.length * 7;
      pdf.setFont(undefined, 'normal');
      const shipToAddrLines = pdf.splitTextToSize(capitalizeEachWord(address.addressLine1 || address.address || ''), 92);
      pdf.text(shipToAddrLines, 20, shipY);
      shipY += shipToAddrLines.length * 7;
      if (address.addressLine2) {
        const shipToAddr2Lines = pdf.splitTextToSize(capitalizeEachWord(address.addressLine2), 92);
        pdf.text(shipToAddr2Lines, 20, shipY);
        shipY += shipToAddr2Lines.length * 7;
      }
      pdf.text(`${capitalizeEachWord(address.city || '')}, ${capitalizeEachWord(address.state || '')}, ${address.pincode || ''}`, 20, shipY);
      shipY += 7;
      pdf.setFont(undefined, 'bold');
      pdf.text('Landmark:', 20, shipY);
      pdf.setFont(undefined, 'normal');
      pdf.text(capitalizeEachWord(address.landmark || 'N/A'), 50, shipY);
      if (address.deliveryMethod === 'Courier Partner') {
        shipY += 7;
        pdf.setFont(undefined, 'bold');
        pdf.text('Courier Partner:', 20, shipY);
        pdf.setFont(undefined, 'normal');
        pdf.text(address.courierPartner || 'N/A', 55, shipY);
      }
    }

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('SHIP FROM:', 120, 100);
    pdf.setFont(undefined, 'normal');

    let fromY = 108;
    pdf.text(PACKAGE_SLIP_SELLER_DETAILS[0], 120, fromY);
    fromY += 7;
    const fromAddrLines = pdf.splitTextToSize(PACKAGE_SLIP_SELLER_DETAILS[1], 78);
    pdf.text(fromAddrLines, 120, fromY);
    fromY += fromAddrLines.length * 7;
    const fromGstLines = pdf.splitTextToSize(PACKAGE_SLIP_SELLER_DETAILS[2], 78);
    pdf.text(fromGstLines, 120, fromY);

    pdf.setFont(undefined, 'italic');
    pdf.text('Thank you for shopping with us!', 105, 150, { align: 'center' });

    return pdf;
  };

  const generatePackageSlip = (order) => {
    const pdf = createPackageSlipPDF(order);
    pdf.save(`package-slip-${order.id}.pdf`);
  };
const exportAllOrdersExcel = () => {
  // Use filteredOrders which already includes date filter from the existing filteredOrders logic
  let filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.paymentMethod || 'online').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      order.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesCoupon = 
      !couponFilter ? true :
      couponFilter === "any_coupon" ? !!order.couponCode :
      couponFilter === "no_coupon" ? !order.couponCode :
      order.couponCode?.toLowerCase().includes(couponFilter.toLowerCase());

    // Date filter
    let matchesDate = true;
    if (startDate || endDate) {
      const orderDate = new Date(order.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        matchesDate = orderDate >= start && orderDate <= endOfDay;
      } else if (start) {
        matchesDate = orderDate >= start;
      } else if (end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        matchesDate = orderDate <= endOfDay;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate && matchesCoupon;
  });

  if (filteredOrders.length === 0) {
    alert('No orders found for the selected filters');
    return;
  }

  const excelData = filteredOrders.map((order, index) => {
    let names = [], sizes = [], colors = [], variantIds = [], qtys = [];
    order.items?.forEach(item => {
      if (item.type === 'bundle' && item.bundleItems) {
        item.bundleItems.forEach(b => {
          names.push(`${item.name} (${b.color})`);
          sizes.push(b.size || 'N/A');
          colors.push(b.color || 'N/A');
          variantIds.push(b.sizeVariantId || 'N/A');
          qtys.push(1);
        });
      } else {
        names.push(item.name || 'N/A');
        sizes.push(item.size || 'N/A');
        colors.push(item.color || 'N/A');
        variantIds.push(item.sizeVariantId || 'N/A');
        qtys.push(item.quantity || 1);
      }
    });

    const totalQty = qtys.reduce((sum, q) => sum + parseInt(q || 0), 0);

    return {
      'S.No': index + 1,
      'Order ID': `ORD-${order.id}`,
      'Customer': order.user?.name || order.shippingAddress?.fullName || 'N/A',
      'City': order.shippingAddress?.city || 'N/A',
      'Phone': order.user?.phone || 'N/A',
      'Products': `${names.length || 0} items`,
      'Product Name': names.join(', \n') || 'N/A',
      'Size': sizes.join(', \n') || 'N/A',
      'Color': colors.join(', \n') || 'N/A',
      'Variant ID': variantIds.join(', \n') || 'N/A',
      'Item Qty': qtys.join(', \n') || '0',
      'Quantity': totalQty,
      'Total Amount': parseFloat(order.total || 0),
      'COD/online commission (Admin)': parseFloat(order.codCharge || 0),
      'Settlement Amount': (parseFloat(order.total || 0) - parseFloat(order.codCharge || 0)).toFixed(2),
      'Weight (gms)': order.chargedWeight || 0,
      'Courier Charges': parseFloat(order.courierCharge || 0).toFixed(2),
      'Total profit': (parseFloat(order.total || 0) - parseFloat(order.codCharge || 0) - parseFloat(order.courierCharge || 0)).toFixed(2),
      'Discount': parseFloat(order.discount || 0),
      'Coupon Code': order.couponCode || 'N/A',
      'Status': order.status,
      'Payment': order.paymentMethod || 'N/A',
      'Order Date': new Date(order.createdAt).toLocaleString('en-GB')
    };
  });

  const totals = {
    'S.No': '',
    'Order ID': '',
    'Customer': '',
    'City': '',
    'Phone': 'TOTAL',
    'Products': '',
    'Product Name': '',
    'Size': '',
    'Color': '',
    'Variant ID': '',
    'Item Qty': '',
    'Quantity': excelData.reduce((sum, row) => sum + (row.Quantity || 0), 0),
    'Total Amount': excelData.reduce((sum, row) => sum + parseFloat(row['Total Amount'] || 0), 0).toFixed(2),
    'COD/online commission (Admin)': excelData.reduce((sum, row) => sum + (parseFloat(row['COD/online commission (Admin)']) || 0), 0).toFixed(2),
    'Settlement Amount': excelData.reduce((sum, row) => sum + parseFloat(row['Settlement Amount'] || 0), 0).toFixed(2),
    'Weight (gms)': excelData.reduce((sum, row) => sum + (parseFloat(row['Weight (gms)']) || 0), 0),
    'Courier Charges': excelData.reduce((sum, row) => sum + parseFloat(row['Courier Charges'] || 0), 0).toFixed(2),
    'Total profit': excelData.reduce((sum, row) => sum + parseFloat(row['Total profit'] || 0), 0).toFixed(2),
    'Discount': excelData.reduce((sum, row) => sum + parseFloat(row['Discount'] || 0), 0).toFixed(2),
    'Coupon Code': '',
    'Status': '',
    'Payment': '',
    'Order Date': ''
  };

  // Add gap row
  excelData.push({
    'S.No': '', 'Order ID': '', 'Customer': '', 'City': '', 'Phone': '', 'Products': '', 'Product Name': '', 'Size': '', 'Color': '', 'Variant ID': '', 'Item Qty': '', 'Quantity': '', 'Total Amount': '', 'COD/online commission (Admin)': '', 'Settlement Amount': '', 'Weight (gms)': '', 'Courier Charges': '', 'Total profit': '', 'Discount': '', 'Coupon Code': '', 'Status': '', 'Payment': '', 'Order Date': ''
  });

  // Apply styles to totals row
  const styledTotals = {};
  Object.keys(totals).forEach(key => {
    styledTotals[key] = {
      v: totals[key],
      s: {
        fill: { fgColor: { rgb: "E1F5FE" } }, // Light blue background
        font: { bold: true },
        alignment: { horizontal: "center" },
        border: {
          top: { style: "thin", color: { rgb: "000000" } },
          bottom: { style: "thin", color: { rgb: "000000" } }
        }
      }
    };
  });

  excelData.push(styledTotals);

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');

  const filterText = statusFilter !== 'all' ? `_${statusFilter}` : '';
  const couponText = couponFilter ? `_coupon_${couponFilter}` : '';
  const dateRange = startDate && endDate ? `_${startDate}_to_${endDate}` : startDate ? `_from_${startDate}` : endDate ? `_to_${endDate}` : '';
  
  XLSX.writeFile(workbook, `orders${filterText}${couponText}${dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
  const generateAllPackageSlips = () => {
    const placedOrders = orders.filter(order => order.status === 'Placed');

    if (placedOrders.length === 0) {
      alert('No placed orders found');
      return;
    }

    const pdf = new jsPDF();
    let isFirstSlip = true;

    placedOrders.forEach((order, orderIndex) => {
      if (!isFirstSlip) {
        pdf.addPage();
      }
      isFirstSlip = false;

      const address = order.shippingAddress;

      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('PACKING SLIP', 105, 20, { align: 'center' });

      pdf.setFontSize(13);
      let startY = 35;

      if (order.paymentMethod?.toLowerCase() === 'cod') {
        pdf.setFont(undefined, 'bold');
        pdf.text('Cust ID :', 120, startY);
        pdf.text(`1857330518`, 145, startY);

        startY += 7;
        pdf.text('COD     :', 120, startY);
        pdf.text(`Rs.${parseFloat(order.total || 0).toFixed(2)}/-`, 145, startY);

        startY += 8;
      }

      pdf.setFont(undefined, 'bold');
      pdf.text('Sales Order No :', 120, startY);
      pdf.setFont(undefined, 'normal');
      pdf.text(`ORD-${new Date().getFullYear()}-${order.id}`, 165, startY);

      startY += 7;
      pdf.setFont(undefined, 'bold');
      pdf.text('Order Date :', 120, startY);
      pdf.setFont(undefined, 'normal');
      pdf.text(new Date(order.createdAt).toLocaleDateString('en-GB'), 158, startY);

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('SHIP TO:', 20, 60);
      pdf.setFont(undefined, 'normal');

      let shipY = 68;
      if (address) {
        pdf.setFont(undefined, 'bold');
        const shipToNameLines = pdf.splitTextToSize(`${capitalizeEachWord(address.fullName || order.user?.name || 'N/A')} (${address.mobile || order.user?.phone || 'N/A'})`, 92);
        pdf.text(shipToNameLines, 20, shipY);
        shipY += shipToNameLines.length * 7;
        pdf.setFont(undefined, 'normal');
        const shipToAddrLines = pdf.splitTextToSize(capitalizeEachWord(address.addressLine1 || address.address || ''), 92);
        pdf.text(shipToAddrLines, 20, shipY);
        shipY += shipToAddrLines.length * 7;
        if (address.addressLine2) {
          const shipToAddr2Lines = pdf.splitTextToSize(capitalizeEachWord(address.addressLine2), 92);
          pdf.text(shipToAddr2Lines, 20, shipY);
          shipY += shipToAddr2Lines.length * 7;
        }
        pdf.text(`${capitalizeEachWord(address.city || '')}, ${capitalizeEachWord(address.state || '')}, ${address.pincode || ''}`, 20, shipY);
        shipY += 7;
        pdf.setFont(undefined, 'bold');
        pdf.text('Landmark:', 20, shipY);
        pdf.setFont(undefined, 'normal');
        pdf.text(capitalizeEachWord(address.landmark || 'N/A'), 50, shipY);
      }

      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('SHIP FROM:', 120, 100);
      pdf.setFont(undefined, 'normal');

      let fromY = 108;
      pdf.text(PACKAGE_SLIP_SELLER_DETAILS[0], 120, fromY);
      fromY += 7;
      const fromAddrLines = pdf.splitTextToSize(PACKAGE_SLIP_SELLER_DETAILS[1], 78);
      pdf.text(fromAddrLines, 120, fromY);
      fromY += fromAddrLines.length * 7;
      const fromGstLines = pdf.splitTextToSize(PACKAGE_SLIP_SELLER_DETAILS[2], 78);
      pdf.text(fromGstLines, 120, fromY);

      pdf.setFont(undefined, 'italic');
      pdf.text('Thank you for shopping with us!', 105, 150, { align: 'center' });
    });

    pdf.save(`all-package-slips-placed.pdf`);
  };

  const exportDeliveredOrdersExcel = () => {
    const deliveredOrders = orders.filter(order => {
      const matchesStatus = order.status === 'Delivered';
      const matchesSearch =
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.paymentMethod || 'online').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCoupon =
        !couponFilter ? true :
          couponFilter === "any_coupon" ? !!order.couponCode :
            couponFilter === "no_coupon" ? !order.couponCode :
              order.couponCode?.toLowerCase().includes(couponFilter.toLowerCase());
      let matchesDate = true;
      if (startDate || endDate) {
        const orderDate = new Date(order.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && end) matchesDate = orderDate >= start && orderDate <= new Date(end.setHours(23, 59, 59));
        else if (start) matchesDate = orderDate >= start;
        else if (end) matchesDate = orderDate <= new Date(end.setHours(23, 59, 59));
      }
      return matchesStatus && matchesSearch && matchesDate && matchesCoupon;
    });
    if (deliveredOrders.length === 0) { alert('No delivered orders found for the selected date range'); return; }
    const excelData = deliveredOrders.map((order, index) => {
      let names = [], sizes = [], colors = [], variantIds = [], qtys = [];
      order.items?.forEach(item => {
        if (item.type === 'bundle' && item.bundleItems) {
          item.bundleItems.forEach(b => { names.push(`${item.name} (${b.color})`); sizes.push(b.size || 'N/A'); colors.push(b.color || 'N/A'); variantIds.push(b.sizeVariantId || 'N/A'); qtys.push(1); });
        } else { names.push(item.name || 'N/A'); sizes.push(item.size || 'N/A'); colors.push(item.color || 'N/A'); variantIds.push(item.sizeVariantId || 'N/A'); qtys.push(item.quantity || 1); }
      });
      const totalQty = qtys.reduce((sum, q) => sum + parseInt(q || 0), 0);
      return {
        'S.No': index + 1, 'Order ID': `ORD-${order.id}`,
        'Customer Name': order.user?.name || order.shippingAddress?.fullName || 'N/A',
        'Phone': order.user?.phone || 'N/A', 'Email': order.user?.email || 'N/A',
        'City': order.shippingAddress?.city || 'N/A', 'State': order.shippingAddress?.state || 'N/A',
        'Items Count': names.length || 0, 'Product Name': names.join(', \n') || 'N/A',
        'Size': sizes.join(', \n') || 'N/A', 'Color': colors.join(', \n') || 'N/A',
        'Variant ID': variantIds.join(', \n') || 'N/A', 'Item Qty': qtys.join(', \n') || '0',
        'Total Quantity': totalQty, 'Coupon Code': order.couponCode || 'N/A',
        'Discount': parseFloat(order.discount || 0), 'Payment Method': order.paymentMethod || 'N/A',
        'Total Amount': parseFloat(order.total || 0), 'Order Date': new Date(order.createdAt).toLocaleString('en-GB'),
      };
    });
    excelData.push({
      'S.No': '', 'Order ID': '', 'Customer Name': '', 'Phone': '', 'Email': '', 'City': '', 'State': 'TOTAL',
      'Items Count': excelData.reduce((sum, r) => sum + r['Items Count'], 0), 'Product Name': '', 'Size': '', 'Color': '', 'Variant ID': '', 'Item Qty': '',
      'Total Quantity': excelData.reduce((sum, r) => sum + r['Total Quantity'], 0), 'Coupon Code': '',
      'Discount': excelData.reduce((sum, r) => sum + parseFloat(r['Discount'] || 0), 0).toFixed(2), 'Payment Method': '',
      'Total Amount': excelData.reduce((sum, r) => sum + parseFloat(r['Total Amount'] || 0), 0).toFixed(2), 'Order Date': ''
    });
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Delivered Orders');
    const dateRange = startDate && endDate ? `_${startDate}_to_${endDate}` : startDate ? `_from_${startDate}` : endDate ? `_to_${endDate}` : '';
    XLSX.writeFile(wb, `delivered-orders${dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportCancelledOrdersExcel = () => {
    const cancelledOrders = orders.filter(order => {
      const matchesStatus = order.status === 'Cancelled';
      const matchesSearch =
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.paymentMethod || 'online').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCoupon =
        !couponFilter ? true :
          couponFilter === "any_coupon" ? !!order.couponCode :
            couponFilter === "no_coupon" ? !order.couponCode :
              order.couponCode?.toLowerCase().includes(couponFilter.toLowerCase());
      let matchesDate = true;
      if (startDate || endDate) {
        const orderDate = new Date(order.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (start && end) matchesDate = orderDate >= start && orderDate <= new Date(end.setHours(23, 59, 59));
        else if (start) matchesDate = orderDate >= start;
        else if (end) matchesDate = orderDate <= new Date(end.setHours(23, 59, 59));
      }
      return matchesStatus && matchesSearch && matchesDate && matchesCoupon;
    });
    if (cancelledOrders.length === 0) { alert('No cancelled orders found for the selected date range'); return; }
    const excelData = cancelledOrders.map((order, index) => {
      let names = [], sizes = [], colors = [], variantIds = [], qtys = [];
      order.items?.forEach(item => {
        if (item.type === 'bundle' && item.bundleItems) {
          item.bundleItems.forEach(b => { names.push(`${item.name} (${b.color})`); sizes.push(b.size || 'N/A'); colors.push(b.color || 'N/A'); variantIds.push(b.sizeVariantId || 'N/A'); qtys.push(1); });
        } else { names.push(item.name || 'N/A'); sizes.push(item.size || 'N/A'); colors.push(item.color || 'N/A'); variantIds.push(item.sizeVariantId || 'N/A'); qtys.push(item.quantity || 1); }
      });
      const totalQty = qtys.reduce((sum, q) => sum + parseInt(q || 0), 0);
      return {
        'S.No': index + 1, 'Order ID': `ORD-${order.id}`,
        'Customer Name': order.user?.name || order.shippingAddress?.fullName || 'N/A',
        'Phone': order.user?.phone || 'N/A', 'Email': order.user?.email || 'N/A',
        'City': order.shippingAddress?.city || 'N/A', 'State': order.shippingAddress?.state || 'N/A',
        'Items Count': names.length || 0, 'Product Name': names.join(', \n') || 'N/A',
        'Size': sizes.join(', \n') || 'N/A', 'Color': colors.join(', \n') || 'N/A',
        'Variant ID': variantIds.join(', \n') || 'N/A', 'Item Qty': qtys.join(', \n') || '0',
        'Total Quantity': totalQty, 'Coupon Code': order.couponCode || 'N/A',
        'Discount': parseFloat(order.discount || 0), 'Payment Method': order.paymentMethod || 'N/A',
        'Total Amount': parseFloat(order.total || 0), 'Cancel Reason': order.cancelRemarks || 'N/A',
        'Order Date': new Date(order.createdAt).toLocaleString('en-GB'),
      };
    });
    excelData.push({
      'S.No': '', 'Order ID': '', 'Customer Name': '', 'Phone': '', 'Email': '', 'City': '', 'State': 'TOTAL',
      'Items Count': excelData.reduce((sum, r) => sum + r['Items Count'], 0), 'Product Name': '', 'Size': '', 'Color': '', 'Variant ID': '', 'Item Qty': '',
      'Total Quantity': excelData.reduce((sum, r) => sum + r['Total Quantity'], 0), 'Coupon Code': '',
      'Discount': excelData.reduce((sum, r) => sum + parseFloat(r['Discount'] || 0), 0).toFixed(2), 'Payment Method': '',
      'Total Amount': excelData.reduce((sum, r) => sum + parseFloat(r['Total Amount'] || 0), 0).toFixed(2), 'Cancel Reason': '', 'Order Date': ''
    });
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cancelled Orders');
    const dateRange = startDate && endDate ? `_${startDate}_to_${endDate}` : startDate ? `_from_${startDate}` : endDate ? `_to_${endDate}` : '';
    XLSX.writeFile(wb, `cancelled-orders${dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportAbandonedOrdersExcel = () => {
    let abandonedOrders = orders.filter(order => order.status === 'Abandoned');

    // Use consistent filtering logic
    abandonedOrders = orders.filter(order => {
      const matchesStatus = order.status === 'Abandoned';
      const matchesSearch =
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.paymentMethod || 'online').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCoupon =
        !couponFilter ? true :
          couponFilter === "any_coupon" ? !!order.couponCode :
            couponFilter === "no_coupon" ? !order.couponCode :
              order.couponCode?.toLowerCase().includes(couponFilter.toLowerCase());

      let matchesDate = true;
      if (startDate || endDate) {
        const orderDate = new Date(order.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && end) {
          matchesDate = orderDate >= start && orderDate <= new Date(end.setHours(23, 59, 59));
        } else if (start) {
          matchesDate = orderDate >= start;
        } else if (end) {
          matchesDate = orderDate <= new Date(end.setHours(23, 59, 59));
        }
      }
      return matchesStatus && matchesSearch && matchesDate && matchesCoupon;
    });

    if (abandonedOrders.length === 0) {
      alert('No abandoned orders found for the selected date range');
      return;
    }

    const excelData = abandonedOrders.map((order, index) => {
      let names = [], sizes = [], colors = [], variantIds = [], qtys = [];
      order.items?.forEach(item => {
        if (item.type === 'bundle' && item.bundleItems) {
          item.bundleItems.forEach(b => {
            names.push(`${item.name} (${b.color})`);
            sizes.push(b.size || 'N/A');
            colors.push(b.color || 'N/A');
            variantIds.push(b.sizeVariantId || 'N/A');
            qtys.push(1);
          });
        } else {
          names.push(item.name || 'N/A');
          sizes.push(item.size || 'N/A');
          colors.push(item.color || 'N/A');
          variantIds.push(item.sizeVariantId || 'N/A');
          qtys.push(item.quantity || 1);
        }
      });

      const totalQty = qtys.reduce((sum, q) => sum + parseInt(q || 0), 0);

      return {
        'S.No': index + 1,
        'Order ID': `ORD-${order.id}`,
        'Customer Name': order.user?.name || order.shippingAddress?.fullName || 'N/A',
        'Phone': order.user?.phone || 'N/A',
        'Email': order.user?.email || 'N/A',
        'City': order.shippingAddress?.city || 'N/A',
        'State': order.shippingAddress?.state || 'N/A',
        'Items Count': names.length || 0,
        'Product Name': names.join(', \n') || 'N/A',
        'Size': sizes.join(', \n') || 'N/A',
        'Color': colors.join(', \n') || 'N/A',
        'Variant ID': variantIds.join(', \n') || 'N/A',
        'Item Qty': qtys.join(', \n') || '0',
        'Total Quantity': totalQty,
        'Total Amount': parseFloat(order.total || 0),
        'Discount': parseFloat(order.discount || 0),
        'Coupon Code': order.couponCode || 'N/A',
        'Date': new Date(order.createdAt).toLocaleString('en-GB'),
        'Payment Method': order.paymentMethod || 'N/A'
      };
    });

    const totals = {
      'S.No': '',
      'Order ID': '',
      'Customer Name': '',
      'Phone': '',
      'Email': '',
      'City': '',
      'State': 'TOTAL',
      'Items Count': excelData.reduce((sum, row) => sum + row['Items Count'], 0),
      'Product Name': '',
      'Size': '',
      'Color': '',
      'Variant ID': '',
      'Item Qty': '',
      'Total Quantity': excelData.reduce((sum, row) => sum + row['Total Quantity'], 0),
      'Total Amount': excelData.reduce((sum, row) => sum + parseFloat(row['Total Amount'] || 0), 0).toFixed(2),
      'Discount': excelData.reduce((sum, row) => sum + parseFloat(row['Discount'] || 0), 0).toFixed(2),
      'Coupon Code': '',
      'Date': '',
      'Payment Method': ''
    };

    excelData.push(totals);

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Abandoned Orders');

    const dateRange = startDate && endDate ? `_${startDate}_to_${endDate}` : startDate ? `_from_${startDate}` : endDate ? `_to_${endDate}` : '';
    XLSX.writeFile(workbook, `abandoned-orders${dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportShippedOrdersExcel = () => {
  let shippedOrders = orders.filter(order => order.status === 'Shipped');

  // Use consistent filtering logic
  shippedOrders = orders.filter(order => {
    const matchesStatus = order.status === 'Shipped';
    const matchesSearch =
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.paymentMethod || 'online').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCoupon =
      !couponFilter ? true :
      couponFilter === "any_coupon" ? !!order.couponCode :
      couponFilter === "no_coupon" ? !order.couponCode :
      order.couponCode?.toLowerCase().includes(couponFilter.toLowerCase());

    let matchesDate = true;
    if (startDate || endDate) {
      const orderDate = new Date(order.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && end) {
        matchesDate = orderDate >= start && orderDate <= new Date(end.setHours(23, 59, 59));
      } else if (start) {
        matchesDate = orderDate >= start;
      } else if (end) {
        matchesDate = orderDate <= new Date(end.setHours(23, 59, 59));
      }
    }
    return matchesStatus && matchesSearch && matchesDate && matchesCoupon;
  });

  if (shippedOrders.length === 0) {
    alert('No shipped orders found for the selected date range');
    return;
  }

  const excelData = shippedOrders.map((order, index) => {
    let names = [], sizes = [], colors = [], variantIds = [], qtys = [];
    order.items?.forEach(item => {
      if (item.type === 'bundle' && item.bundleItems) {
        item.bundleItems.forEach(b => {
          names.push(`${item.name} (${b.color})`);
          sizes.push(b.size || 'N/A');
          colors.push(b.color || 'N/A');
          variantIds.push(b.sizeVariantId || 'N/A');
          qtys.push(1);
        });
      } else {
        names.push(item.name || 'N/A');
        sizes.push(item.size || 'N/A');
        colors.push(item.color || 'N/A');
        variantIds.push(item.sizeVariantId || 'N/A');
        qtys.push(item.quantity || 1);
      }
    });

    const totalQty = qtys.reduce((sum, q) => sum + parseInt(q || 0), 0);

    return {
      'S.No': index + 1,
      'Order ID': `ORD-${order.id}`,
      'Customer Name': order.user?.name || order.shippingAddress?.fullName || 'N/A',
      'Phone': order.user?.phone || 'N/A',
      'Email': order.user?.email || 'N/A',
      'City': order.shippingAddress?.city || 'N/A',
      'State': order.shippingAddress?.state || 'N/A',
      'Items Count': names.length || 0,
      'Product Name': names.join(', \n') || 'N/A',
      'Size': sizes.join(', \n') || 'N/A',
      'Color': colors.join(', \n') || 'N/A',
      'Variant ID': variantIds.join(', \n') || 'N/A',
      'Item Qty': qtys.join(', \n') || '0',
      'Quantity': totalQty,
      'Weight (gms)': order.chargedWeight || 0,
      'Courier Name': order.courierName || 'N/A',
      'Tracking ID': order.trackingId || 'N/A',
      'Tracking Link': order.trackingLink || 'N/A',
      'Shipped Date': new Date(order.updatedAt).toLocaleString('en-GB'),
      'Order Date': new Date(order.createdAt).toLocaleString('en-GB'),
      'Coupon Code': order.couponCode || 'N/A',
      'Discount': parseFloat(order.discount || 0),
      'Payment Method': order.paymentMethod || 'N/A',
      'Total Amount': parseFloat(order.total || 0),
      'COD Charge': parseFloat(order.codCharge || 0),
      'Courier Charge': parseFloat(order.courierCharge || 0)
    };
  });

  const totals = {
    'S.No': '',
    'Order ID': '',
    'Customer Name': '',
    'Phone': '',
    'Email': '',
    'City': '',
    'State': 'TOTAL',
    'Items Count': excelData.reduce((sum, row) => sum + row['Items Count'], 0),
    'Product Name': '',
    'Size': '',
    'Color': '',
    'Variant ID': '',
    'Item Qty': '',
    'Total Quantity': excelData.reduce((sum, row) => sum + row['Total Quantity'], 0),
    'Weight (gms)': excelData.reduce((sum, row) => sum + (parseFloat(row['Weight (gms)']) || 0), 0),
    'Courier Name': '',
    'Tracking ID': '',
    'Tracking Link': '',
    'Shipped Date': '',
    'Order Date': '',
    'Coupon Code': '',
    'Discount': excelData.reduce((sum, row) => sum + parseFloat(row['Discount'] || 0), 0).toFixed(2),
    'Payment Method': '',
    'Total Amount': excelData.reduce((sum, row) => sum + parseFloat(row['Total Amount'] || 0), 0).toFixed(2),
    'COD Charge': excelData.reduce((sum, row) => sum + parseFloat(row['COD Charge'] || 0), 0).toFixed(2),
    'Courier Charge': excelData.reduce((sum, row) => sum + parseFloat(row['Courier Charge'] || 0), 0).toFixed(2)
  };

  excelData.push(totals);

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Shipped Orders');

  const dateRange = startDate && endDate ? `_${startDate}_to_${endDate}` : startDate ? `_from_${startDate}` : endDate ? `_to_${endDate}` : '';
  XLSX.writeFile(workbook, `shipped-orders${dateRange}_${new Date().toISOString().split('T')[0]}.xlsx`);
};



  const generateInvoice = (order) => {
    generateInvoicePDF(order, true);
  };

  const generateCombinedDocument = (order) => {
    const pdf = new jsPDF();
    const address = order.shippingAddress;

    pdf.setDrawColor(200);
    pdf.line(105, 0, 105, 148.5);
    pdf.line(0, 148.5, 210, 148.5);

    // === PACKAGE SLIP - Top Left ===
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'bold');
    pdf.text('PACKING SLIP', 55, 20, { align: 'center' });

    pdf.setFontSize(9);
    let startY = 35;

    if (order.paymentMethod?.toLowerCase() === 'cod') {
      pdf.setFont(undefined, 'bold');
      pdf.text('Cust ID :', 55, startY);
      pdf.text(`1857330518`, 76, startY);

      startY += 5;
      pdf.text('COD     :', 55, startY);
      pdf.text(`Rs.${parseFloat(order.total || 0).toFixed(2)}/-`, 76, startY);

      startY += 6;
    }

    pdf.setFont(undefined, 'bold');
    pdf.text('Sales Order No :', 55, startY);
    pdf.setFont(undefined, 'normal');
    pdf.text(`ORD-${new Date().getFullYear()}-${order.id}`, 81, startY);

    startY += 5;
    pdf.setFont(undefined, 'bold');
    pdf.text('Order Date :', 55, startY);
    pdf.setFont(undefined, 'normal');
    pdf.text(new Date(order.createdAt).toLocaleDateString('en-GB'), 76, startY);

    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    pdf.text('SHIP TO:', 10, 58);
    pdf.setFont(undefined, 'normal');

    let shipY = 62;
    if (address) {
      pdf.setFont(undefined, 'bold');
      const nameLines = pdf.splitTextToSize(`${capitalizeEachWord(address.fullName || order.user?.name || 'N/A')} (${address.mobile || order.user?.phone || 'N/A'})`, 95);
      pdf.text(nameLines, 10, shipY);
      shipY += nameLines.length * 3.5;
      pdf.setFont(undefined, 'normal');
      const addr1Lines = pdf.splitTextToSize(capitalizeEachWord(address.addressLine1 || address.address || ''), 95);
      pdf.text(addr1Lines, 10, shipY);
      shipY += addr1Lines.length * 3.5;
      if (address.addressLine2) {
        const addr2Lines = pdf.splitTextToSize(capitalizeEachWord(address.addressLine2), 95);
        pdf.text(addr2Lines, 10, shipY);
        shipY += addr2Lines.length * 3.5;
      }
      const cityLines = pdf.splitTextToSize(`${capitalizeEachWord(address.city || '')}, ${capitalizeEachWord(address.state || '')}, ${address.pincode || ''}`, 95);
      pdf.text(cityLines, 10, shipY);
      shipY += cityLines.length * 3.5;
      pdf.setFont(undefined, 'bold');
      pdf.text('Landmark:', 10, shipY);
      pdf.setFont(undefined, 'normal');
      const landmarkLines = pdf.splitTextToSize(capitalizeEachWord(address.landmark || 'N/A'), 70);
      pdf.text(landmarkLines, 26, shipY);
      shipY += landmarkLines.length * 3.5;
    }

    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    pdf.text('SHIP FROM:', 50, 94);

    let fromY = 98;
    pdf.text(PACKAGE_SLIP_SELLER_DETAILS[0], 50, fromY);
    fromY += 3.5;
    const fromAddrLines = pdf.splitTextToSize(PACKAGE_SLIP_SELLER_DETAILS[1], 55);
    pdf.text(fromAddrLines, 50, fromY);
    fromY += fromAddrLines.length * 3.5;
    const fromGstLines = pdf.splitTextToSize(PACKAGE_SLIP_SELLER_DETAILS[2], 55);
    pdf.text(fromGstLines, 50, fromY);
    pdf.setFont(undefined, 'normal');

    pdf.setFont(undefined, 'italic');
    pdf.text('Thank you for shopping with us!', 52, 130, { align: 'center' });

    // === INVOICE - Top Right ===
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    pdf.text('INVOICE', 150, 10);

    pdf.setFontSize(5);
    pdf.setFont(undefined, 'bold');
    pdf.text('Sold By :', 108, 16);
    pdf.setFont(undefined, 'normal');
    pdf.text(SELLER_DETAILS[0], 108, 19);
    pdf.text(SELLER_DETAILS[1], 108, 21);
    pdf.text(SELLER_DETAILS[2], 108, 23);
    pdf.text(SELLER_DETAILS[3], 108, 25);
    pdf.text(SELLER_DETAILS[4], 108, 27);

    pdf.setFont(undefined, 'bold');
    pdf.text('Billing Address :', 155, 16);
    pdf.setFont(undefined, 'normal');
    if (address) {
      let billY = 19;
      pdf.text(address.fullName || order.user?.name || 'N/A', 155, billY);
      billY += 2.5;
      const billLine1 = pdf.splitTextToSize(address.addressLine1 || address.address || '', 42);
      pdf.text(billLine1, 155, billY);
      billY += billLine1.length * 2.5;
      if (address.addressLine2) {
        const billLine2 = pdf.splitTextToSize(address.addressLine2, 42);
        pdf.text(billLine2, 155, billY);
        billY += billLine2.length * 2.5;
      }
      pdf.text(`${address.city || ''}, ${address.state || 'N/A'}, ${address.pincode || ''}`, 155, billY);
      billY += 2.5;
      pdf.text('IN', 155, billY);
    }

    pdf.setFont(undefined, 'bold');
    pdf.text('Acc. No:', 108, 31);
    pdf.setFont(undefined, 'normal');
    pdf.text('41202153215', 120, 31);
    pdf.setFont(undefined, 'bold');
    pdf.text('IFSC:', 108, 34);
    pdf.setFont(undefined, 'normal');
    pdf.text('SBIN0070328', 120, 34);

    pdf.line(108, 37, 202, 37);

    pdf.setFont(undefined, 'bold');
    pdf.text('Order Number:', 108, 41);
    pdf.setFont(undefined, 'normal');
    pdf.text(`ORD-${new Date().getFullYear()}-${order.id}`, 122, 41);

    pdf.setFont(undefined, 'bold');
    pdf.text('Shipping Address :', 155, 41);
    pdf.setFont(undefined, 'normal');
    if (address) {
      let shipY = 44;
      pdf.text(address.fullName || order.user?.name || 'N/A', 155, shipY);
      shipY += 2.5;
      pdf.text(address.mobile || order.user?.phone || 'N/A', 155, shipY);
      shipY += 2.5;
      const shipLine1 = pdf.splitTextToSize(address.addressLine1 || address.address || '', 42);
      pdf.text(shipLine1, 155, shipY);
      shipY += shipLine1.length * 2.5;
      if (address.addressLine2) {
        const shipLine2 = pdf.splitTextToSize(address.addressLine2, 42);
        pdf.text(shipLine2, 155, shipY);
        shipY += shipLine2.length * 2.5;
      }
      pdf.text(`${address.city || ''}, ${address.state || 'N/A'}, ${address.pincode || ''}`, 155, shipY);
      shipY += 2.5;
      pdf.text('IN', 155, shipY);
      shipY += 2.5;
      pdf.setFont(undefined, 'bold');
      pdf.text('Place of supply:', 155, shipY);
      pdf.setFont(undefined, 'normal');
      pdf.text(address.state?.toUpperCase() || 'N/A', 173, shipY);
      shipY += 2.5;
      pdf.setFont(undefined, 'bold');
      pdf.text('Place of delivery:', 155, shipY);
      pdf.setFont(undefined, 'normal');
      pdf.text(address.state?.toUpperCase() || 'N/A', 175, shipY);
    }

    pdf.setFont(undefined, 'bold');
    pdf.text('Order Date:', 108, 44);
    pdf.setFont(undefined, 'normal');
    pdf.text(new Date(order.createdAt).toLocaleDateString('en-GB'), 120, 44);

    pdf.setFont(undefined, 'bold');
    pdf.text('Invoice Number:', 108, 47);
    pdf.setFont(undefined, 'normal');
    pdf.text(`IN-${order.id}`, 127, 47);

    pdf.setFont(undefined, 'bold');
    pdf.text('Invoice Date:', 108, 50);
    pdf.setFont(undefined, 'normal');
    pdf.text(new Date(order.createdAt).toLocaleDateString('en-GB'), 123, 50);

    pdf.setFont(undefined, 'bold');
    pdf.text('Mode of Payment:', 108, 53);
    pdf.setFont(undefined, 'normal');
    pdf.text(order.paymentMethod || 'Online', 125, 53);

    // Items table
    const tableTop = 68;
    pdf.setFillColor(220, 220, 220);
    pdf.rect(108, tableTop, 94, 6, 'F');
    pdf.rect(108, tableTop, 94, 6);

    pdf.setFontSize(5);
    pdf.setFont(undefined, 'bold');
    pdf.text('Sl.', 109, tableTop + 4);
    pdf.text('Description', 118, tableTop + 4);
    pdf.text('HSN', 158, tableTop + 4);
    pdf.text('Unit Price', 168, tableTop + 4);
    pdf.text('Qty', 183, tableTop + 4);
    pdf.text('Total', 195, tableTop + 4);

    pdf.line(108, tableTop, 108, tableTop + 6);
    pdf.line(115, tableTop, 115, tableTop + 6);
    pdf.line(156, tableTop, 156, tableTop + 6);
    pdf.line(166, tableTop, 166, tableTop + 6);
    pdf.line(181, tableTop, 181, tableTop + 6);
    pdf.line(190, tableTop, 190, tableTop + 6);
    pdf.line(202, tableTop, 202, tableTop + 6);

    pdf.setFont(undefined, 'normal');
    let yPos = tableTop + 10;
    const itemStartY = yPos;

    order.items?.forEach((item, index) => {
      if (item.type === 'bundle' && item.bundleItems) {
        // For bundles, show each bundle item separately
        item.bundleItems.forEach((bundleItem, bIdx) => {
          const itemPrice = parseFloat(bundleItem.originalPrice) || 0;
          const itemQty = 1;
          const itemTotal = itemPrice;

          pdf.text((index + 1).toString() + String.fromCharCode(97 + bIdx), 109, yPos);
          const variantId = bundleItem.sizeVariantId ? ` (${bundleItem.sizeVariantId})` : '';
          const itemDesc = `${item.name.split(' Bundle')[0]} - ${bundleItem.size}, ${bundleItem.color}${variantId}`;
          const lines = pdf.splitTextToSize(itemDesc, 35);
          pdf.text(lines, 118, yPos);
          pdf.text(item.hsnCode || 'N/A', 158, yPos);
          pdf.text(`Rs.${itemPrice.toFixed(2)}`, 168, yPos);
          pdf.text(itemQty.toString(), 183, yPos);
          pdf.text(`Rs.${itemTotal.toFixed(2)}`, 200, yPos, { align: 'right' });
          yPos += Math.max(lines.length * 2.5, 4);
        });
      } else {
        const itemPrice = parseFloat(item.price) || 0;
        const itemQty = item.quantity || 1;
        const itemTotal = itemPrice * itemQty;

        pdf.text((index + 1).toString(), 109, yPos);
        const variantId = item.sizeVariantId ? ` (${item.sizeVariantId})` : '';
        const itemDesc = item.size && item.color ? `${item.name} - ${item.size}, ${item.color}${variantId}` : item.name || 'N/A';
        const lines = pdf.splitTextToSize(itemDesc, 35);
        pdf.text(lines, 118, yPos);
        pdf.text(item.hsnCode || 'N/A', 158, yPos);
        pdf.text(`Rs.${itemPrice.toFixed(2)}`, 168, yPos);
        pdf.text(itemQty.toString(), 183, yPos);
        pdf.text(`Rs.${itemTotal.toFixed(2)}`, 200, yPos, { align: 'right' });
        yPos += Math.max(lines.length * 2.5, 4);
      }
    });

    const itemEndY = yPos;
    pdf.line(108, itemEndY, 202, itemEndY);
    pdf.line(108, tableTop + 6, 108, itemEndY);
    pdf.line(115, tableTop + 6, 115, itemEndY);
    pdf.line(156, tableTop + 6, 156, itemEndY);
    pdf.line(166, tableTop + 6, 166, itemEndY);
    pdf.line(181, tableTop + 6, 181, itemEndY);
    pdf.line(190, tableTop + 6, 190, itemEndY);
    pdf.line(202, tableTop + 6, 202, itemEndY);

    yPos += 3;
    const pricingStartY = yPos;
    const subtotal = parseFloat(order.subtotal) || 0;
    const discount = parseFloat(order.discount) || 0;
    const deliveryFee = parseFloat(order.deliveryFee) || 0;
    const shippingFee = parseFloat(order.shippingFee || order.deliveryOption?.shippingFee) || 0;
    const codFee = parseFloat(order.codFee) || 0;
    const total = parseFloat(order.total) || 0;
    const deliveryGst = order.deliveryOption?.gst || {};
    const isSameState = deliveryGst.isSameState !== false;
    const gstRate = 5;
    const afterDiscount = subtotal - discount;
    const totalWithDelivery = afterDiscount + deliveryFee + shippingFee + codFee;
    const baseAmount = totalWithDelivery / (1 + gstRate / 100);
    const gstAmount = totalWithDelivery - baseAmount;
    const cgstAmount = isSameState ? (gstAmount / 2) : 0;
    const sgstAmount = isSameState ? (gstAmount / 2) : 0;
    const igstAmount = !isSameState ? gstAmount : 0;

    pdf.setFont(undefined, 'normal');
    pdf.text('Subtotal:', 118, yPos);
    pdf.text(`Rs.${subtotal.toFixed(2)}`, 200, yPos, { align: 'right' });
    yPos += 3;

    if (discount > 0) {
      pdf.text(`Discount (${order.couponCode || ''}):`, 118, yPos);
      pdf.text(`- Rs.${discount.toFixed(2)}`, 200, yPos, { align: 'right' });
      yPos += 3;
    }

    pdf.text('Delivery Fee:', 118, yPos);
    pdf.text(`Rs.${deliveryFee.toFixed(2)}`, 200, yPos, { align: 'right' });
    yPos += 3;

    if (shippingFee > 0) {
      pdf.text('Shipping Fee:', 118, yPos);
      pdf.text(`Rs.${shippingFee.toFixed(2)}`, 200, yPos, { align: 'right' });
      yPos += 3;
    }

    pdf.text('COD Fee:', 118, yPos);
    pdf.text(`Rs.${codFee.toFixed(2)}`, 200, yPos, { align: 'right' });
    yPos += 3;

    pdf.text('Taxable Amount:', 118, yPos);
    pdf.text(`Rs.${baseAmount.toFixed(2)}`, 200, yPos, { align: 'right' });
    yPos += 3;

    if (isSameState) {
      pdf.text(`CGST (2.50%)`, 118, yPos);
      pdf.text(`Rs.${cgstAmount.toFixed(2)}`, 200, yPos, { align: 'right' });
      yPos += 3;
      pdf.text(`SGST (2.50%)`, 118, yPos);
      pdf.text(`Rs.${sgstAmount.toFixed(2)}`, 200, yPos, { align: 'right' });
      yPos += 3;
    } else {
      pdf.text(`IGST (5.00%)`, 118, yPos);
      pdf.text(`Rs.${igstAmount.toFixed(2)}`, 200, yPos, { align: 'right' });
      yPos += 3;
    }

    pdf.setFont(undefined, 'bold');
    pdf.text('TOTAL:', 118, yPos);
    pdf.text(`Rs.${total.toFixed(2)}`, 200, yPos, { align: 'right' });

    yPos += 4;
    pdf.text('Amount in Words:', 118, yPos);
    pdf.setFont(undefined, 'normal');
    const amountInWords = convertToWords(total);
    const wordLines = pdf.splitTextToSize(amountInWords, 80);
    pdf.text(wordLines, 118, yPos + 3);

    const pricingEndY = yPos + 3 + (wordLines.length * 2.5);
    pdf.rect(108, itemEndY, 94, pricingEndY - itemEndY);

    // Authorized Signatory
    let footerY = pricingEndY + 4;
    pdf.setFont(undefined, 'bold');
    pdf.text('For SRI GANESH LABELS:', 175, footerY);
    if (signatureUrl) {
      const signatureImg = new Image();
      signatureImg.src = signatureUrl;
      try {
        pdf.addImage(signatureImg, 'PNG', 175, footerY + 2, 20, 6);
      } catch (e) { }
    }
    pdf.setFont(undefined, 'normal');
    pdf.text('Authorized Signatory', 175, footerY + 10);

    // Date & Time
    pdf.setFont(undefined, 'bold');
    pdf.text('Date & Time:', 108, footerY + 10);
    pdf.setFont(undefined, 'normal');
    pdf.text(new Date().toLocaleString('en-GB'), 125, footerY + 10);
    pdf.save(`combined-${order.id}.pdf`);
  };

  const convertToWords = (amount) => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const rupees = Math.floor(amount);
    const paise = Math.round((amount - rupees) * 100);

    if (rupees === 0 && paise === 0) return 'Zero only';

    let words = '';
    let num = rupees;

    if (num >= 100000) {
      words += ones[Math.floor(num / 100000)] + ' Lakh ';
      num %= 100000;
    }

    if (num >= 1000) {
      const thousands = Math.floor(num / 1000);
      if (thousands >= 10) {
        words += tens[Math.floor(thousands / 10)] + ' ';
        if (thousands % 10 > 0) words += ones[thousands % 10] + ' ';
      } else {
        words += ones[thousands] + ' ';
      }
      words += 'Thousand ';
      num %= 1000;
    }

    if (num >= 100) {
      words += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }

    if (num >= 20) {
      words += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      words += teens[num - 10] + ' ';
      num = 0;
    }

    if (num > 0) {
      words += ones[num] + ' ';
    }

    if (rupees > 0) {
      words += 'Rupees ';
    }

    if (paise > 0) {
      if (rupees > 0) words += 'and ';
      if (paise >= 20) {
        words += tens[Math.floor(paise / 10)] + ' ';
        if (paise % 10 > 0) words += ones[paise % 10] + ' ';
      } else if (paise >= 10) {
        words += teens[paise - 10] + ' ';
      } else {
        words += ones[paise] + ' ';
      }
      words += 'Paise ';
    }

    return words.trim() + ' only';
  };

  const downloadModalAsImage = async () => {
    if (!modalRef.current) return;

    try {
      // Store original styles
      const modalBody = modalRef.current.querySelector('.modal-body');
      const originalOverflow = modalBody.style.overflow;
      const originalMaxHeight = modalBody.style.maxHeight;

      // Remove scroll and height restrictions temporarily
      modalBody.style.overflow = 'visible';
      modalBody.style.maxHeight = 'none';

      // Wait for layout to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(modalRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY,
        scrollX: -window.scrollX,
        windowHeight: modalRef.current.scrollHeight,
      });

      // Restore original styles
      modalBody.style.overflow = originalOverflow;
      modalBody.style.maxHeight = originalMaxHeight;

      const link = document.createElement('a');
      link.download = `order-${selectedOrder.id}-details.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image');
    }
  };

  const downloadStatsAsImage = async () => {
  try {
    // Create a hidden off-screen clone with mobile layout
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
    link.download = `order-summary-stats-${new Date().toISOString().split('T')[0]}.png`;
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
    link.download = `return-summary-stats-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error downloading return summary image:', error);
  }
};


const resetDateRange = () => {
  setStartDate("");
  setEndDate("");
};

 const ordersBeforeStatusFilter = orders.filter((order) => {
  const matchesSearch =
    order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shippingAddress?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shippingAddress?.mobile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.shippingAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.courierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `ORD-${order.id}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.paymentMethod || 'online').toLowerCase().includes(searchTerm.toLowerCase());

  const matchesCoupon = 
    !couponFilter ? true :
    couponFilter === "any_coupon" ? !!order.couponCode :
    couponFilter === "no_coupon" ? !order.couponCode :
    order.couponCode?.toLowerCase().includes(couponFilter.toLowerCase());

  let matchesDate = true;
  if (startDate || endDate) {
    const orderDate = new Date(order.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      matchesDate = orderDate >= start && orderDate <= new Date(end.setHours(23, 59, 59));
    } else if (start) {
      matchesDate = orderDate >= start;
    } else if (end) {
      matchesDate = orderDate <= new Date(end.setHours(23, 59, 59));
    }
  }

  return matchesSearch && matchesDate && matchesCoupon;
});

const filteredOrders = ordersBeforeStatusFilter.filter((order) => {
  return statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();
});

const getStatusCounts = () => {
  return {
    all: ordersBeforeStatusFilter.length,
    pending: ordersBeforeStatusFilter.filter((o) => o.status === "pending").length,
    placed: ordersBeforeStatusFilter.filter((o) => o.status === "Placed").length,
    accepted: ordersBeforeStatusFilter.filter((o) => o.status === "Accepted").length,
    shipped: ordersBeforeStatusFilter.filter((o) => o.status === "Shipped").length,
    delivered: ordersBeforeStatusFilter.filter((o) => o.status === "Delivered").length,
    cancelled: ordersBeforeStatusFilter.filter((o) => o.status === "Cancelled").length,
    abandoned: ordersBeforeStatusFilter.filter((o) => o.status === "Abandoned").length,
    codreturn: ordersBeforeStatusFilter.filter((o) => o.status === "CODReturn").length,
  };
};

const statusCounts = getStatusCounts();

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />;
      case "placed":
        return <Package size={16} />;
      case "accepted":
        return <CheckCircle size={16} />;
      case "shipped":
        return <Truck size={16} />;
      case "delivered":
        return <CheckCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatDate = (value) =>
    new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const baseColumns = [
    { key: "id", label: "Order ID", render: (value) => <span style={{whiteSpace: 'nowrap'}}>#ORD-{value}</span> },
    {
      key: "trackingId",
      label: "Tracking ID",
      render: (value) => value || "-"
    },
    {
      key: "user",
      label: "Customer",
      render: (value, row) => {
        const name = capitalizeEachWord(value?.name || row.shippingAddress?.fullName || "N/A");
        const city = capitalizeEachWord(row.shippingAddress?.city || "N/A");
        const phone = value?.phone || "N/A";
        return (
          <div className="customer-info">
            <div className="customer-name">{name}</div>
            <div className="customer-email">{city}</div>
            <div className="customer-phone">{phone}</div>
          </div>
        );
      },
    },
    {
      key: "items",
      label: "Products",
      render: (value) => `${value?.length || 0} items`,
    },
    {
      key: "items",
      label: "Quantity",
      render: (value) => {
        const totalQty = value?.reduce((sum, item) => {
          if (item.type === 'bundle' && item.bundleItems) {
            return sum + item.bundleItems.length;
          }
          return sum + (item.quantity || 0);
        }, 0) || 0;
        return totalQty;
      },
    },
    { key: "total", label: "Final Total", render: (value) => `₹${value}` },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <div className={`order-status ${value?.toLowerCase() || ""}`}>
          {getStatusIcon(value?.toLowerCase())}
          <span>{value || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "paymentMethod",
      label: "Payment",
      render: (value) => (
        <span className={`payment-status ${value?.toLowerCase() || ""}`}>
          {value || "N/A"}
        </span>
      ),
    },
  ];

  const columns = [
    ...baseColumns,
    ...(statusFilter === "delivered"
      ? [{ key: "updatedAt", label: "Delivery Date", render: (value) => formatDate(value) }]
      : statusFilter === "cancelled"
      ? [{ key: "updatedAt", label: "Cancelled Date", render: (value) => formatDate(value) }]
      : statusFilter === "shipped"
      ? [
          { key: "updatedAt", label: "Shipped Date", render: (value) => formatDate(value) },
          { key: "trackingId", label: "Tracking ID" }
        ]
      : [
          { key: "createdAt", label: "Date", render: (value) => formatDate(value) },
          { key: "updatedAt", label: "Shipped Date", render: (value, row) => row.status === "Shipped" || row.status === "Delivered" ? formatDate(value) : "-" },
        ]
    ),
    {
      key: "actions",
      label: "Actions",
      width: '100px',
      render: (_, row) => (
        <div className="action-buttons" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', gap: '10px' }}>
          <button
            className="action-btn view"
            title="View Details"
            onClick={() => handleViewOrder(row)}
          >
            <Eye size={16} />
          </button>
          {row.status !== 'Delivered' && row.status !== 'Cancelled' && (
            <button
              className="action-btn edit"
              title="Edit Order"
              onClick={() => handleEditOrder(row)}
            >
              <Edit size={16} />
            </button>
          )}
          {(row.status === 'Placed' || row.status === 'Accepted' || row.status === 'Shipped' || row.status === 'Delivered') && (
            <button
              className="action-btn download"
              title="Download Combined Document"
              onClick={() => generateCombinedDocument(row)}
            >
              <Receipt size={16} />
            </button>
          )}
          {row.status === 'Accepted' && (
            <button
              className="action-btn view"
              title="Push to Shiprocket"
              style={{ backgroundColor: '#fff7ed', color: '#f97316' }}
              onClick={() => handlePushToShiprocket(row.id)}
            >
              <Truck size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <div>Loading...</div>;

  return (
    <div className="orders-list">
      <div className="page-header">
        <div className="header-left">
          <h1>Orders</h1>
          <p>Manage and track all customer orders</p>
        </div>
      </div>

    
 <div
  className="orders-stats"
  style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
>
  {/* Status Filter Cards - First */}
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px',
    }}
  >
    <div
      className="stat-card summary-stat-card"
      style={{ flex: '1 1 0', cursor: 'pointer' }}
      onClick={() => setStatusFilter("placed")}
    >
      <div className="stat-icon placed">
        <Package size={24} />
      </div>
      <div className="stat-content">
        <h3>{statusCounts.placed}</h3>
        <p>Placed</p>
      </div>
    </div>

    <div
      className="stat-card summary-stat-card"
      style={{ flex: '1 1 0', cursor: 'pointer' }}
      onClick={() => setStatusFilter("accepted")}
    >
      <div
        className="stat-icon accepted"
        style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}
      >
        <CheckCircle size={24} />
      </div>
      <div className="stat-content">
        <h3>{statusCounts.accepted}</h3>
        <p>Accepted</p>
      </div>
    </div>

    <div
      className="stat-card summary-stat-card"
      style={{ flex: '1 1 0', cursor: 'pointer' }}
      onClick={() => setStatusFilter("shipped")}
    >
      <div className="stat-icon shipped">
        <Truck size={24} />
      </div>
      <div className="stat-content">
        <h3>{statusCounts.shipped}</h3>
        <p>Shipped</p>
      </div>
    </div>

    <div
      className="stat-card summary-stat-card"
      style={{ flex: '1 1 0', cursor: 'pointer' }}
      onClick={() => setStatusFilter("delivered")}
    >
      <div
        className="stat-icon delivered"
        style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}
      >
        <CheckCircle size={24} />
      </div>
      <div className="stat-content">
        <h3>{statusCounts.delivered}</h3>
        <p>Delivered</p>
      </div>
    </div>

    <div
      className="stat-card summary-stat-card"
      style={{ flex: '1 1 0', cursor: 'pointer' }}
      onClick={() => setStatusFilter("codreturn")}
    >
      <div
        className="stat-icon"
        style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}
      >
        <Package size={24} />
      </div>
      <div className="stat-content">
        <h3>{statusCounts.codreturn}</h3>
        <p>COD Return</p>
      </div>
    </div>
  </div>

  {/* Summary Statistics Cards - Second */}
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
    {/* Header row with title + icon */}
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
         Sales Summary
        </h3>
       
      </div>

      <button
        type="button"
        onClick={downloadStatsAsImage}
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

 {/* Summary cards row – equal width */}
<div
  data-summary-cards
  style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  }}
>
  {/* First Row: 5 Cards */}
  <div className="summary-cards-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
        <Users size={24} />
      </div>
      <div className="stat-content">
        <h3>{orderStats.totalCustomers}</h3>
        <p>Total Customers</p>
      </div>
    </div>

    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
        <Package size={24} />
      </div>
      <div className="stat-content">
        <h3>{orderStats.totalSales}</h3>
        <p style={{ marginBottom: '4px' }}>Total Bills</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
          <span>COD: {orderStats.totalCodBills || 0}</span>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span>Online: {orderStats.totalOnlineBills || 0}</span>
        </div>
      </div>
    </div>

    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
        <Package size={24} />
      </div>
      <div className="stat-content">
        <h3>{orderStats.totalQuantity}</h3>
        <p style={{ marginBottom: '4px' }}>Total Quantity</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
          <span>COD: {orderStats.totalCodQuantity || 0}</span>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span>Online: {orderStats.totalOnlineQuantity || 0}</span>
        </div>
      </div>
    </div>

    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
        <ShoppingBag size={24} />
      </div>
      <div className="stat-content">
        <h3>₹{(() => {
          const baseValue = orderStats.totalBaseValue || 0;
          return baseValue.toFixed(2);
        })()}</h3>
        <p style={{ marginBottom: '4px' }}>Total Base Value (Products)</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
          <span>COD: ₹{(orderStats.totalCodBaseValue || 0).toFixed(2)}</span>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span>Online: ₹{((orderStats.totalBaseValue || 0) - (orderStats.totalCodBaseValue || 0)).toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#f0fdf4', color: '#22c55e' }}>
        <Receipt size={24} />
      </div>
      <div className="stat-content">
        <h3>₹{orderStats.totalValue?.toFixed(2) || '0.00'}</h3>
        <p style={{ marginBottom: '4px' }}>Total Value</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
          <span>COD: ₹{orderStats.totalCodValue?.toFixed(2) || '0.00'}</span>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span>Online: ₹{((orderStats.totalValue || 0) - (orderStats.totalCodValue || 0))?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    </div>
  </div>

  {/* Second Row: 5 Cards */}
  <div className="summary-cards-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
        <CreditCard size={24} />
      </div>
      <div className="stat-content">
        <h3>₹{Math.round(orderStats.totalCommission || 0)}</h3>
        <p style={{ marginBottom: '4px' }}>Total Commission</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
          <span>COD: ₹{Math.round(orderStats.totalCodCommission || 0)}</span>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span>Online: ₹{Math.round(orderStats.totalOnlineCommission || 0)}</span>
        </div>
      </div>
    </div>

    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#d1fae5', color: '#059669' }}>
        <Receipt size={24} />
      </div>
      <div className="stat-content">
        <h3>₹{Math.round(orderStats.totalSettlement || 0)}</h3>
        <p style={{ marginBottom: '4px' }}>Total Settlement</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
          <span>COD: ₹{Math.round(orderStats.totalCodSettlement || 0)}</span>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span>Online: ₹{Math.round(orderStats.totalOnlineSettlement || 0)}</span>
        </div>
      </div>
    </div>

    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
        <Truck size={24} />
      </div>
      <div className="stat-content">
        <h3>₹{orderStats.totalShippingValue?.toFixed(2) || '0.00'}</h3>
        <p style={{ marginBottom: '4px' }}>Shipped Value</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
          <span>COD: ₹{orderStats.totalCodShipping?.toFixed(2) || '0.00'}</span>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span>Online: ₹{orderStats.totalOnlineShipping?.toFixed(2) || '0.00'}</span>
        </div>
      </div>
    </div>

    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
        <Wallet size={24} />
      </div>
      <div className="stat-content">
        <h3>₹{Math.round((orderStats.totalSettlement || 0) - (orderStats.totalShippingValue || 0))}</h3>
        <p style={{ marginBottom: '4px' }}>Final Amount</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
          <span>COD: ₹{Math.round((orderStats.totalCodSettlement || 0) - (orderStats.totalCodShipping || 0))}</span>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span>Online: ₹{Math.round((orderStats.totalOnlineSettlement || 0) - (orderStats.totalOnlineShipping || 0))}</span>
        </div>
      </div>
    </div>

    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
        <Receipt size={24} />
      </div>
      <div className="stat-content">
        <h3>₹{orderStats.totalDiscount?.toFixed(2) || '0.00'}</h3>
        <p>Total Discount</p>
      </div>
    </div>

    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}>
        <TrendingUp size={24} />
      </div>
      <div className="stat-content">
        <h3>₹{(() => {
          const profitLoss = ((orderStats.totalSettlement || 0) - (orderStats.totalShippingValue || 0)) - ((orderStats.totalBaseValue || 0) - (orderStats.totalDiscount || 0));
          return Math.round(profitLoss);
        })()}</h3>
        <p style={{ marginBottom: '4px' }}>Profit/Loss</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '10px', color: '#9ca3af', fontWeight: '500' }}>
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
</div>

{/* Return Summary Section */}
<div
  ref={returnSummaryRef}
  style={{
    marginTop: '4px',
    padding: '12px 16px',
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
        Return Summary
      </h3>
    </div>

    <button
      type="button"
      onClick={downloadReturnSummaryAsImage}
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
      title="Download return summary as image"
    >
      <ImageIcon size={14} />
      <span>Download</span>
    </button>
  </div>

  <div className="summary-cards-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
    {/* Card 1: Total Return Customers */}
    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
        <Users size={24} />
      </div>
      <div className="stat-content">
        <h3>{orderStats.totalCodReturnCustomers || 0}</h3>
        <p>Total Return Customers</p>
      </div>
    </div>

    {/* Card 2: Total Return Bills */}
    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
        <Package size={24} />
      </div>
      <div className="stat-content">
        <h3>{orderStats.totalCodReturnBills || 0}</h3>
        <p>Total Return Bills</p>
      </div>
    </div>

    {/* Card 3: Total Return Quantity */}
    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
        <Package size={24} />
      </div>
      <div className="stat-content">
        <h3>{orderStats.totalCodReturnQuantity || 0}</h3>
        <p>Total Return Quantity</p>
      </div>
    </div>

    {/* Card 4: Total Return Base Value */}
    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
        <ShoppingBag size={24} />
      </div>
      <div className="stat-content">
        <h3>₹{(orderStats.totalCodReturnBaseValue || 0).toFixed(2)}</h3>
        <p>Total Return Base Value</p>
      </div>
    </div>

    {/* Card 5: Total Return Value */}
    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
        <Receipt size={24} />
      </div>
      <div className="stat-content">
        <h3>₹{(orderStats.totalCodReturnValue || 0).toFixed(2)}</h3>
        <p>Total Return Value</p>
      </div>
    </div>

    {/* Card 6: Return Shipped Value */}
    <div className="stat-card summary-stat-card" style={{ flex: '1 1 0' }}>
      <div className="stat-icon" style={{ backgroundColor: '#fef2f2', color: '#ef4444' }}>
        <Truck size={24} />
      </div>
      <div className="stat-content">
        <h3>₹{(orderStats.totalCodReturnShipping || 0).toFixed(2)}</h3>
        <p>Return Shipped Value</p>
      </div>
    </div>
  </div>
    </div>
  </div>
      <div className="status-tabs">
        <button
          className={statusFilter === "all" ? "tab active" : "tab"}
          onClick={() => setStatusFilter("all")}
        >
          All ({statusCounts.all})
        </button>
        <button
          className={statusFilter === "placed" ? "tab active" : "tab"}
          onClick={() => setStatusFilter("placed")}
        >
          Placed ({statusCounts.placed})
        </button>
        <button
          className={statusFilter === "accepted" ? "tab active" : "tab"}
          onClick={() => setStatusFilter("accepted")}
        >
          Accepted ({statusCounts.accepted})
        </button>
        <button
          className={statusFilter === "shipped" ? "tab active" : "tab"}
          onClick={() => setStatusFilter("shipped")}
        >
          Shipped ({statusCounts.shipped})
        </button>
        <button
          className={statusFilter === "delivered" ? "tab active" : "tab"}
          onClick={() => setStatusFilter("delivered")}
        >
          Delivered ({statusCounts.delivered})
        </button>
        <button
          className={statusFilter === "cancelled" ? "tab active" : "tab"}
          onClick={() => setStatusFilter("cancelled")}
        >
          Cancelled ({statusCounts.cancelled})
        </button>
        <button
          className={statusFilter === "codreturn" ? "tab active" : "tab"}
          onClick={() => setStatusFilter("codreturn")}
        >
          COD Return ({statusCounts.codreturn})
        </button>
        <button
          className={statusFilter === "abandoned" ? "tab active" : "tab"}
          onClick={() => setStatusFilter("abandoned")}
        >
          Abandoned ({statusCounts.abandoned})
        </button>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, phone, city, order ID, tracking ID, courier, payment (cod/online)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="coupon-filter-wrapper">
            <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Coupon:</label>
            <select
              value={couponFilter}
              onChange={(e) => setCouponFilter(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', outline: 'none', backgroundColor: 'white' }}
            >
              <option value="">All Orders</option>
              <option value="any_coupon">All Coupons</option>
              <option value="no_coupon">Orders Without Coupon</option>
              {availableCoupons.map(coupon => (
                <option key={coupon.id} value={coupon.code}>{coupon.code}</option>
              ))}
            </select>
          </div>
         {statusFilter === "all" && (
  <div className="date-filter-wrapper">
    <div className="date-inputs-group">
      <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>From:</label>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
      <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>To:</label>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
      <button type="button" onClick={() => { setStartDate(""); setEndDate(""); }} className="reset-date-btn" title="Reset dates"><X size={16} /></button>
    </div>
    <button className="download-all-btn" onClick={exportAllOrdersExcel} title="Export All Orders to Excel">
      <Download size={16} /> Download Report
    </button>
  </div>
)}
          {statusFilter === "abandoned" && (
            <div className="date-filter-wrapper">
              <div className="date-inputs-group">
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>From:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
                <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>To:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
                <button type="button" onClick={() => { setStartDate(""); setEndDate(""); }} className="reset-date-btn" title="Reset dates"><X size={16} /></button>
              </div>
              <button className="download-all-btn" onClick={exportAbandonedOrdersExcel} title="Export Abandoned Orders to Excel">
                <Download size={16} /> Download Report
              </button>
            </div>
          )}
         {statusFilter === "delivered" && (
  <div className="date-filter-wrapper">
    <div className="date-inputs-group">
      <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>From:</label>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
      <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>To:</label>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
      <button type="button" onClick={() => { setStartDate(""); setEndDate(""); }} className="reset-date-btn" title="Reset dates"><X size={16} /></button>
    </div>
    <button className="download-all-btn" onClick={exportDeliveredOrdersExcel} title="Export Delivered Orders to Excel">
      <Download size={16} /> Download Report
    </button>
  </div>
)}
         {statusFilter === "cancelled" && (
  <div className="date-filter-wrapper">
    <div className="date-inputs-group">
      <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>From:</label>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
      <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>To:</label>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
      <button type="button" onClick={() => { setStartDate(""); setEndDate(""); }} className="reset-date-btn" title="Reset dates"><X size={16} /></button>
    </div>
    <button className="download-all-btn" onClick={exportCancelledOrdersExcel} title="Export Cancelled Orders to Excel">
      <Download size={16} /> Download Report
    </button>
  </div>
)}
         {statusFilter === "shipped" && (
  <div className="date-filter-wrapper">
    <div className="date-inputs-group">
      <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>From:</label>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
      <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>To:</label>
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', outline: 'none' }} />
      <button type="button" onClick={() => { setStartDate(""); setEndDate(""); }} className="reset-date-btn" title="Reset dates"><X size={16} /></button>
    </div>
    <button className="download-all-btn" onClick={exportShippedOrdersExcel} title="Export Shipped Orders to Excel">
      <Download size={16} /> Download Report
    </button>
  </div>
)}
        </div>
      </div>
 <div className="table-container" style={{ overflowX: 'auto', width: '100%' }}>
        <DataTable
          data={filteredOrders}
          columns={columns}
          searchTerm=""
          searchKey="user"
        />
      </div>

      {showViewModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} ref={modalRef} style={{ maxWidth: '1000px', width: '95%' }}>
     <div className="modal-header">
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
    <h2 style={{ margin: 0 }}>Order Details - #ORD-{selectedOrder.id}</h2>
  </div>
  <div style={{ display: 'flex', gap: '8px' }}>
    <button onClick={downloadModalAsImage} style={{ padding: '8px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} title="Download as Image">
      <ImageIcon size={16} />
    </button>
    <button onClick={() => { setShowViewModal(false); setEditingAddress(false); setEditingItems(false); }}>
      <X size={20} />
    </button>
  </div>
</div>

{/* Cancellation Reason - Full width below header */}
{selectedOrder.status === 'Cancelled' && selectedOrder.cancelRemarks && (

  <div style={{
    margin: '0 0 20px 0',
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid #fecaca',
  }}>
    <span style={{
      backgroundColor: '#dc2626',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
    }}>CANCELLED</span>
    <span style={{ fontSize: '12px', color: '#991b1b', fontWeight: '500', whiteSpace: 'nowrap' }}>Reason:</span>
    <span style={{ fontSize: '13px', color: '#7f1d1d', flex: 1, wordBreak: 'break-word' }}>
      {selectedOrder.cancelRemarks}
    </span>
  </div>
)}

{/* COD Return Reason - Full width below header */}
{selectedOrder.status === 'CODReturn' && selectedOrder.codReturnRemarks && (
  <div style={{
    margin: '0 0 20px 0',
    padding: '12px 16px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid #fde68a',
  }}>
    <span style={{
      backgroundColor: '#f59e0b',
      color: 'white',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
    }}>COD RETURN</span>
    <span style={{ fontSize: '12px', color: '#92400e', fontWeight: '500', whiteSpace: 'nowrap' }}>Reason:</span>
    <span style={{ fontSize: '13px', color: '#78350f', flex: 1, wordBreak: 'break-word' }}>
      {selectedOrder.codReturnRemarks}
    </span>
  </div>
)}

            <div className="modal-body">
   

 
              <div className="order-details-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="order-info">
                  <h4>Order Information</h4>
                  <p><strong>Customer:</strong> {capitalizeEachWord(selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName || 'N/A')}</p>
                  <p><strong>Email:</strong> {selectedOrder.user?.email || 'N/A'}</p>
                  <p><strong>Status:</strong> {selectedOrder.status}</p>
                  <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
                  {selectedOrder.couponCode && (
                    <p><strong>Coupon:</strong> {selectedOrder.couponCode}</p>
                  )}
                  <p><strong>Subtotal:</strong> ₹{editingItems ? editItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0).toFixed(2) : selectedOrder.subtotal}</p>
                  <p><strong>Delivery Fee:</strong> ₹{selectedOrder.deliveryFee}</p>
                  {parseFloat(selectedOrder.shippingFee) > 0 && (
                    <p><strong>Shipping Fee:</strong> ₹{selectedOrder.shippingFee}</p>
                  )}
                  {parseFloat(selectedOrder.codFee) > 0 && (
                    <p><strong>COD Fee:</strong> ₹{selectedOrder.codFee}</p>
                  )}
                  {selectedOrder.discount && parseFloat(selectedOrder.discount) > 0 && (
                    <p><strong>Discount:</strong> -₹{selectedOrder.discount}</p>
                  )}
                  <p><strong>Total:</strong> ₹{editingItems ? (editItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1), 0) - (parseFloat(selectedOrder.discount) || 0) + (parseFloat(selectedOrder.deliveryFee) || 0) + (parseFloat(selectedOrder.shippingFee) || 0) + (parseFloat(selectedOrder.codFee) || 0)).toFixed(2) : selectedOrder.total}</p>
                  {selectedOrder.chargedWeight > 0 && (
                    <p><strong>Weight (Admin):</strong> {selectedOrder.chargedWeight} g</p>
                  )}
                  {selectedOrder.courierCharge > 0 && (
                    <p><strong>Courier Charge (Admin):</strong> ₹{selectedOrder.courierCharge}</p>
                  )}
                  {selectedOrder.codCharge > 0 && (
                    <p><strong>COD/online commission (Admin):</strong> ₹{selectedOrder.codCharge}</p>
                  )}
                </div>

               
                <div className="shipping-address" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                  <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    Shipping Address
                    {!editingAddress ? (
                      selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Abandoned' && (
                        <button onClick={() => { setEditAddress({ ...selectedOrder.shippingAddress }); setEditingAddress(true); }}
                          style={{ fontSize: '12px', padding: '4px 10px', background: '#4169E1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                          <Edit size={12} style={{ marginRight: 4 }} />Edit
                        </button>
                      )
                    ) : (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={handleSaveAddress} disabled={savingOrder}
                          style={{ fontSize: '12px', padding: '4px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                          {savingOrder ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setEditingAddress(false)}
                          style={{ fontSize: '12px', padding: '4px 10px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    )}
                  </h4>
                  {!editingAddress ? (
                    selectedOrder.shippingAddress ? (
                      <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
                        <p><strong>Name:</strong> {capitalizeEachWord(selectedOrder.shippingAddress.fullName || 'N/A')}</p>
                        <p><strong>Mobile:</strong> {selectedOrder.shippingAddress.mobile || 'N/A'}</p>
                        <p style={{ wordBreak: 'break-all', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}><strong>Address:</strong> {capitalizeEachWord(selectedOrder.shippingAddress.addressLine1 || 'N/A')}</p>
                        {selectedOrder.shippingAddress.addressLine2 && (
                          <p style={{ wordBreak: 'break-all', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}><strong>Address Line 2:</strong> {capitalizeEachWord(selectedOrder.shippingAddress.addressLine2)}</p>
                        )}
                        <p><strong>City:</strong> {capitalizeEachWord(selectedOrder.shippingAddress.city || 'N/A')}</p>
                        <p><strong>State:</strong> {capitalizeEachWord(selectedOrder.shippingAddress.state || 'N/A')}</p>
                        <p><strong>Pincode:</strong> {selectedOrder.shippingAddress.pincode || 'N/A'}</p>
                        <p><strong>Landmark:</strong> {capitalizeEachWord(selectedOrder.shippingAddress.landmark || 'N/A')}</p>
                      </div>
                    ) : <p>No shipping address provided</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[['fullName','Full Name'],['mobile','Mobile'],['addressLine1','Address Line 1'],['addressLine2','Address Line 2'],['city','City'],['state','State'],['pincode','Pincode'],['landmark','Landmark']].map(([field, label]) => (
                        <div key={field}>
                          <label style={{ fontSize: '12px', fontWeight: '500', color: '#555', display: 'block', marginBottom: '2px' }}>{label}</label>
                          <input
                            type="text"
                            value={editAddress[field] || ''}
                            onChange={e => setEditAddress(prev => ({ ...prev, [field]: e.target.value }))}
                            style={{ width: '100%', padding: '7px 10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '13px', boxSizing: 'border-box' }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="order-items-section">
                <h4 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  Order Items
                  {!editingItems ? (
                    selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Abandoned' && (
                      <button onClick={() => { setEditItems(selectedOrder.items?.map(i => ({ ...i })) || []); setEditingItems(true); fetchAllProducts(); }}
                        style={{ fontSize: '12px', padding: '4px 10px', background: '#4169E1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        <Edit size={12} style={{ marginRight: 4 }} />Edit
                      </button>
                    )
                  ) : (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={handleSaveItems} disabled={savingOrder}
                        style={{ fontSize: '12px', padding: '4px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        {savingOrder ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={() => { setEditingItems(false); setAddProductSearch(''); setAddProductSelected(null); setAddProductColor(''); setAddProductSize(''); setAddProductQty(1); setAddProductPrice(''); }}
                        style={{ fontSize: '12px', padding: '4px 10px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  )}
                </h4>

                {/* Add Product Section - only in edit mode */}
                {editingItems && (
                  <div style={{ marginBottom: '16px', padding: '16px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <h5 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#0369a1' }}>Add Product to Order</h5>
                    
                    {/* Search Input */}
                    <div style={{ position: 'relative', marginBottom: '12px' }}>
                      <input
                        type="text"
                        placeholder="Search by product name or variant ID..."
                        value={addProductSearch}
                        onChange={e => { setAddProductSearch(e.target.value); setAddProductSelected(null); setAddProductColor(''); setAddProductSize(''); }}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #bae6fd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                      />
                      {addProductSearch.trim() && !addProductSelected && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: '6px', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginTop: '4px' }}>
                          {getAddProductMatches().length === 0 ? (
                            <div style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>No products found</div>
                          ) : getAddProductMatches().map((match, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                setAddProductSelected(match.prod);
                                setAddProductSearch(match.prod.name);
                                if (match.matchType === 'variant') {
                                  setAddProductColor(match.color);
                                  setAddProductSize(match.size);
                                  const sizeObj = match.prod.colors?.find(c => c.name === match.color)?.sizes?.find(s => s.size === match.size);
                                  setAddProductPrice(sizeObj?.price || match.prod.basePrice || '0');
                                } else {
                                  setAddProductColor('');
                                  setAddProductSize('');
                                  setAddProductPrice('');
                                }
                              }}
                              style={{ padding: '10px 12px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f0f9ff'}
                              onMouseLeave={e => e.currentTarget.style.background = 'white'}
                            >
                              <span>{match.prod.name}</span>
                              {match.matchType === 'variant' && (
                                <span style={{ fontSize: '11px', background: '#fef3c7', padding: '3px 8px', borderRadius: '4px', color: '#92400e' }}>
                                  {match.color} / {match.size}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product Selection Form - Matching existing product layout */}
                    {addProductSelected && (
                      <div style={{ display: 'flex', gap: '16px', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb'}}>
                        {/* Left side: Image */}
                        <img 
                          src={addProductColor && addProductSelected.colors?.find(c => c.name === addProductColor)?.image || addProductSelected.colors?.[0]?.image || ''} 
                          alt={addProductSelected.name}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb', flexShrink: 0, marginTop: '10px'}}
                        />

                        {/* Right side: Product Name on top, Form Fields below */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {/* Product Name */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p style={{ margin: 0, fontWeight: '600', fontSize: '14px', color: '#111827' }}>{addProductSelected.name}</p>
                            <button
                              onClick={handleAddProductToOrder}
                              disabled={!addProductColor || !addProductSize}
                              style={{ 
                                padding: '6px 14px',
                                background: (!addProductColor || !addProductSize) ? '#9ca3af' : '#4169E1', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '6px', 
                                fontSize: '13px', 
                                fontWeight: '600', 
                                cursor: (!addProductColor || !addProductSize) ? 'not-allowed' : 'pointer', 
                                whiteSpace: 'nowrap',
                                height: '32px'
                              }}
                            >
                              + Add
                            </button>
                          </div>
                          
                          {/* Form Fields */}
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                            <div style={{ flex: '1 1 150px' }}>
                              <label style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Color</label>
                              <select
                                value={addProductColor}
                                onChange={e => { 
                                  setAddProductColor(e.target.value); 
                                  setAddProductSize(''); 
                                  setAddProductPrice('');
                                }}
                                style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', backgroundColor: 'white' }}
                              >
                                <option value=""></option>
                                {addProductSelected.colors?.map(c => (
                                  <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                              </select>
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                              <label style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Size</label>
                              <select
                                value={addProductSize}
                                onChange={e => {
                                  setAddProductSize(e.target.value);
                                  const sizeObj = addProductSelected.colors?.find(c => c.name === addProductColor)?.sizes?.find(s => s.size === e.target.value);
                                  setAddProductPrice(sizeObj?.price || addProductSelected.basePrice || '0');
                                }}
                                style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', backgroundColor: 'white' }}
                                disabled={!addProductColor}
                              >
                                <option value=""></option>
                                {addProductSelected.colors?.find(c => c.name === addProductColor)?.sizes?.map(s => (
                                  <option key={s.size} value={s.size}>{s.size}</option>
                                ))}
                              </select>
                            </div>
                            <div style={{ flex: '0 0 80px', marginBottom: '16px' }}>
                              <label style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Qty</label>
                              <input
                                type="number"
                                min="1"
                                value={addProductQty}
                                onChange={e => setAddProductQty(e.target.value)}
                                style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', textAlign: 'center' }}
                              />
                            </div>
                            <div style={{ flex: '0 0 90px',  marginBottom: '16px'  }}>
                              <label style={{ fontSize: '11px', fontWeight: '500', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Price</label>
                              <input
                                type="number"
                                value={addProductPrice}
                                onChange={e => setAddProductPrice(e.target.value)}
                                style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="order-items">
                  {(!editingItems ? selectedOrder.items : editItems)?.map((item, idx) => (
                    <div key={idx} className="order-item">
                      {item.type === 'bundle' ? (
                        <div style={{ width: '100%' }}>
                          <p><strong>{item.name}</strong></p>
                          <p>Bundle | Qty: {item.quantity} × ₹{item.price}</p>
                          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {item.bundleItems?.map((bundle, bIdx) => (
                              <div key={bIdx} style={{ textAlign: 'center' }}>
                                <img src={bundle.colorImage} alt={bundle.color} style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                                <p style={{ fontSize: '0.85em', margin: '5px 0 0' }}>{bundle.color} ({bundle.size})</p>
                                {bundle.sizeVariantId && (
                                  <p style={{ fontSize: '0.8em', fontFamily: 'monospace', background: '#fef3c7', padding: '3px 5px', borderRadius: '3px', margin: '3px 0 0' }}>
                                    Variant ID: <strong style={{ fontWeight: '900', fontSize: '1.8em' }}>{bundle.sizeVariantId}</strong>
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <>
                          <img src={item.imageUrl} alt={item.name} />
                          <div style={{ flex: 1 }}>
                            <p><strong>{item.name}</strong></p>
                            {editingItems ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                  {/* Color dropdown */}
                                  <div style={{ flex: 1, minWidth: '100px' }}>
                                    <label style={{ fontSize: '11px', color: '#555', display: 'block' }}>Color</label>
                                    <select
                                      value={editItems[idx]?.color || ''}
                                      onChange={e => {
                                        const prod = allProducts.find(p => p.id === editItems[idx]?.productId);
                                        const colorObj = prod?.colors?.find(c => c.name === e.target.value);
                                        const updated = [...editItems];
                                        updated[idx] = {
                                          ...updated[idx],
                                          color: e.target.value,
                                          size: '',
                                          imageUrl: colorObj?.image || updated[idx].imageUrl,
                                          price: colorObj?.sizes?.[0]?.price || prod?.basePrice || updated[idx].price,
                                        };
                                        setEditItems(updated);
                                      }}
                                      style={{ 
                                        width: '100%', 
                                        padding: '5px 8px', 
                                        border: editItems[idx]?.color ? '1px solid #ddd' : '2px solid #ef4444', 
                                        borderRadius: '6px', 
                                        fontSize: '13px' 
                                      }}
                                    >
                                      <option value="">-- Color --</option>
                                      {(allProducts.find(p => p.id === editItems[idx]?.productId)?.colors || []).map(c => (
                                        <option key={c.name} value={c.name}>{c.name}</option>
                                      ))}
                                    </select>
                                  </div>
                                  {/* Size dropdown */}
                                  <div style={{ flex: 1, minWidth: '80px' }}>
                                    <label style={{ fontSize: '11px', color: '#555', display: 'block' }}>Size</label>
                                    <select
                                      value={editItems[idx]?.size || ''}
                                      onChange={e => {
                                        const prod = allProducts.find(p => p.id === editItems[idx]?.productId);
                                        const colorObj = prod?.colors?.find(c => c.name === editItems[idx]?.color);
                                        const sizeObj = colorObj?.sizes?.find(s => s.size === e.target.value);
                                        const updated = [...editItems];
                                        updated[idx] = {
                                          ...updated[idx],
                                          size: e.target.value,
                                          sizeVariantId: sizeObj?.sizeVariantId || '',
                                          price: sizeObj?.price || prod?.basePrice || updated[idx].price,
                                        };
                                        setEditItems(updated);
                                      }}
                                      style={{ 
                                        width: '100%', 
                                        padding: '5px 8px', 
                                        border: editItems[idx]?.size ? '1px solid #ddd' : '2px solid #ef4444', 
                                        borderRadius: '6px', 
                                        fontSize: '13px' 
                                      }}
                                    >
                                      <option value="">-- Size --</option>
                                      {(allProducts.find(p => p.id === editItems[idx]?.productId)?.colors?.find(c => c.name === editItems[idx]?.color)?.sizes || []).map(s => (
                                        <option key={s.size} value={s.size}>{s.size}</option>
                                      ))}
                                    </select>
                                  </div>
                                  {/* Qty */}
                                  <div style={{ flex: '0 0 60px' }}>
                                    <label style={{ fontSize: '11px', color: '#555', display: 'block' }}>Qty</label>
                                    <input
                                      type="number"
                                      min="1"
                                      value={editItems[idx]?.quantity || ''}
                                      onChange={e => { const updated = [...editItems]; updated[idx] = { ...updated[idx], quantity: parseInt(e.target.value) || 1 }; setEditItems(updated); }}
                                      style={{ 
                                        width: '100%', 
                                        padding: '5px 8px', 
                                        border: (editItems[idx]?.quantity && editItems[idx]?.quantity > 0) ? '1px solid #ddd' : '2px solid #ef4444', 
                                        borderRadius: '6px', 
                                        fontSize: '13px' 
                                      }}
                                    />
                                  </div>
                                  {/* Price */}
                                  <div style={{ flex: '0 0 80px' }}>
                                    <label style={{ fontSize: '11px', color: '#555', display: 'block' }}>Price</label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={editItems[idx]?.price || ''}
                                      readOnly
                                      style={{ 
                                        width: '100%', 
                                        padding: '5px 8px', 
                                        border: '1px solid #ddd', 
                                        borderRadius: '6px', 
                                        fontSize: '13px',
                                        backgroundColor: '#f3f4f6',
                                        cursor: 'not-allowed'
                                      }}
                                    />
                                  </div>
                                </div>
                                {/* Remove button in edit mode */}
                                <button
                                  onClick={() => {
                                    if (window.confirm('Remove this item from the order?')) {
                                      const updated = editItems.filter((_, i) => i !== idx);
                                      setEditItems(updated);
                                      toast.success('Item removed');
                                    }
                                  }}
                                  style={{ marginTop: '4px', padding: '4px 10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', alignSelf: 'flex-start' }}
                                >
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <>
                                <p>Size: {item.size}, Color: {item.color}</p>
                                {item.sizeVariantId && (
                                  <p style={{ fontSize: '14px', color: '#111', fontFamily: 'monospace', background: '#fef3c7', padding: '4px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '4px' }}>
                                    Variant ID: <strong style={{ fontWeight: '900', fontSize: '16px' }}>{item.sizeVariantId}</strong>
                                  </p>
                                )}
                                <p>Qty: {item.quantity} × ₹{item.price}</p>
                                {selectedOrder.status !== 'Delivered' && selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Abandoned' && (
                                  <button
                                    onClick={async () => {
                                      if (!window.confirm('Remove this item? Stock will be restored and subtotal updated.')) return;
                                      try {
                                        const updated = await removeOrderItem(selectedOrder.id, item.id);
                                        setSelectedOrder(updated);
                                        await fetchOrders();
                                        toast.success('Item removed and subtotal updated');
                                      } catch (e) {
                                        toast.error('Failed to remove item');
                                      }
                                    }}
                                    style={{ marginTop: '6px', padding: '4px 10px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                                  >
                                    Remove
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%' }}>
            <div className="modal-header">
              <h2>Update Order Status - #ORD-{selectedOrder.id}</h2>
              <button onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '30px' }}>
             <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
  {/* Status dropdown */}
  <div style={{ flex: '0 0 200px' }}>
    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>Status</label>
    <select
      value={newStatus}
      onChange={(e) => {
        const status = e.target.value;
        setNewStatus(status);
        if (status === 'Delivered') {
          const isOnline = selectedOrder.paymentMethod?.toLowerCase() !== 'cod';
          const isCOD = selectedOrder.paymentMethod?.toLowerCase() === 'cod';
          
          if (isOnline) {
            // Online payment: 2.36% commission (2% + 18% GST)
            const calculatedCharge = (parseFloat(selectedOrder.total || 0) * 0.0236).toFixed(2);
            setCodCharge(calculatedCharge);
          } else if (isCOD) {
            // COD payment: 1.6% commission
            const calculatedCharge = (parseFloat(selectedOrder.total || 0) * 0.016).toFixed(2);
            setCodCharge(calculatedCharge);
          }
        }
      }}
      style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
    >
      <option value="Placed">Placed</option>
      <option value="Accepted">Accepted</option>
      <option value="Shipped">Shipped</option>
      <option value="Delivered">Delivered</option>
      <option value="Cancelled">Cancelled</option>
      {selectedOrder.paymentMethod?.toLowerCase() === 'cod' && (
        <option value="CODReturn">COD Return</option>
      )}
    </select>
  </div>

 {/* Shipped block - shows Weight and Courier Charge */}
{newStatus === 'Shipped' && (
  <div style={{ flex: '1', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
      📄 Invoice and package slip will be automatically generated and uploaded.
    </p>
    {selectedOrder?.trackingId ? (
      <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#e6f4ea', borderRadius: '6px', border: '1px solid #ceead6' }}>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#137333' }}><strong>✓ Automatically Synced via Shiprocket</strong></p>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}><strong>Courier:</strong> {selectedOrder.courierName || 'Shiprocket'}</p>
        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}><strong>Tracking ID:</strong> {selectedOrder.trackingId}</p>
        {selectedOrder.trackingLink && (
          <p style={{ margin: '0', fontSize: '14px', color: '#333' }}>
            <strong>Tracking Link:</strong> <a href={selectedOrder.trackingLink} target="_blank" rel="noopener noreferrer" style={{ color: '#1a73e8', textDecoration: 'none' }}>Click here to track</a>
          </p>
        )}
      </div>
    ) : (
      <>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Courier Partner</label>
          <select
            value={courierName}
            onChange={(e) => {
              const selected = courierPartners.find(p => p.name === e.target.value);
              setCourierName(e.target.value);
              if (selected?.trackingLink) setTrackingLink(selected.trackingLink);
              else setTrackingLink('');
            }}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
          >
            <option value="">-- Select Courier --</option>
            {courierPartners.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
            <option value="__manual__">Other (Manual)</option>
          </select>
        </div>
        {courierName === '__manual__' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Courier Name</label>
            <input
              type="text"
              value={courierName === '__manual__' ? '' : courierName}
              onChange={(e) => setCourierName(e.target.value)}
              placeholder="Enter courier name"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>
        )}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Tracking ID</label>
          <input
            type="text"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Tracking Link</label>
          <input
            type="text"
            value={trackingLink}
            onChange={(e) => setTrackingLink(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px' }}
          />
        </div>
      </>
    )}
    
    {/* Two fields for Shipped: Weight and Courier Charge */}
    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Charged Weigh (Optional)</label>
        <input
          type="number"
          step="0.01"
          value={chargedWeight}
          onChange={(e) => setChargedWeight(e.target.value)}
          placeholder="0.00 g"
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Courier Charge (Optional)</label>
        <input
          type="number"
          value={courierCharge}
          onChange={(e) => setCourierCharge(e.target.value)}
          placeholder="₹0.00"
          style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  </div>
)}

{/* Delivered block - shows ONLY COD Charge field */}
{newStatus === 'Delivered' && (
  <div style={{ flex: '1', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#166534', fontStyle: 'italic' }}>
      Order will be marked as <strong>Delivered</strong>. You can add COD/online commission if applicable.
    </p>
    
    <div>
      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#166534' }}>COD/online commission (Optional)</label>
      <input
        type="number"
        value={codCharge}
        onChange={(e) => setCodCharge(e.target.value)}
        placeholder="₹0.00"
        style={{ width: '100%', padding: '10px', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
      />
    </div>
  </div>
)}
  {/* Cancelled block */}
  {/* Cancelled block */}
{newStatus === 'Cancelled' && (
  <div
    style={{
      flex: '1',
      padding: '20px',
      backgroundColor: '#fef2f2',
      borderRadius: '8px',
      border: '1px solid #fecaca',
    }}
  >
    <p
      style={{
        margin: '0 0 12px 0',
        fontSize: '13px',
        color: '#7f1d1d',
        fontStyle: 'italic',
      }}
    >
      This order will be marked as <strong>Cancelled</strong>. Please enter a clear reason for reference.
    </p>

    <label
      style={{
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#991b1b',
      }}
    >
      Cancellation Remarks
    </label>
    <textarea
      value={cancelRemarks}
      onChange={(e) => setCancelRemarks(e.target.value)}
      style={{
        width: '100%',
        minHeight: '110px',
        padding: '10px',
        border: '1px solid #fecaca',
        borderRadius: '6px',
        fontSize: '14px',
        boxSizing: 'border-box',
        outline: 'none',
        resize: 'vertical',
        backgroundColor: '#fff7f7',
        color: '#111827',
      }}
    />

    {/* Cost fields for Cancelled shipments */}
    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#991b1b' }}>Weight (g)</label>
        <input
          type="number"
          step="0.01"
          value={chargedWeight}
          onChange={(e) => setChargedWeight(e.target.value)}
          placeholder="0.00 g"
          style={{ width: '100%', padding: '10px', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500', color: '#991b1b' }}>Courier Charge</label>
        <input
          type="number"
          value={courierCharge}
          onChange={(e) => setCourierCharge(e.target.value)}
          placeholder="₹0.00"
          style={{ width: '100%', padding: '10px', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  </div>
)}

{/* COD Return block */}
{newStatus === 'CODReturn' && (
  <div
    style={{
      flex: '1',
      padding: '20px',
      backgroundColor: '#fef3c7',
      borderRadius: '8px',
      border: '1px solid #fde68a',
    }}
  >
    <p
      style={{
        margin: '0 0 12px 0',
        fontSize: '13px',
        color: '#78350f',
        fontStyle: 'italic',
      }}
    >
      This order will be marked as <strong>COD Return</strong>. Please enter the reason for the return.
    </p>

    <label
      style={{
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#92400e',
      }}
    >
      COD Return Reason
    </label>
    <textarea
      value={codReturnRemarks}
      onChange={(e) => setCodReturnRemarks(e.target.value)}
      style={{
        width: '100%',
        minHeight: '110px',
        padding: '10px',
        border: '1px solid #fde68a',
        borderRadius: '6px',
        fontSize: '14px',
        boxSizing: 'border-box',
        outline: 'none',
        resize: 'vertical',
        backgroundColor: '#fffbeb',
        color: '#111827',
      }}
    />
  </div>
)}

  {/* Update button */}
  <div style={{ flex: '0 0 150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <button
      className="btn btn-primary"
      onClick={handleUpdateStatus}
      disabled={uploading}
      style={{ width: '100%', padding: '15px 20px', marginTop: '20px', fontSize: '14px', fontWeight: '600', borderRadius: '6px', border: 'none', backgroundColor: '#4169E1', color: 'white', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}
    >
      {uploading ? 'Uploading...' : 'Update Status'}
    </button>
  </div>
</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersList;



