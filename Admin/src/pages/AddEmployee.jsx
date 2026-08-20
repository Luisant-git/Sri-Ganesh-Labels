import React, { useState, useRef } from 'react';
import { X, Upload, User } from 'lucide-react';
import '../styles/pages/add-employee.scss'

// Reusable FormGroup component for inputs and selects
const FormGroup = ({ label, name, type = 'text', required = false, options = [], ...props }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>
        {label}
        {required && <span className="required-asterisk">*</span>}
      </label>
      {type === 'select' ? (
        <select id={name} name={name} className="form-input" required={required} {...props}>
          <option value="">- Select -</option>
          {options.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input type={type} id={name} name={name} className="form-input" required={required} {...props} />
      )}
    </div>
  );
};

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    employeeId: '',
    email: '',
    employeeType: '',
    employeeStatus: '',
    employeeEndDate: '',
    dateOfHire: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to handle form submission
    console.log('Submitting Employee Data:', { ...formData, profileImage });
    // Here you would typically send the data to your backend API
  };
  
  const employeeTypeOptions = [
    { value: 'full-time', label: 'Full-Time' },
    { value: 'part-time', label: 'Part-Time' },
    { value: 'contractor', label: 'Contractor' },
    { value: 'intern', label: 'Intern' },
  ];
  
  const employeeStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'on-leave', label: 'On Leave' },
    { value: 'terminated', label: 'Terminated' },
  ];


  return (
    <div className="add-employee-page">
      <div className="add-employee-modal">
        <header className="modal-header">
          <h2>New Employee</h2>
          <button className="close-btn">
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <main className="modal-body">
            <div className="image-upload-container">
              <div className="image-placeholder">
                {profileImage ? (
                  <img src={profileImage} alt="Profile Preview" className="profile-preview" />
                ) : (
                  <User size={64} color="#a0aec0" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button type="button" className="upload-btn" onClick={triggerFileSelect}>
                <Upload size={16} />
                Upload Photo
              </button>
            </div>

            <div className="form-fields-container">
              <div className="form-grid">
                <FormGroup label="First Name" name="firstName" required value={formData.firstName} onChange={handleInputChange} />
                <FormGroup label="Middle Name" name="middleName" value={formData.middleName} onChange={handleInputChange} />
                <FormGroup label="Last Name" name="lastName" required value={formData.lastName} onChange={handleInputChange} />
                <FormGroup label="Employee ID" name="employeeId" value={formData.employeeId} onChange={handleInputChange} />
                <FormGroup label="Email" name="email" type="email" required value={formData.email} onChange={handleInputChange} />
                <FormGroup label="Employee Type" name="employeeType" type="select" required options={employeeTypeOptions} value={formData.employeeType} onChange={handleInputChange} />
                <FormGroup label="Employee Status" name="employeeStatus" type="select" required options={employeeStatusOptions} value={formData.employeeStatus} onChange={handleInputChange} />
                <FormGroup label="Employee End Date" name="employeeEndDate" type="date" value={formData.employeeEndDate} onChange={handleInputChange} />
                <FormGroup label="Date of Hire" name="dateOfHire" type="date" required value={formData.dateOfHire} onChange={handleInputChange} />
              </div>
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="showAdvanced"
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                />
                <label htmlFor="showAdvanced">Show Advanced Fields</label>
              </div>
            </div>
          </main>

          <footer className="modal-footer">
            <button type="submit" className="submit-btn">
              Create Employee
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;