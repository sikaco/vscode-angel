import * as path from 'path'
// import * as fs from 'fs'

// import * as React from 'react'
import * as vscode from 'vscode'

export function createWebView(context: vscode.ExtensionContext) {
  const panel = vscode.window.createWebviewPanel(
    'gpt3Review',
    '程序员鼓励大师',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
      retainContextWhenHidden: true, // 保持UI状态，即使面板不可见
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')] // Webview允许访问的资源路径
    }
  )

  const html = getWebViewHtml(context.extensionPath)
  panel.webview.html = html

  panel.webview.onDidReceiveMessage(
    message => {
      switch (message.command) {
        case 'updateOutput':
          vscode.window.showInformationMessage(message.content)
          console.log('propsprops', message)
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
          <title>GPT 魔法少女</title>
        </head>
        <body><div id="root"></div>
          <script src="${scriptUri}"></script >
          <script src="https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js"></script>
        </body>
    </html>
  `

  return html
}
