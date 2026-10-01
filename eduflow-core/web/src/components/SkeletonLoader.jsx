
/**
 * Reusable skeleton loader component with pulse animation.
 *
 * @param {{
 *   variant?: 'text' | 'card' | 'table',
 *   count?: number,
 *   height?: string | number
 * }} props
 */
export function SkeletonLoader({ variant = 'card', count = 1, height }) {
  const renderItem = (index) => {
    if (variant === 'text') {
      return (
        <div
          key={index}
          className="animate-pulse"
          style={{
            height: height || '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '6px',
            marginBottom: '10px',
            width: index % 2 === 0 ? '100%' : '75%',
          }}
        />
      )
    }

    if (variant === 'table') {
      return (
        <div
          key={index}
          className="animate-pulse"
          style={{
            display: 'flex',
            gap: '16px',
            padding: '12px 16px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '8px',
            marginBottom: '8px',
          }}
        >
          <div style={{ width: '25%', height: '14px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }} />
          <div style={{ width: '35%', height: '14px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }} />
          <div style={{ width: '20%', height: '14px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }} />
          <div style={{ width: '20%', height: '14px', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }} />
        </div>
      )
    }

    // Default 'card' variant
    return (
      <div
        key={index}
        className="animate-pulse"
        style={{
          height: height || '340px',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: '40%', height: '18px', backgroundColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '4px', marginBottom: '8px' }} />
            <div style={{ width: '60%', height: '12px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px' }} />
          </div>
        </div>
        <div style={{ width: '100%', height: '14px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px' }} />
        <div style={{ width: '90%', height: '14px', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '4px' }} />
        <div style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', marginTop: '8px' }} />
      </div>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => renderItem(i))}
    </div>
  )
}

export default SkeletonLoader
