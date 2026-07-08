interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label: string
}

export default function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label
        style={{
          fontSize: '0.85rem',
          fontWeight: 600,
          color: '#4A2040',
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '50%',
            backgroundColor: value,
            border: '2px solid rgba(255, 143, 171, 0.3)',
            boxShadow: '0 2px 8px rgba(255, 143, 171, 0.15)',
            flexShrink: 0,
            transition: 'border-color 0.2s',
          }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            height: '2.75rem',
            padding: '0.25rem',
            borderRadius: '1rem',
            border: '1px solid rgba(255, 143, 171, 0.2)',
            background: 'rgba(255, 255, 255, 0.5)',
            cursor: 'pointer',
            outline: 'none',
          }}
          className="input-field"
        />
      </div>
    </div>
  )
}
