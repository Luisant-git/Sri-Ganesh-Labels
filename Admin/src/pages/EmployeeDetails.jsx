import React, { useState } from 'react'
import { Search, Filter, Eye, Edit, Trash2, UserPlus, Phone, Mail, MapPin } from 'lucide-react'
import DataTable from '../components/DataTable'
import '../styles/pages/employee-details.scss'
import { useNavigate } from 'react-router-dom';


const EmployeeDetails = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('all')


  const navigate = useNavigate();

  const employees = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+91 9876543210',
      department: 'Sales',
      position: 'Sales Manager',
      joinDate: '2023-01-15',
      status: 'active',
      location: 'Mumbai'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      phone: '+91 9876543211',
      department: 'Marketing',
      position: 'Marketing Executive',
      joinDate: '2023-03-20',
      status: 'active',
      location: 'Delhi'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      phone: '+91 9876543212',
      department: 'IT',
      position: 'Software Developer',
      joinDate: '2023-02-10',
      status: 'active',
      location: 'Bangalore'
    },
    {
      id: 4,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      phone: '+91 9876543213',
      department: 'HR',
      position: 'HR Executive',
      joinDate: '2023-04-05',
      status: 'inactive',
      location: 'Chennai'
    }
  ]

  const columns = [
    {
      key: 'name',
      label: 'Employee',
      render: (value, row) => (
        <div className="employee-profile">
          <div className="employee-avatar">
            {value.charAt(0).toUpperCase()}
          </div>
          <div className="employee-details">
            <div className="employee-name">{value}</div>
            <div className="employee-position">{row.position}</div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Contact',
      render: (value, row) => (
        <div className="contact-info">
          <div className="email">
            <Mail size={14} />
            {value}
          </div>
          <div className="phone">
            <Phone size={14} />
            {row.phone}
          </div>
        </div>
      )
    },
    { key: 'department', label: 'Department' },
    {
      key: 'location',
      label: 'Location',
      render: (value) => (
        <div className="location">
          <MapPin size={14} />
          {value}
        </div>
      )
    },
    { key: 'joinDate', label: 'Join Date' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`employee-status ${value}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="action-buttons">
          <button className="action-btn view" title="View Profile">
            <Eye size={16} />
          </button>
          <button className="action-btn edit" title="Edit Employee">
            <Edit size={16} />
          </button>
          <button className="action-btn delete" title="Delete Employee">
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="employee-details">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Employee Details</h1>
          <p>Manage your team members</p>
        </div>
         <button 
      className="btn btn-primary"
      onClick={() => navigate('/add-employee')}
    >
      <UserPlus size={20} />
      Add Employee
    </button>
      </div>

      <div className="employee-stats">
        <div className="stat-card">
          <div className="stat-content">
            <h3>24</h3>
            <p>Total Employees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>22</h3>
            <p>Active Employees</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>5</h3>
            <p>Departments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-content">
            <h3>3</h3>
            <p>New This Month</p>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Departments</option>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="it">IT</option>
            <option value="hr">HR</option>
            <option value="finance">Finance</option>
          </select>

          <button className="btn btn-outline">
            <Filter size={20} />
            More Filters
          </button>
        </div>
      </div>

      <div className="table-container">
        <DataTable
          data={employees}
          columns={columns}
          searchTerm={searchTerm}
          searchKey="name"
        />
      </div>
    </div>
  )
}

export default EmployeeDetails
