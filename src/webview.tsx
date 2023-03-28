import * as path from 'path'
import * as fs from 'fs'

import * as React from 'react'
import * as vscode from 'vscode'

export function createWebView(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'gpt3Review',
    'GPT-3.5 代码评价',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true
    }
  )

  const html = getWebViewHtml(context.extensionPath)
  panel.webview.html = html

  panel.webview.onDidReceiveMessage(
    message => {
      switch (message.command) {
        case 'updateOutput':
          // panel.webview.postMessage({
          //   command: 'updateOutput',
          //   content: message.content
          // })
          console.log('gpt3Review: ', message.content)
          break
      }
    },
    undefined,
    context.subscriptions
  )

  return panel
}

function getWebViewHtml(extensionPath: string): string {
  const scriptPath = path.join(extensionPath, 'out', 'extension.js')
  const scriptUri = scriptPath.replace(/\\/g, '/')

  const html = `
    <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content = "width=device-width, initial-scale=1.0" />
          <title>GPT - 3.5 代码评价 </title>
        </head>
        <body><div id="root"></div>
          <script src="${scriptUri}"></script >
        </body>
    </html>
  `

  return html
}
