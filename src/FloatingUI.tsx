import * as React from 'react'
import * as vscode from 'vscode'

type MessageEvent = any

interface FloatingUIProps {
  output: string
  window: any
}

export const FloatingUI: React.FC<FloatingUIProps> = ({ output, window }) => {
  const [reviewOutput, setReviewOutput] = React.useState(output)

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      switch (message.command) {
        case 'updateOutput':
          setReviewOutput(message.content)
          break
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        backgroundColor: 'white',
        padding: '1rem',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        borderRadius: '5px'
      }}
    >
      <h3>GPT-3.5 代码评价：</h3>
      <pre>{reviewOutput}</pre>
    </div>
  )
}
