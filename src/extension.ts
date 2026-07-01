import * as vscode from 'vscode'
import * as NodePath from 'path'
const EXTENSION_ID = 'algo4stock.rtl-markdown-editor'
const KeyVditorOptions = 'vditor.options'
import { TextEncoder } from 'util'

function debug(...args: any[]) {
  console.log(...args)
}

function getRtlSettings() {
  const config = vscode.workspace.getConfiguration(EXTENSION_ID)
  return {
    enableRtl: config.get<boolean>('enableRtl', true),
    persianFont: config.get<string>('persianFont', 'Vazirmatn'),
    englishFont: config.get<string>('englishFont', ''),
    persianFontSizePercent: config.get<number>('persianFontSizePercent', 100),
    englishFontSizePercent: config.get<number>('englishFontSizePercent', 100),
  }
}

function getAdditionalSettings() {
  const config = vscode.workspace.getConfiguration(EXTENSION_ID)
  return {
    codeBlockLanguage1: config.get<string>('codeBlockLanguage1', ''),
    codeBlockLanguage2: config.get<string>('codeBlockLanguage2', ''),
    codeBlockLanguage3: config.get<string>('codeBlockLanguage3', ''),
  }
}

function showError(msg: string) {
  vscode.window.showErrorMessage(`[${EXTENSION_ID}] ${msg}`)
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      `${EXTENSION_ID}.openEditor`,
      (uri?: vscode.Uri, ...args) => {
        debug('command', uri, args)
        EditorPanel.createOrShow(context, uri)
      }
    )
  )

  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      EXTENSION_ID,
      {
        async resolveCustomTextEditor(document, webviewPanel) {
          await EditorPanel.createCustomEditor(context, webviewPanel, document)
        },
      },
      {
        supportsMultipleEditorsPerDocument: false,
      }
    )
  )

  // const disposable = vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
  //   // 输出打开文件的路径和语言 ID
  //   console.log(`Opened document: ${document.fileName}, Language: ${document.languageId}`);

  //   // 示例：如果打开的是 .myext 文件，显示通知
  //   if (document.languageId === 'markdown') {
  //     EditorPanel.createOrShow(context, document.uri)
  //     // vscode.window.showInformationMessage(`You opened a .myext file: ${document.fileName}`);
  //   }
  // });

  // // 将事件订阅添加到上下文，插件卸载时自动清理
  // context.subscriptions.push(disposable);

  context.globalState.setKeysForSync([KeyVditorOptions])

  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration(EXTENSION_ID)) {
        return
      }
      EditorPanel.activeInstance?.updateSettings()
    })
  )
}

/**
 * Manages cat coding webview panels
 */
class EditorPanel {
  /**
   * Track the currently panel. Only allow a single panel to exist at a time.
   */
  public currentPanel: EditorPanel | undefined
  public static activeInstance: EditorPanel | undefined

  public static readonly viewType = EXTENSION_ID

  private _disposables: vscode.Disposable[] = []
  private _isSaving = false

  public static async createOrShow(
    context: vscode.ExtensionContext,
    uri?: vscode.Uri
  ) {
    const { extensionUri } = context
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined
    if (!vscode.window.activeTextEditor && !uri) {
      showError(`Did not open markdown file!`)
      return
    }
    let doc: undefined | vscode.TextDocument
    // from context menu : 从当前打开的 textEditor 中寻找 是否有当前 markdown 的 editor, 有的话则绑定 document
    if (uri) {
      // 从右键打开文件，先打开文档然后开启自动同步，不然没法保存文件和同步到已经打开的document
      doc = await vscode.workspace.openTextDocument(uri)
    } else {
      doc = vscode.window.activeTextEditor?.document
      // from command mode
      if (doc && doc.languageId !== 'markdown') {
        showError(
          `Current file language is not markdown, got ${doc.languageId}`
        )
        return
      }
    }

    if (!doc) {
      showError(`Cannot find markdown file!`)
      return
    }

    // Otherwise, create a new panel.
    const panel = vscode.window.createWebviewPanel(
      EditorPanel.viewType,
      EXTENSION_ID,
      vscode.ViewColumn.One, // 强制在新panel中激活
      EditorPanel.getWebviewOptions(uri)
    )

    const currentPanel = new EditorPanel(
      context,
      panel,
      extensionUri,
      doc,
      uri
    )
    currentPanel.currentPanel = currentPanel
    EditorPanel.activeInstance = currentPanel
    panel.reveal(vscode.ViewColumn.One) // 确保新panel获得焦点
  }

  public static async createCustomEditor(
    context: vscode.ExtensionContext,
    panel: vscode.WebviewPanel,
    document: vscode.TextDocument
  ) {
    const { extensionUri } = context
    const currentPanel = new EditorPanel(
      context,
      panel,
      extensionUri,
      document,
      document.uri
    )
    currentPanel.currentPanel = currentPanel
    EditorPanel.activeInstance = currentPanel
    panel.reveal(vscode.ViewColumn.One)
  }

  private static getFolders(): vscode.Uri[] {
    const data = []
    for (let i = 65; i <= 90; i++) {
      data.push(vscode.Uri.file(`${String.fromCharCode(i)}:/`))
    }
    return data
  }

  static getWebviewOptions(
    uri?: vscode.Uri
  ): vscode.WebviewOptions & vscode.WebviewPanelOptions {
    return {
      // Enable javascript in the webview
      enableScripts: true,

      localResourceRoots: [vscode.Uri.file("/"), ...this.getFolders()],
      retainContextWhenHidden: true,
      enableCommandUris: true,
    }
  }
  private get _fsPath() {
    return this._uri.fsPath
  }

  static get config() {
    return vscode.workspace.getConfiguration(EXTENSION_ID)
  }

  private constructor(
    private readonly _context: vscode.ExtensionContext,
    private readonly _panel: vscode.WebviewPanel,
    private readonly _extensionUri: vscode.Uri,
    public _document: vscode.TextDocument, // 当前有 markdown 编辑器
    public _uri = _document.uri // 从资源管理器打开，只有 uri 没有 _document
  ) {
    // Set the webview's initial html content

    this._init()

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programmatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables)

    // Add listener for file renames
    vscode.workspace.onDidRenameFiles((e) => {
      debug('onDidRenameFiles', e)
      for (const file of e.files) {
        if (file.oldUri.toString() === this._uri.toString()) {
          this._handleFilePathChange(file.newUri)
          break
        }
      }
    }, this._disposables)

    // Listen for text document changes to auto-reload
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === this._uri.toString()) {
        if (this._isSaving || this._panel.active) {
          return
        }
        this._update({
          type: 'update',
        })
      }
    }, null, this._disposables)


    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        debug('msg from webview review', message, this._panel.active)

        switch (message.command) {
          case 'refresh':
            this._update({
              type: 'update',
            })
            break
          case 'ready':
            this._update({
              type: 'init',
              options: {
                useVscodeThemeColor: EditorPanel.config.get<boolean>(
                  'useVscodeThemeColor'
                ),
                ...this._context.globalState.get(KeyVditorOptions),
                ...getAdditionalSettings(),
              },
               themePath: this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media/dist')).toString(),
               iconPath: this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media/ag4s.png')).toString(),
               iconPathB: this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media/ag4sb.png')).toString(),
               rtlSettings: getRtlSettings(),
              theme:
                vscode.window.activeColorTheme.kind ===
                  vscode.ColorThemeKind.Dark
                  ? 'dark'
                  : 'light',
            })
            break
          case 'save-options':
            this._context.globalState.update(KeyVditorOptions, message.options)
            break
          case 'info':
            vscode.window.showInformationMessage(message.content)
            break
          case 'error':
            showError(message.content)
            break
          case 'get-content': {
            // When user wants to save before closing, send current content back
            if (this._isDirty) {
              this._panel.webview.postMessage({ command: 'request-current-content' })
            }
            break
          }
          case 'current-content': {
            // Received current content from webview, save it
            await this._saveContent(message.content)
            this._doDispose()
            break
          }
          case 'edit': {
            // 只有当 webview 处于编辑状态时才同步到 vsc 编辑器，避免重复刷新
            if (this._panel.active) {
              this._isEdit = true
              this._isDirty = true // Mark as dirty when content changes
              this._updateEditTitle()
              
              // Auto-save if enabled
              if (this._autoSave) {
                this._saveContent(message.content)
              }
            }
            break
          }
          case 'reset-config': {
            await this._context.globalState.update(KeyVditorOptions, {})
            break
          }
          case 'save': {
            await this._saveContent(message.content)
            break
          }
          case 'upload': {
            const assetsFolder = EditorPanel.getAssetsFolder(this._uri)
            try {
              await vscode.workspace.fs.createDirectory(
                vscode.Uri.file(assetsFolder)
              )
            } catch (error) {
              console.error(error)
              showError(`Invalid image folder: ${assetsFolder}`)
            }
            await Promise.all(
              message.files.map(async (f: any) => {
                const content = Buffer.from(f.base64, 'base64')
                return vscode.workspace.fs.writeFile(
                  vscode.Uri.file(NodePath.join(assetsFolder, f.name)),
                  content
                )
              })
            )
            const files = message.files.map((f: any) =>
              NodePath.relative(
                NodePath.dirname(this._fsPath),
                NodePath.join(assetsFolder, f.name)
              ).replace(/\\/g, '/')
            )
            this._panel.webview.postMessage({
              command: 'uploaded',
              files,
            })
            break
          }
          case 'open-link': {
            let url = message.href
            if (!/^http/.test(url)) {
              url = NodePath.resolve(this._fsPath, '..', url)
            }
            vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(url))
            break
          }
        }
      },
      null,
      this._disposables
    )
  }

  static getAssetsFolder(uri: vscode.Uri) {
    const imageSaveFolder = (
      EditorPanel.config.get<string>('imageSaveFolder') || 'assets'
    )
      .replace(
        '${projectRoot}',
        vscode.workspace.getWorkspaceFolder(uri)?.uri.fsPath || ''
      )
      .replace('${file}', uri.fsPath)
      .replace(
        '${fileBasenameNoExtension}',
        NodePath.basename(uri.fsPath, NodePath.extname(uri.fsPath))
      )
      .replace('${dir}', NodePath.dirname(uri.fsPath))
    const assetsFolder = NodePath.resolve(
      NodePath.dirname(uri.fsPath),
      imageSaveFolder
    )
    return assetsFolder
  }

  private async _saveContent(content: string) {
    try {
      this._isSaving = true
      await vscode.workspace.fs.writeFile(this._uri, new TextEncoder().encode(content))
      this._isEdit = false
      this._isDirty = false
      this._updateEditTitle()
      
      // Show success message only if manually saved (not auto-saved)
      if (!this._autoSave) {
        vscode.window.showInformationMessage('File saved successfully')
      }
    } catch (error) {
      showError(`Failed to save file: ${error.message}`)
    } finally {
      this._isSaving = false
    }
  }

  public dispose() {
    // Check if we need to prompt for save before closing
    if (this._isDirty && !this._autoSave) {
      const choice = vscode.window.showWarningMessage(
        'You have unsaved changes. Do you want to save before closing?',
        { modal: true },
        'Save',
        "Don't Save",
        'Cancel'
      ).then(async (result) => {
        if (result === 'Save') {
          // Get current content from webview and save
          this._panel.webview.postMessage({ command: 'get-content' })
          // Wait a bit for the response, then save and dispose
          setTimeout(() => {
            this._doDispose()
          }, 500)
        } else if (result === "Don't Save") {
          this._doDispose()
        }
        // If Cancel, do nothing
      })
      return
    }
    
    this._doDispose()
  }

  private _doDispose() {
    this.currentPanel = undefined
    if (EditorPanel.activeInstance === this) {
      EditorPanel.activeInstance = undefined
    }

    // Clean up our resources
    this._panel.dispose()

    while (this._disposables.length) {
      const x = this._disposables.pop()
      if (x) {
        x.dispose()
      }
    }
  }

  private async _handleFilePathChange(newUri: vscode.Uri) {
    const oldUri = this._uri
    debug('File path change detected:', oldUri.toString(), '->', newUri.toString())

    // 额外的路径有效性检查
    if (!newUri || !newUri.fsPath) {
      showError(`Invalid new URI: ${newUri}`)
      return
    }

    // 检查文件是否实际存在
    try {
      await vscode.workspace.fs.stat(newUri)
    } catch (statError) {
      showError(`New file does not exist: ${newUri.fsPath}`)
      return
    }

    try {
      // 尝试打开新文档
      const newDocument = await vscode.workspace.openTextDocument(newUri)

      // 验证文档是否为 Markdown
      if (newDocument.languageId !== 'markdown') {
        showError(`New file is not a Markdown document: ${newUri.fsPath}`)
        return
      }

      // 更新 URI 和文档
      this._uri = newUri
      this._document = newDocument

      // 更新面板内容和标题
      // this._update()
      this._updateEditTitle()

      // 通知 Webview 文件已重命名
      this._panel.webview.postMessage({
        command: 'file-renamed',
        oldUri: oldUri.toString(),
        newUri: newUri.toString()
      })

      debug('File path change processed successfully:', {
        oldPath: oldUri.fsPath,
        newPath: newUri.fsPath,
        newTitle: this._panel.title
      })
    } catch (error: any) {
      // 更详细的错误处理
      const errorMessage = `Failed to process file rename: ${error.message}`
      console.error(errorMessage, error)
      showError(errorMessage)

      // 尝试恢复到原始状态，而不是直接销毁面板
      this._uri = oldUri
      try {
        this._document = await vscode.workspace.openTextDocument(oldUri)
      } catch (recoveryError) {
        console.error('Failed to recover original document', recoveryError)
        this.dispose() // 如果恢复失败，则销毁面板
      }
    }
  }

  private _init() {
    const webview = this._panel.webview

    this._panel.webview.html = this._getHtmlForWebview(webview)
    this._panel.title = NodePath.basename(this._fsPath)
  }
  private _isEdit = false
  private _isDirty = false // Track if file has unsaved changes
  
  private get _autoSave(): boolean {
    return EditorPanel.config.get<boolean>('autoSave', true)
  }
  
  private _updateEditTitle() {
    // const isEdit = this._document.isDirty
    const newTitle = `${this._isEdit ? `[edit]` : ''}${NodePath.basename(this._fsPath)}`

    // 强制更新标题，不仅仅依赖编辑状态的变化
    this._panel.title = newTitle
  }

  // private fileToWebviewUri = (f: string) => {
  //   return this._panel.webview.asWebviewUri(vscode.Uri.file(f)).toString()
  // }

  private async _update(
    props: {
      type?: 'init' | 'update'
      options?: any
      themePath?: string
      iconPath?: string
      iconPathB?: string
      rtlSettings?: ReturnType<typeof getRtlSettings>
      theme?: 'dark' | 'light'
    } = { options: void 0 }
  ) {
    const md = this._document
      ? this._document.getText()
      : (await vscode.workspace.fs.readFile(this._uri)).toString()
    // const dir = NodePath.dirname(this._document.fileName)
    this._panel.webview.postMessage({
      command: 'update',
      content: md,
      ...props,
    })
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const toUri = (f: string) =>
      webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, f))
    const baseHref =
      NodePath.dirname(
        webview.asWebviewUri(vscode.Uri.file(this._fsPath)).toString()
      ) + '/'
    const toMediaPath = (f: string) => `media/dist/${f}`
    const JsFiles = ['main.js'].map(toMediaPath).map(toUri)
    const CssFiles = ['main.css', 'fonts.css'].map(toMediaPath).map(toUri)

    return (
      `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<base href="${baseHref}" />


				${CssFiles.map((f) => `<link href="${f}" rel="stylesheet">`).join('\n')}

				<title>markdown editor</title>
        <style>` +
      EditorPanel.config.get<string>('customCss') +
      `</style>
			</head>
			<body>
				<div id="app"></div>


				${JsFiles.map((f) => `<script src="${f}"></script>`).join('\n')}
			</body>
			</html>`
    )
  }

  public updateSettings() {
    this._panel.webview.postMessage({
      command: 'rtl-config',
      rtlSettings: getRtlSettings(),
    })
    this._panel.webview.postMessage({
      command: 'update',
      type: 'config',
      options: getAdditionalSettings(),
    })
  }
}
