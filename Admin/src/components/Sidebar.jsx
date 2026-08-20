import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Users, FileText, Warehouse, Settings, ChevronDown, ChevronRight, BarChart3, Eye, Plus, List, Gift, Tag, Image, Percent, MapPin, Star, TrendingUp, UserPlus, Menu, X,FolderKanban,TicketPercent, Layers, MessageCircle, Truck} from 'lucide-react'

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const [expandedItems, setExpandedItems] = useState({})
  const location = useLocation()

  const toggleExpanded = (key) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const menuItems = [
    {
      key: 'dashboards',
      icon: LayoutDashboard,
      label: 'Dashboards',
      children: [
        { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        // { key: 'analytics', icon: BarChart3, label: 'Analytics', path: '/analytics' },
        { key: 'overview', icon: Eye, label: 'Overview', path: '/overview' }
      ]
    },
    {
      key: 'master',
      icon: Package,
      label: 'Master',
      children: [
        { key: 'add-product', icon: Plus, label: 'Add Product', path: '/add-product' },
        { key: 'product-list', icon: List, label: 'Product List', path: '/product-list' },
        // { key: 'combo-offers', icon: Gift, label: 'Combo Offers', path: '/combo-offers' },
       { key: 'brand-list', icon: Tag, label: 'Brands', path: '/brand-list' },
  { key: 'category-list', icon: FolderKanban, label: 'Categories', path: '/category-list' },
  { key: 'subcategory-list', icon: Layers, label: 'Sub Categories', path: '/subcategory-list' },
  { key: 'banner-list', icon: Image, label: 'Banners', path: '/banner-list' },
  { key: 'coupon-list', icon: TicketPercent, label: 'Coupons', path: '/coupon-list' },
  { key: 'shipping-settings', icon: Warehouse, label: 'Shipping Settings', path: '/shipping-settings' },
  { key: 'courier-partners', icon: Truck, label: 'Courier Partners', path: '/courier-partners' },
  // { key: 'pincode-list', icon: MapPin, label: 'Pincodes', path: '/pincode-list' },
      ]
    },
    {
      key: 'orders',
      icon: ShoppingCart,
      label: 'Orders List',
      path: '/orders'
    },
    // {
    //   key: 'whatsapp',
    //   icon: MessageCircle,
    //   label: 'WhatsApp',
    //   children: [
    //     { key: 'whatsapp-chat', icon: MessageCircle, label: 'WhatsApp Chat', path: '/whatsapp-chat' },
    //     { key: 'bulk-whatsapp', icon: MessageCircle, label: 'Bulk WhatsApp', path: '/bulk-whatsapp' }
    //   ]
    // },
    {
      key: 'customers',
      icon: Users,
      label: 'Customers',
      children: [
        { key: 'customer-list', icon: List, label: 'Customer List', path: '/customer-list' }
      ]
    },
    {
  key: 'reports',
  icon: FileText,
  label: 'Reports',
  children: [
    { key: 'sales-reports', icon: BarChart3, label: 'Sales Reports', path: '/reports' },
    { key: 'product-report', icon: Package, label: 'Product Sales Report', path: '/product-report' }
  ]
},
    {
      key: 'settings',
      icon: Settings,
      label: 'Settings',
      path: '/settings'
    }
  ]

  const renderMenuItem = (item) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems[item.key]
    const Icon = item.icon
    const isActive = location.pathname === item.path

    return (
      <div key={item.key} className="menu-item">
        {hasChildren ? (
          <div 
            className={`menu-item-header ${isActive ? 'active' : ''}`}
            onClick={() => toggleExpanded(item.key)}
          >
            <Icon size={20} />
            {!collapsed && (
              <>
                <span className="menu-label">{item.label}</span>
                <div className="expand-icon">
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </div>
              </>
            )}
          </div>
        ) : (
          <Link 
            to={item.path}
            className={`menu-item-header ${isActive ? 'active' : ''}`}
          >
            <Icon size={20} />
            {!collapsed && <span className="menu-label">{item.label}</span>}
          </Link>
        )}
        
        {hasChildren && isExpanded && !collapsed && (
          <div className="submenu">
            {item.children.map(child => {
              const ChildIcon = child.icon
              const isChildActive = location.pathname === child.path
              return (
                <Link 
                  key={child.key}
                  to={child.path}
                  className={`submenu-item ${isChildActive ? 'active' : ''}`}
                >
                  <ChildIcon size={16} />
                  <span>{child.label}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {mobileOpen && <div className="mobile-overlay show" onClick={() => setMobileOpen(false)} />}
      <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div 
            className="logo"
            onClick={() => setCollapsed(!collapsed)}
          >
            <div className="logo-icon">A</div>
            {!collapsed && <span className="logo-text">Admin Panel</span>}
          </div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        
        <nav className="sidebar-nav">
          {menuItems.map(renderMenuItem)}
        </nav>
      </div>
    </>
  )
}

export default Sidebar
