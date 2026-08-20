import React from 'react'

const MobilePreview = ({ formData }) => {
  const formatMessage = (text, variable1, variable2) => {
    return text
      .replace('{{1}}', variable1)
      .replace('{{2}}', variable2)
  }

  return (
    <div style={{position: 'sticky', top: '24px'}}>
      <div style={{
        width: '300px',
        height: '600px',
        background: '#000',
        borderRadius: '24px',
        padding: '8px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
      }}>
        <div style={{
          background: '#1f2937',
          borderRadius: '16px 16px 0 0',
          padding: '8px 16px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            <span>7:41</span>
            <div style={{display: 'flex', gap: '4px'}}>
              <span>📶</span>
              <span>📶</span>
              <span>🔋</span>
            </div>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 0'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#dc2626',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '14px'
            }}>
              Q
            </div>
            <div>
              <h3 style={{color: 'white', fontSize: '14px', fontWeight: '600', margin: 0}}>
                Saravana & Co
              </h3>
            </div>
            <button style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}>
              ⋮
            </button>
          </div>
        </div>

        <div style={{
          background: '#f3f4f6',
          height: 'calc(100% - 120px)',
          padding: '16px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              fontSize: '13px',
              lineHeight: '1.4',
              color: '#374151',
              marginBottom: '8px'
            }}>
              {formatMessage(formData.body, formData.variable1, formData.variable2)}
            </div>
            {formData.footer && (
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                {formData.footer}
              </div>
            )}
          </div>
        </div>

        <div style={{
          height: '32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            width: '120px',
            height: '4px',
            background: '#374151',
            borderRadius: '2px'
          }}></div>
        </div>
      </div>
    </div>
  )
}

export default MobilePreview
