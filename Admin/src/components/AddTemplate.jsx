import React, { useState } from 'react'
import { ArrowLeft, Bold, Italic, Smile, HelpCircle, Package } from 'lucide-react'
import MobilePreview from './MobilePreview'

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
      <div className="page-header">
        <div className="page-title">
          <Package size={24} />
          <h1>Add Template</h1>
        </div>
        <button className="back-btn">
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <div className="template-content">
        <div className="form-section">
          <div className="form-group">
            <label className="form-label">
              Template Name <span className="required">*</span>
            </label>
            <div className="input-with-counter">
              <input
                type="text"
                className="form-input"
                value={formData.templateName}
                onChange={(e) => handleInputChange('templateName', e.target.value)}
              />
              <span className="char-counter">27/512</span>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Category <span className="required">*</span>
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
                Language <span className="required">*</span>
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
            <label className="form-label">
              Header <span className="optional-badge">OPTIONAL</span>
            </label>
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
              Body <span className="required">*</span> <span className="optional-badge">OPTIONAL</span>
            </label>
            <div className="textarea-container">
              <textarea
                className="form-textarea"
                value={formData.body}
                onChange={(e) => handleInputChange('body', e.target.value)}
                rows={4}
              />
              <div className="textarea-toolbar">
                <div className="toolbar-left">
                  <button className="toolbar-btn"><Bold size={16} /></button>
                  <button className="toolbar-btn"><Italic size={16} /></button>
                  <button className="toolbar-btn"><Smile size={16} /></button>
                </div>
                <button className="toolbar-btn"><HelpCircle size={16} /></button>
              </div>
              <span className="char-counter">144/1024</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Variables Value</label>
            <div className="variables-row">
              <div className="variable-group">
                <label className="variable-label">Variable 1</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.variable1}
                  onChange={(e) => handleInputChange('variable1', e.target.value)}
                />
              </div>
              <div className="variable-group">
                <label className="variable-label">Variable 2</label>
                <input
                  type="text"
                  className="form-input variable-highlight"
                  value={formData.variable2}
                  onChange={(e) => handleInputChange('variable2', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Footer <span className="optional-badge">OPTIONAL</span>
            </label>
            <div className="input-with-counter">
              <input
                type="text"
                className="form-input"
                value={formData.footer}
                onChange={(e) => handleInputChange('footer', e.target.value)}
              />
              <span className="char-counter">28/60</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">IsLto</label>
            <div className="toggle-switch">
              <input
                type="checkbox"
                id="isLto"
                checked={formData.isLto}
                onChange={(e) => handleInputChange('isLto', e.target.checked)}
              />
              <label htmlFor="isLto" className="toggle-label"></label>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <MobilePreview formData={formData} />
        </div>
      </div>
    </div>
  )
}

export default AddTemplate
