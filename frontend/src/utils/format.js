export function formatINR(value) {
  return '₹' + Number(value || 0).toLocaleString('en-IN')
}

export function formatINRDecimal(value) {
  return (
    '₹' +
    Number(value || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

export function generateOrderId() {
  return 'SGL' + Math.floor(100000 + Math.random() * 900000)
}

export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}