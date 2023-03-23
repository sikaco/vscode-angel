// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {
  TextDocumentPositionParams,
  ReferenceParams,
  Location
} from 'vscode-languageserver-protocol'
import { LanguageClient } from 'vscode-languageclient'
import axios from 'axios'

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "vscode-angel" is now active!')

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('vscode-angel.helloWorld', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World from vscode-angel!')
  })

  context.subscriptions.push(disposable)
}

// This method is called when your extension is deactivated
export function deactivate() { }

// ... 其他代码 ...

const getClient = (document: vscode.TextDocument) => {
  const client = new LanguageClient(
    'languageServerExample',
    'Language Server Example',
    serverOptions,
    clientOptions
  )

  return client
}

const getCurrentFunctionBlock = async (
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<string | null> => {
  const client = getClient(document)
  await client.onReady()

  const textDocument: TextDocumentPositionParams = {
    textDocument: client.code2ProtocolConverter.asTextDocumentIdentifier(document),
    position: client.code2ProtocolConverter.asPosition(position)
  }

  // 获取光标所在位置的引用
  const references = (await client.sendRequest<Location[]>(
    'textDocument/references',
    textDocument
  )) as vscode.Location[]

  if (!references || !references.length) {
    return null
  }

  const reference = references[0]
  const range = reference.range
  const functionBlock = document.getText(range)

  return functionBlock
}

const callGpt3Api = async (functionBlock: string, prompt: string): Promise<string> => {
  const input = `${prompt}\n${functionBlock}`
  const apiKey = 'your-gpt-3-api-key'

  const response = await axios.post(
    'https://api.openai.com/v1/engines/davinci-codex/completions',
    {
      prompt: input,
      max_tokens: 50, // 根据需要调整
      n: 1,
      stop: null,
      temperature: 0.5
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      }
    }
  )

  return response.data.choices[0].text.trim()
}
