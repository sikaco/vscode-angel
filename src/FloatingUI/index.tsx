import * as React from 'react'

interface FloatingUIProps {
  result: string
}

const FloatingUI: React.FC<FloatingUIProps> = ({ result }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        zIndex: 9999,
        background: 'white',
        padding: '10px'
      }}
    >
      <h4>代码评价:</h4>
      <pre>{result}</pre>
    </div>
  )
}

export default FloatingUI
