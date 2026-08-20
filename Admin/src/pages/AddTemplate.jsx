import React, { useState } from 'react'
import { ArrowLeft, Bold, Italic, Smile, HelpCircle, Package } from 'lucide-react'
import MobilePreview from '../components/MobilePreview'

const AddTemplate = () => {
  const [formData, setFormData] = useState({
    templateName: 'order_delivery_confirmation',
    category: 'Utility',
    language: 'English (en)',
    header: 'None',
    body: 'Hi {{1}}, your order #{{2}} has been delivered successfully! 🎉 Click the button below to download your invoice. Reply "HELP" for any questions.',
    variable1: 'Naveen',
    variable2: 'ORD9126',
    footer: 'Thanks for shopping with us!',
    isLto: true
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="add-template">
      <div className="page-header with-actions">
        <div className="header-left">
          <h1>Add Template</h1>
          <p>Create a new message template</p>
        </div>
        <button className="btn btn-outline">
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <div className="form-grid">
        <div className="form-section">
          <div className="section-header">
            <h3>Template Details</h3>
          </div>

          <div className="form-group">
            <label className="form-label">
              Template Name <span style={{color: '#ef4444'}}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              value={formData.templateName}
              onChange={(e) => handleInputChange('templateName', e.target.value)}
            />
            <div style={{textAlign: 'right', fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>
              27/512
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Category <span style={{color: '#ef4444'}}>*</span>
              </label>
              <select 
                className="form-select"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option>Utility</option>
                <option>Marketing</option>
                <option>Authentication</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Language <span style={{color: '#ef4444'}}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                value={formData.language}
                onChange={(e) => handleInputChange('language', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Header</label>
            <select 
              className="form-select"
              value={formData.header}
              onChange={(e) => handleInputChange('header', e.target.value)}
            >
              <option>None</option>
              <option>Text</option>
              <option>Media</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">
              Body <span style={{color: '#ef4444'}}>*</span>
            </label>
            <textarea
              className="form-textarea"
              value={formData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              rows={4}
            />
            <div style={{textAlign: 'right', fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>
              144/1024
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Variables Value</label>
            <div className="form-row">
              <div className="form-group">
                <label style={{fontSize: '12px', color: '#6b7280', marginBottom: '4px'}}>Variable 1</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.variable1}
                  onChange={(e) => handleInputChange('variable1', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label style={{fontSize: '12px', color: '#6b7280', marginBottom: '4px'}}>Variable 2</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.variable2}
                  onChange={(e) => handleInputChange('variable2', e.target.value)}
                  style={{background: '#dbeafe', borderColor: '#93c5fd'}}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Footer</label>
            <input
              type="text"
              className="form-input"
              value={formData.footer}
              onChange={(e) => handleInputChange('footer', e.target.value)}
            />
            <div style={{textAlign: 'right', fontSize: '12px', color: '#6b7280', marginTop: '4px'}}>
              28/60
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Preview</h3>
          </div>
          <MobilePreview formData={formData} />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline">
          Save as Draft
        </button>
        <button type="submit" className="btn btn-primary">
          Create Template
        </button>
      </div>
    </div>
  )
}

export default AddTemplate
