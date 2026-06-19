import './preload'

import {
  fileToBase64,
  fixCut,
  // fixDarkTheme,
  fixLinkClick,
  fixPanelHover,
  handleToolbarClick,
  saveVditorOptions,
} from './utils'

import { merge } from 'lodash'
import Vditor from 'vditor'
import { format } from 'date-fns'
import 'vditor/dist/index.css'
import { t, lang } from './lang'
import { toolbar } from './toolbar'
import { fixTableIr } from './fix-table-ir'
import { createRtlController, RtlSettings } from './rtl'
import './main.css'
import './theme.css'

let rtlController: ReturnType<typeof createRtlController> | null = null

function initVditor(msg) {
  console.log('msg', msg)
  let inputTimer
  let defaultOptions: any = {}
  if (msg.theme === 'dark') {
    // vditor.setTheme('dark', 'dark')
    defaultOptions = merge(defaultOptions, {
      theme: 'dark',
      preview: {
        theme: {
          current: 'dark',
        },
      }
    })
  }
  
  // Remove any existing emoji configuration from msg.options to prevent conflicts
  const cleanOptions = { ...msg.options };
  delete cleanOptions.emoji;
  
  defaultOptions = merge(defaultOptions, cleanOptions, {
    preview: {
      math: {
        inlineDigit: true,
      }
    }
  })
  if (window.vditor) {
    vditor.destroy()
    window.vditor = null
  }
  window.vditor = new Vditor('app', {
    width: '100%',
    height: '100%',
    minHeight: '100%',
    lang,
    value: msg.content,
    mode: 'wysiwyg',
    cache: { enable: false },
    toolbar,
    toolbarConfig: { 
      pin: true,
      // Explicitly define emoji configuration in toolbar config
      hint: false // Disable default hint to avoid conflicts
    },
    ...defaultOptions,
    // Ensure emoji configuration is properly set
    emoji: {
      // Full custom emoji map
      emojis: {
        // 8 default Vditor emojis
        '+1': '👍',
        '-1': '👎',
        'confused': '😕',
        'eyes': '👀',
        'heart': '❤️',
        'rocket': '🚀',
        'smile': '😊',
        'tada': '🎉',
        // 31 custom emojis
        'info': 'ℹ️',
        'note': '📝',
        'list': '📋',
        'file': '📄',
        'folder': '📁',
        'link': '🔗',
        'attach': '📎',
        'idea': '💡',
        'pin': '📌',
        'watch': '👁️',
        'question': '❓',
        'warning': '⚠️',
        'puzzle': '🧩',
        'package': '📦',
        'zap': '⚡',
        'rocket2': '🚀',
        'tools': '🛠️',
        'check': '✅',
        'cross': '❌',
        'fire': '🔥',
        'sparkles': '✨',
        'new': '🆕',
        'right': '➡️',
        'left': '⬅️',
        'down': '🔽',
        'up': '🔼',
        'target': '🎯',
        'finish': '🏁',
        'chart': '📊',
        'speak': '💬',
        'search': '🔍'
      },
      // Ensure no default emoji icons are loaded
      pathname: '',
    },
    // Configure hint to use our custom emojis
    hint: {
      emoji: {
        // Override the default hint emoji list with our custom list
        '+1': '👍',
        '-1': '👎',
        'confused': '😕',
        'eyes': '👀',
        'heart': '❤️',
        'rocket': '🚀',
        'smile': '😊',
        'tada': '🎉',
        // Include all custom emojis in hint as well
        'info': 'ℹ️',
        'note': '📝',
        'list': '📋',
        'file': '📄',
        'folder': '📁',
        'link': '🔗',
        'attach': '📎',
        'idea': '💡',
        'pin': '📌',
        'watch': '👁️',
        'question': '❓',
        'warning': '⚠️',
        'puzzle': '🧩',
        'package': '📦',
        'zap': '⚡',
        'rocket2': '🚀',
        'tools': '🛠️',
        'check': '✅',
        'cross': '❌',
        'fire': '🔥',
        'sparkles': '✨',
        'new': '🆕',
        'right': '➡️',
        'left': '⬅️',
        'down': '🔽',
        'up': '🔼',
        'target': '🎯',
        'finish': '🏁',
        'chart': '📊',
        'speak': '💬',
        'search': '🔍'
      }
    },
    after() {
      // fixDarkTheme()
      handleToolbarClick()
      fixTableIr()
      fixPanelHover()
      if (msg.rtlSettings) {
        if (rtlController) {
          rtlController.stop()
        }
        rtlController = createRtlController(msg.rtlSettings as RtlSettings)
        rtlController.start()
      }
    },
    preview: {
      theme: {
        current: 'theme',
        path: './theme.css'
      },
      hljs: {
        style: 'xcode',
        lineNumber: true
      }
    },
    // preview: {
    //   render: {
    //     codeBlockPreview: (element) => {
    //       // 检查代码块语言是否为 plantuml
    //       if (element.className.includes('language-plantuml')) {
    //         const plantumlServer = 'http://www.plantuml.com/plantuml'; // PlantUML 服务器地址
    //         const code = element.querySelector('code').textContent; // 获取代码块内容
    //         const encoded = encodeURIComponent(code); // URL 编码
    //         const url = `${plantumlServer}/svg/${encoded}`; // 生成 SVG 图表
    //         element.innerHTML = `<img src="${url}" alt="PlantUML Diagram" style="max-width: 100%;" />`; // 替换代码块为图像
    //       }
    //     },
    //   },
    // },
    input() {
      inputTimer && clearTimeout(inputTimer)
      inputTimer = setTimeout(() => {
        vscode.postMessage({ command: 'edit', content: vditor.getValue() })
        rtlController?.processAll()
      }, 100)
    },
    upload: {
      url: '/fuzzy', // 没有 url 参数粘贴图片无法上传 see: https://github.com/Vanessa219/vditor/blob/d7628a0a7cfe5d28b055469bf06fb0ba5cfaa1b2/src/ts/util/fixBrowserBehavior.ts#L1409
      async handler(files) {
        // console.log('files', files)
        let fileInfos = await Promise.all(
          files.map(async (f) => {
            const d = new Date()
            return {
              base64: await fileToBase64(f),
              name: `${format(new Date(), 'yyyyMMdd_HHmmss')}_${f.name}`.replace(
                /[^\w-_.]+/,
                '_'
              ),
            }
          })
        )
        vscode.postMessage({
          command: 'upload',
          files: fileInfos,
        })
      },
    },
  })
}

window.addEventListener('message', (e) => {
  const msg = e.data
  // console.log('msg from vscode', msg)
  switch (msg.command) {
    case 'update': {
      if (msg.type === 'init') {
        if (msg.options && msg.options.useVscodeThemeColor) {
          document.body.setAttribute('data-use-vscode-theme-color', '1')
        } else {
          document.body.setAttribute('data-use-vscode-theme-color', '0')
        }
        try {
          initVditor(msg)
        } catch (error) {
          // reset options when error
          console.error(error)
          initVditor({ content: msg.content })
          saveVditorOptions()
        }
        console.log('initVditor')
      } else {
        vditor.setValue(msg.content)
        console.log('setValue')
      }
      break
    }
    case 'request-current-content': {
      // Send current content back to VS Code for saving before close
      vscode.postMessage({ 
        command: 'current-content', 
        content: vditor.getValue() 
      })
      break
    }
    case 'uploaded': {
      msg.files.forEach((f) => {
        if (f.endsWith('.wav')) {
          vditor.insertValue(
            `\n\n<audio controls="controls" src="${f}"></audio>\n\n`
          )
        } else {
          const i = new Image()
          i.src = f
          i.onload = () => {
            vditor.insertValue(`\n\n![](${f})\n\n`)
          }
          i.onerror = () => {
            vditor.insertValue(`\n\n[${f.split('/').slice(-1)[0]}](${f})\n\n`)
          }
        }
      })
      break
    }
    case 'rtl-config': {
      if (msg.rtlSettings && rtlController) {
        rtlController.update(msg.rtlSettings as RtlSettings)
      } else if (msg.rtlSettings) {
        rtlController = createRtlController(msg.rtlSettings as RtlSettings)
        rtlController.start()
      }
      break
    }
    default:
      break
  }
})

fixLinkClick()
fixCut()

vscode.postMessage({ command: 'ready' })