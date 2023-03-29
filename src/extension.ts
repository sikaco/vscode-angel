// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'
import * as _ from 'lodash'
import * as acorn from 'acorn'
import * as tsParser from '@typescript-eslint/parser'
import { Configuration, CreateCompletionRequest, OpenAIApi } from 'openai'

import { createWebView } from './webview'

async function checkCode(webView: vscode.WebviewPanel) {
  const activeEditor = vscode.window.activeTextEditor
  if (!activeEditor) {
    return
  }
  const functionName = getCurrentFunctionName(activeEditor)
  if (!functionName) {
    return
  }

  const code = getFunctionCode(activeEditor, functionName)
  // console.log('propsprops', code)

  const gpt3Review = await getGPT3Review(code)
  // const gpt3Review = Math.random() * 100000

  webView.webview.postMessage({
    command: 'updateOutput',
    content: gpt3Review
  })
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // eslint-disable-next-line no-console
  console.info('Congratulations, your extension "vscode-angel" is now active!')

  const webView = createWebView(context)

  // setInterval(async () => {
  //   checkCode(webView)
  // }, 10000)

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('vscode-angel.helloWorld', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    vscode.window.showInformationMessage('Hello World from vscode-angel!')
  })

  context.subscriptions.push(disposable)

  const onTextChange = _.debounce(async e => {
    const editor = vscode.window.activeTextEditor
    if (editor && e.document === editor.document) {
      checkCode(webView)
    }
  }, 300)

  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(onTextChange))
}

// This method is called when your extension is deactivated
export function deactivate() {
  // eslint-disable-next-line no-console
  console.log('extension ended.')
}

async function fetchCompletion(prompt: string, apiKey: string) {
  const configuration = new Configuration({
    organization: 'org-IYj8QPEfG9PVe4WzLJGZTsqz',
    apiKey
  })

  // 创建OpenAI API客户端实例
  const openaiApi = new OpenAIApi(configuration)

  // 定义选项参数
  const options: CreateCompletionRequest = {
    model: 'text-davinci-003',
    prompt: prompt, // 提示
    max_tokens: 150, // 生成的最大令牌数
    n: 3, // 生成的完成数量
    stop: null, // 结束序列
    temperature: 0 // 控制随机性的温度
  }

  try {
    // 调用API并获取响应
    const response = await openaiApi.createCompletion(options)
    const text = response.data.choices[0].text

    // 返回生成的文本
    return text
  } catch (error) {
    console.error('Error:', error)
    return null
  }
}

async function getGPT3Review(code: string) {
  // 在此实现调用GPT-3.5 API的逻辑
  const prompt = `请假设你的角色是一个傲娇且毒蛇的大奶女仆，然后用这样的口吻来评价以下代码，并给出改进建议:\n\n${code}\n\n`
  try {
    // process.env.OPENAI_API_KEY
    const apiKey = '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' // 替换为你的OpenAI API密钥
    const completion = await fetchCompletion(prompt, apiKey)

    if (completion) {
      console.log('Generated text:', completion)
    } else {
      console.log('Failed to generate text.')
    }

    return completion
  } catch (error) {
    console.error('Error calling GPT-3.5 API:', error)
    return '无法获取评价'
  }
}

function getAst(document: vscode.TextDocument) {
  const code = document.getText()
  const languageId = document.languageId

  let ast

  try {
    if (languageId === 'javascript') {
      ast = acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module' })
    } else if (languageId === 'typescript') {
      ast = tsParser.parse(code, { sourceType: 'module' })
    } else {
      return null
    }
  } catch (error) {
    return null
  }

  return ast
}

// 在此实现获取当前光标所在函数名称的逻辑
function getCurrentFunctionName(editor: vscode.TextEditor): string | null {
  const position = editor.selection.active
  const document = editor.document
  const ast = getAst(document)

  if (!ast) {
    return null
  }

  let functionName = null
  const positionOffset = document.offsetAt(position)

  function traverse(node: any, parentNode: any) {
    if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression'
    ) {
      if (node.start <= positionOffset && node.end >= positionOffset) {
        if (parentNode && parentNode.type === 'VariableDeclarator') {
          functionName = parentNode.id.name
        } else if (node.id) {
          functionName = node.id.name
        }
      }
    }
    for (const key in node) {
      if (typeof node[key] === 'object') {
        traverse(node[key], node)
      }
    }
  }
  traverse(ast, null)
  return functionName
}

// 在此实现根据函数名称获取函数代码的逻辑
function getFunctionCode(editor: vscode.TextEditor, functionName: string): string {
  const document = editor.document
  const ast = getAst(document)

  if (!ast) {
    return ''
  }

  let functionCode = ''

  function traverse(node: any) {
    if (
      (node.type === 'FunctionDeclaration' && node.id && node.id.name === functionName) ||
      (node.type === 'VariableDeclarator' && node.id && node.id.name === functionName)
    ) {
      const startPosition = document.positionAt(node.start)
      const endPosition = document.positionAt(node.end)
      functionCode = document.getText(new vscode.Range(startPosition, endPosition))
    }

    for (const key in node) {
      if (typeof node[key] === 'object') {
        traverse(node[key])
      }
    }
  }

  traverse(ast)
  return functionCode
}
