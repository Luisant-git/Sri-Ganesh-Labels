import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

const styles = {
  wrapper: {
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '12px',
    maxWidth: '520px'
  },
  headerRow: {
    display: 'grid',
    gridTemplateColumns: '80px 130px 140px 36px',
    gap: '10px',
    padding: '10px 14px',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '11px',
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '80px 130px 140px 36px',
    gap: '10px',
    padding: '10px 14px',
    alignItems: 'center',
    borderBottom: '1px solid #f3f4f6'
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s'
  },
  gstCell: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#059669',
    background: '#ecfdf5',
    border: '1px solid #a7f3d0',
    borderRadius: '8px',
    padding: '9px 12px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  gstCellEmpty: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#9ca3af',
    background: '#f9fafb',
    border: '1px dashed #d1d5db',
    borderRadius: '8px',
    padding: '9px 12px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  removeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    border: '1px solid #fecaca',
    background: '#fef2f2',
    color: '#dc2626',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    border: '1px dashed #93c5fd',
    background: '#eff6ff',
    color: '#1d4ed8',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s'
  }
}

const QuantityPricingEditor = ({ tiers = [], onChange, gstPercentage = 0 }) => {
  const updateTier = (index, field, value) => {
    onChange(tiers.map((t, i) => (i === index ? { ...t, [field]: value } : t)))
  }

  const removeTier = (index) => {
    onChange(tiers.filter((_, i) => i !== index))
  }

  const addTier = () => {
    onChange([...tiers, { quantity: '', price: '' }])
  }

  return (
    <div>
      <p style={{ margin: '0 0 14px', fontSize: '13px', lineHeight: 1.5, color: '#6b7280' }}>
        Enter the <strong>total price for that quantity</strong> — e.g. Qty 2 = ₹900 means the customer pays
        ₹900 for 2 pieces (₹450 each). The green column shows what the customer pays including GST.
        If empty, the main Rate applies to all quantities.
      </p>

      {tiers.length > 0 && (
        <div style={styles.wrapper}>
          <div style={styles.headerRow}>
            <span>Quantity</span>
            <span>Total Price (₹ excl. GST)</span>
            <span>Incl. GST Total</span>
            <span />
          </div>
          {tiers.map((tier, index) => {
            const rate = parseFloat(tier.price)
            const hasRate = !isNaN(rate) && rate > 0
            const inclGst = hasRate ? rate + (rate * (parseFloat(gstPercentage) || 0)) / 100 : 0
            return (
              <div key={index} style={styles.row}>
                <input
                  type="number"
                  style={styles.input}
                  min="1"
                  step="1"
                  value={tier.quantity}
                  onChange={(e) => updateTier(index, 'quantity', e.target.value)}
                  placeholder="1"
                  aria-label="Quantity"
                />
                <input
                  type="number"
                  style={styles.input}
                  min="0"
                  step="0.01"
                  value={tier.price}
                  onChange={(e) => updateTier(index, 'price', e.target.value)}
                  placeholder="499.00"
                  aria-label="Rate excluding GST"
                />
                <div style={hasRate ? styles.gstCell : styles.gstCellEmpty}>
                  {hasRate ? `₹${inclGst.toFixed(2)}` : 'Enter a rate'}
                </div>
                <button
                  type="button"
                  style={styles.removeBtn}
                  onClick={() => removeTier(index)}
                  title="Remove this tier"
                  aria-label="Remove tier"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <button type="button" style={styles.addBtn} onClick={addTier}>
        <Plus size={16} />
        {tiers.length === 0 ? 'Add Quantity Price' : 'Add Another Quantity'}
      </button>
    </div>
  )
}

export default QuantityPricingEditor
