import React, { useState, useEffect } from 'react';
import { Upload, Save } from 'lucide-react';
import { uploadFile } from '../api/order';
import API_BASE_URL from '../api/config';
import { toast } from 'react-toastify';

const Settings = () => {
  const [signatureUrl, setSignatureUrl] = useState('');
  const [codShippingCharge, setCodShippingCharge] = useState(0);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('');
  const [freeShippingCodThreshold, setFreeShippingCodThreshold] = useState('');
  const [freeShippingOnlineDeliveryFee, setFreeShippingOnlineDeliveryFee] = useState(false);
  const [freeShippingOnlineCodFee, setFreeShippingOnlineCodFee] = useState(false);
  const [freeShippingCombinedDeliveryFee, setFreeShippingCombinedDeliveryFee] = useState(false);
  const [freeShippingCombinedCodFee, setFreeShippingCombinedCodFee] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      const data = await response.json();
      if (data.signatureUrl) {
        setSignatureUrl(data.signatureUrl);
        setPreviewUrl(data.signatureUrl);
      }
      if (data.codShippingCharge !== undefined) {
        setCodShippingCharge(data.codShippingCharge);
      }
      if (data.freeShippingThreshold !== undefined) {
        setFreeShippingThreshold(data.freeShippingThreshold);
      }
      if (data.freeShippingCodThreshold !== undefined) {
        setFreeShippingCodThreshold(data.freeShippingCodThreshold);
      }
      if (data.freeShippingOnlineDeliveryFee !== undefined) {
        setFreeShippingOnlineDeliveryFee(data.freeShippingOnlineDeliveryFee);
      }
      if (data.freeShippingOnlineCodFee !== undefined) {
        setFreeShippingOnlineCodFee(data.freeShippingOnlineCodFee);
      }
      if (data.freeShippingCombinedDeliveryFee !== undefined) {
        setFreeShippingCombinedDeliveryFee(data.freeShippingCombinedDeliveryFee);
      }
      if (data.freeShippingCombinedCodFee !== undefined) {
        setFreeShippingCombinedCodFee(data.freeShippingCombinedCodFee);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadFile(file);
      setSignatureUrl(result.url);
      setPreviewUrl(result.url);
    } catch (error) {
      toast.error('Failed to upload signature');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          signatureUrl,
          codShippingCharge: parseFloat(codShippingCharge) || 0,
          freeShippingThreshold: parseFloat(freeShippingThreshold) || 0,
          freeShippingCodThreshold: parseFloat(freeShippingCodThreshold) || 0,
          freeShippingOnlineDeliveryFee: Boolean(freeShippingOnlineDeliveryFee),
          freeShippingOnlineCodFee: Boolean(freeShippingOnlineCodFee),
          freeShippingCombinedDeliveryFee: Boolean(freeShippingCombinedDeliveryFee),
          freeShippingCombinedCodFee: Boolean(freeShippingCombinedCodFee)
        })
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your application settings</p>
      </div>

      <div className="settings-content">
        <div className="settings-card">
          <h3>Invoice Signature</h3>
          <p className="settings-description">Upload signature image to appear on invoices</p>
          
          <div className="signature-upload">
            <input
              type="file"
              id="signature-upload"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="signature-upload" className="upload-btn">
              <Upload size={20} />
              {uploading ? 'Uploading...' : 'Upload Signature'}
            </label>

            {previewUrl && (
              <div className="signature-preview">
                <img src={previewUrl} alt="Signature" />
              </div>
            )}
          </div>
        </div>

        <div className="settings-card" style={{ marginTop: '24px' }}>
          <h3>COD Settings</h3>
          <p className="settings-description">Manage Cash on Delivery options</p>
          
          <div className="cod-settings-field" style={{ marginBottom: '20px' }}>
            <label htmlFor="cod-charge" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              COD Shipping Charge (Additional)
            </label>
            <input
              type="number"
              id="cod-charge"
              className="form-control"
              value={codShippingCharge}
              onChange={(e) => setCodShippingCharge(e.target.value)}
              placeholder="Enter amount (e.g. 50)"
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', width: '200px' }}
            />
          </div>

          <button 
            className="btn btn-primary save-btn" 
            onClick={handleSave}
          >
            <Save size={20} />
            Save Settings
          </button>
        </div>

        <div className="settings-card" id="free-shipping-settings-card" style={{ marginTop: '24px' }}>
          <h3>Free Shipping Settings</h3>
          <p className="settings-description">Configure free shipping threshold and waived fees</p>
          
          <div className="free-shipping-field" style={{ marginBottom: '20px' }}>
            <label htmlFor="free-shipping-threshold" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Free Shipping Above Subtotal (Online Payment)
            </label>
            <input
              type="number"
              id="free-shipping-threshold"
              className="form-control"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', width: '200px' }}
            />
            <span style={{ display: 'block', fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Minimum cart subtotal required to activate free shipping for online payments (subtotal &ge; threshold)
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  id="free-shipping-online-delivery-fee"
                  checked={freeShippingOnlineDeliveryFee}
                  onChange={(e) => setFreeShippingOnlineDeliveryFee(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Delivery Fee
              </label>
              {/* <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  id="free-shipping-online-cod-fee"
                  checked={freeShippingOnlineCodFee}
                  onChange={(e) => setFreeShippingOnlineCodFee(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                COD Charge
              </label> */}
            </div>
          </div>

          <div className="free-shipping-field" style={{ marginBottom: '20px' }}>
            <label htmlFor="free-shipping-cod-threshold" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Free Shipping Above Subtotal (Online Payment + COD)
            </label>
            <input
              type="number"
              id="free-shipping-cod-threshold"
              className="form-control"
              value={freeShippingCodThreshold}
              onChange={(e) => setFreeShippingCodThreshold(e.target.value)}
             
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', width: '200px' }}
            />
            <span style={{ display: 'block', fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Free shipping activates for COD orders above this amount, and also applies to online payments once the subtotal crosses it
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  id="free-shipping-combined-delivery-fee"
                  checked={freeShippingCombinedDeliveryFee}
                  onChange={(e) => setFreeShippingCombinedDeliveryFee(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Delivery Fee
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  id="free-shipping-combined-cod-fee"
                  checked={freeShippingCombinedCodFee}
                  onChange={(e) => setFreeShippingCombinedCodFee(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                COD Charge
              </label>
            </div>
          </div>

          <button 
            className="btn btn-primary save-btn" 
            onClick={handleSave}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <Save size={20} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
