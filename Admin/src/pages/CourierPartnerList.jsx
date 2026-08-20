import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';
import { getCourierPartners, createCourierPartner, updateCourierPartner, deleteCourierPartner } from '../api/courierPartnerApi';
import { toast } from 'react-toastify';

const CourierPartnerList = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', trackingLink: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchPartners(); }, []);

  const fetchPartners = async () => {
    try {
      const data = await getCourierPartners();
      setPartners(data);
    } catch {
      toast.error('Failed to load courier partners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Courier name is required');
    try {
      setSaving(true);
      if (editingId) {
        await updateCourierPartner(editingId, form);
        toast.success('Courier partner updated');
      } else {
        await createCourierPartner(form);
        toast.success('Courier partner created');
      }
      setForm({ name: '', trackingLink: '' });
      setShowForm(false);
      setEditingId(null);
      fetchPartners();
    } catch {
      toast.error('Failed to save courier partner');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (partner) => {
    setForm({ name: partner.name, trackingLink: partner.trackingLink || '' });
    setEditingId(partner.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this courier partner?')) return;
    try {
      await deleteCourierPartner(id);
      toast.success('Deleted');
      fetchPartners();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleCancel = () => {
    setForm({ name: '', trackingLink: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700 }}>Courier Partners</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>Manage courier partners for shipping</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', background: '#4169E1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
          >
            <Plus size={16} /> Add Courier Partner
          </button>
        )}
      </div>

      {showForm && (
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600 }}>
            {editingId ? 'Edit Courier Partner' : 'Add Courier Partner'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                  Courier Name <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Delhivery"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ flex: '2', minWidth: '280px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px', color: '#374151' }}>
                  Tracking Link
                </label>
                <input
                  type="text"
                  value={form.trackingLink}
                  onChange={e => setForm(p => ({ ...p, trackingLink: e.target.value }))}
                  placeholder="e.g. https://www.delhivery.com/track/package/{trackingId}"
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="submit"
                disabled={saving}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
              >
                <Check size={16} /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
              >
                <X size={16} /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
        {partners.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No courier partners added yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>#</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Courier Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Tracking Link</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#374151' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6b7280' }}>{i + 1}</td>
                  <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 600, color: '#111827' }}>{p.name}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#4b5563', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.trackingLink || <span style={{ color: '#9ca3af' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(p)} style={{ padding: '6px 10px', background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: '6px', cursor: 'pointer' }} title="Edit">
                        <Edit size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} style={{ padding: '6px 10px', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer' }} title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CourierPartnerList;
