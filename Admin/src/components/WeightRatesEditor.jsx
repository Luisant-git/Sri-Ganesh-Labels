import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

const styles = {
  wrapper: {
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '12px',
    maxWidth: '420px'
  },
  headerRow: {
    display: 'grid',
    gridTemplateColumns: '150px 150px 36px',
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
    gridTemplateColumns: '150px 150px 36px',
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

const buildWeightRates = (rows) => {
  const cleaned = rows
    .map((r) => ({ weightKg: parseFloat(r.weightKg), rate: parseFloat(r.rate) }))
    .filter((r) => !isNaN(r.weightKg) && r.weightKg > 0 && !isNaN(r.rate) && r.rate >= 0)

  const seen = new Set()
  const sorted = []
  for (const r of cleaned.sort((a, b) => a.weightKg - b.weightKg)) {
    if (seen.has(r.weightKg)) continue
    seen.add(r.weightKg)
    sorted.push(r)
  }
  return sorted
}

const WeightRatesEditor = ({ rows = [], onChange }) => {
  const updateRow = (index, field, value) => {
    onChange(rows.map((r, i) => (i === index ? { ...r, [field]: value } : r)))
  }

  const removeRow = (index) => {
    onChange(rows.filter((_, i) => i !== index))
  }

  const addRow = () => {
    onChange([...rows, { weightKg: '', rate: '' }])
  }

  return (
    <div>
      <p style={{ margin: '0 0 14px', fontSize: '13px', lineHeight: 1.5, color: '#6b7280' }}>
        Shipping by total cart weight — e.g. Up to 1 kg = ₹30. If empty, the Flat Rate applies.
      </p>

      {rows.length > 0 && (
        <div style={styles.wrapper}>
          <div style={styles.headerRow}>
            <span>Up to Weight (kg)</span>
            <span>Shipping Rate (₹)</span>
            <span />
          </div>
          {rows.map((row, index) => (
            <div key={index} style={styles.row}>
              <input
                type="number"
                style={styles.input}
                min="0.01"
                step="0.01"
                value={row.weightKg}
                onChange={(e) => updateRow(index, 'weightKg', e.target.value)}
                placeholder="1"
                aria-label="Weight in kg"
              />
              <input
                type="number"
                style={styles.input}
                min="0"
                step="0.01"
                value={row.rate}
                onChange={(e) => updateRow(index, 'rate', e.target.value)}
                placeholder="30.00"
                aria-label="Shipping rate"
              />
              <button
                type="button"
                style={styles.removeBtn}
                onClick={() => removeRow(index)}
                title="Remove this row"
                aria-label="Remove weight rate"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="button" style={styles.addBtn} onClick={addRow}>
        <Plus size={16} />
        {rows.length === 0 ? 'Add Weight Rate' : 'Add Another Weight'}
      </button>
    </div>
  )
}

export default WeightRatesEditor
export { buildWeightRates }
