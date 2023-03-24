// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import axios from 'axios'

const webviewContentSecurityPolicy = `
  default-src 'none';
  img-src vscode-resource: https:;
  script-src 'nonce-23ls9dj34r';
  style-src vscode-resource: https:;
`

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vscode-angel" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  // 创建命令，当用户运行命令时将显示悬浮UI
  const disposable = vscode.commands.registerCommand('yourExtensionName.showFloatingUI', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World from vscode-angel!') // todo:

    const panel = vscode.window.createWebviewPanel(
      'floatingUI',
      'Floating UI',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true, // 保持UI状态，即使面板不可见
        localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')] // Webview允许访问的资源路径
      }
    )

    // Set the initial HTML content for the WebView
    panel.webview.html = getWebViewContent(panel.webview, context)

    // Handle messages from the WebView
    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'output':
            vscode.window.showInformationMessage(message.text)
            break
        }
      },
      undefined,
      context.subscriptions
    )
  })

  context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() { }

// ... 其他代码 ...

function getNonce() {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

function getWebViewContent(webview: vscode.Webview, context: vscode.ExtensionContext) {
  const nonce = getNonce()

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="${webviewContentSecurityPolicy.replace(
    '<NOUNCE_VALUE>',
    nonce
  )}">
  <title>Floating UI</title>
  </head>
  <body>
    <h1>Floating UI</h1>
    <input id="inputText"
    type="text" placeholder="Enter text here">
    <button id="sendButton">Send</button>

    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();

        document.getElementById('sendButton').addEventListener('click', () => {
            const inputText = document.getElementById('inputText').value;
            vscode.postMessage({
                command: 'output',
                text: inputText
            });
        });
    </script>
  </body>
  </html>
`
}
