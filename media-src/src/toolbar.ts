import { t } from "./lang"
import { confirm } from "./utils"

// Store current options
let currentOptions: any = null

const LANGUAGES: Record<string, string> = {
	bash: "Bash",
	python: "Python",
	javascript: "JavaScript",
	typescript: "TypeScript",
	java: "Java",
	cpp: "C++",
	csharp: "C#",
	php: "PHP",
	ruby: "Ruby",
	go: "Go",
	rust: "Rust",
	sql: "SQL",
	html: "HTML",
	css: "CSS",
	json: "JSON",
	yaml: "YAML",
	xml: "XML",
	markdown: "Markdown"
}

function isInsideCodeBlock() {
	const selection = window.getSelection()
	if (!selection || selection.rangeCount === 0) return false
	const range = selection.getRangeAt(0)
	let node = range.startContainer
	while (node && node !== document.body) {
		if (node.nodeType === 1) { // Node.ELEMENT_NODE
			const tagName = (node as Element).tagName
			const className = (node as Element).className || ''
			if (
				tagName === 'PRE' ||
				tagName === 'CODE' ||
				className.includes('vditor-wysiwyg__block') ||
				className.includes('vditor-ir__marker--pre')
			) {
				return true
			}
		}
		node = node.parentNode as Node
	}
	return false
}

function insertCustomTags(openTag: string, closeTag: string, isBlock: boolean = false) {
	const selection = window.vditor.getSelection() || ''
	if (isBlock) {
		window.vditor.insertMD(`${openTag}${selection}${closeTag}`)
	} else if (isInsideCodeBlock()) {
		document.execCommand('insertText', false, `${openTag}${selection}${closeTag}`)
	} else {
		window.vditor.insertMD(`${openTag}${selection}${closeTag}`)
	}
}

function createSubItem(name: string, displayLabel: string, openTag: string, closeTag: string, isBlock: boolean = false) {
	return {
		name,
		tip: displayLabel.replace(/<\/?[^>]+(>|$)/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>'), // Tooltip with plain text
		icon: displayLabel, // Display inside button dropdown list
		click() {
			insertCustomTags(openTag, closeTag, isBlock)
		}
	}
}

function getCodeBlockLanguages() {
	const opt = currentOptions?.options || {}
	return [opt.codeBlockLanguage1, opt.codeBlockLanguage2, opt.codeBlockLanguage3].filter(
		(it) => it && it.trim()
	)
}

function handleInsertCode(lang: string) {
	const selection = window.vditor.getSelection() || ''
	const prefix = lang ? `\`\`\`${lang}` : '```'
	if (selection) {
		window.vditor.insertMD(`${prefix}\n${selection}\n\`\`\``)
	} else {
		window.vditor.insertMD(`\n${prefix}\n\n\`\`\``)
	}
}

function generateCodeLangPicker() {
	const langs = getCodeBlockLanguages()
	if (langs.length === 0) {
		return 'code'
	}
	const pickerItems = [
		{
			name: 'code-lang-default',
			tip: 'Default',
			icon: 'Default',
			click() {
				handleInsertCode('')
			}
		},
		...langs.map((lang) => ({
			name: `code-lang-${lang}`,
			tip: LANGUAGES[lang] || lang,
			icon: LANGUAGES[lang] || lang,
			click() {
				handleInsertCode(lang)
			}
		}))
	]
	return {
		name: 'code-lang-picker',
		hotkey: '⌘U',
		tip: 'Code Block <code>&lt;Ctrl+U&gt;</code>',
		tipPosition: 'n',
		className: '',
		icon: '<svg><use xlink:href="#vditor-icon-code"></use></svg>',
		toolbar: pickerItems
	}
}

const ag4sBlockMenu = {
	name: 'ag4s-block',
	tipPosition: 'n',
	tip: 'Ag4s Blocks',
	className: 'vditor-icon',
	icon: '',
	toolbar: [
		createSubItem('pre-block', '&lt;pre&gt; Block', '<pre class="ag4s-console">\n', '\n</pre>', true),
		createSubItem('bold-block', '<b>&lt;B&gt; Bold</b>', '<b>', '</b>'),
		createSubItem('underline-block', '<i>&lt;U&gt; Underline</i>', '<i>', '</i>'),
		createSubItem('italic-block', '<u>&lt;I&gt; Italic</u>', '<u>', '</u>'),
		createSubItem('green-span', '💚 Green &lt;span&gt;', '<span class="ag4s-green">', '</span>'),
		createSubItem('blue-span', '💙 Blue &lt;span&gt;', '<span class="ag4s-blue">', '</span>'),
		createSubItem('red-span', '❤️ Red &lt;span&gt;', '<span class="ag4s-red">', '</span>'),
		createSubItem('brown-span', '🤎 Brown &lt;span&gt;', '<span class="ag4s-brown">', '</span>'),
		createSubItem('purple-span', '💜 Purple &lt;span&gt;', '<span class="ag4s-purple">', '</span>'),
		createSubItem('cyan-span', '🩵 Cyan &lt;span&gt;', '<span class="ag4s-cyan">', '</span>'),
		createSubItem('gray-span', '🩶 Gray &lt;span&gt;', '<span class="ag4s-gray">', '</span>')
	]
}

const ag4sBlockMenuB = {
	name: 'ag4s-block-b',
	tipPosition: 'n',
	tip: 'Ag4s Tags',
	className: 'vditor-icon',
	icon: '',
	toolbar: [
		createSubItem('bold-tag', '<b>&lt;B&gt; Bold</b>', '<bold>', '</bold>'),
		createSubItem('underline-tag', '<u>&lt;U&gt; Underline</u>', '<underline>', '</underline>'),
		createSubItem('italic-tag', '<i>&lt;I&gt; Italic</i>', '<italic>', '</italic>'),
		createSubItem('green-tag', '💚 Green &lt;green&gt;', '<green>', '</green>'),
		createSubItem('blue-tag', '💙 Blue &lt;blue&gt;', '<blue>', '</blue>'),
		createSubItem('red-tag', '❤️ Red &lt;red&gt;', '<red>', '</red>'),
		createSubItem('brown-tag', '🤎 Brown &lt;brown&gt;', '<brown>', '</brown>'),
		createSubItem('purple-tag', '💜 Purple &lt;purple&gt;', '<purple>', '</purple>'),
		createSubItem('cyan-tag', '🩵 Cyan &lt;cyan&gt;', '<cyan>', '</cyan>'),
		createSubItem('gray-tag', '🩶 Gray &lt;gray&gt;', '<gray>', '</gray>')
	]
}

export function getToolbar(msg: any) {
	currentOptions = msg

	if (msg && msg.iconPath) {
		ag4sBlockMenu.icon = `<img src="${msg.iconPath}" style="width: 16px; height: 16px; vertical-align: middle;" />`
	}
	if (msg && msg.iconPathB) {
		ag4sBlockMenuB.icon = `<img src="${msg.iconPathB}" style="width: 16px; height: 16px; vertical-align: middle;" />`
	}

	const items = [
		{
			hotkey: '⌘s',
			name: 'save',
			tipPosition: 's',
			tip: t('save'),
			className: 'save',
			icon:
				'<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M810.667 938.667H213.333a128 128 0 01-128-128V213.333a128 128 0 01128-128h469.334a42.667 42.667 0 0130.293 12.374L926.293 311.04a42.667 42.667 0 0112.374 30.293v469.334a128 128 0 01-128 128zm-597.334-768a42.667 42.667 0 00-42.666 42.666v597.334a42.667 42.667 0 0042.666 42.666h597.334a42.667 42.667 0 0042.666-42.666v-451.84l-188.16-188.16z"/><path d="M725.333 938.667A42.667 42.667 0 01682.667 896V597.333H341.333V896A42.667 42.667 0 01256 896V554.667A42.667 42.667 0 01298.667 512h426.666A42.667 42.667 0 01768 554.667V896a42.667 42.667 0 01-42.667 42.667zM640 384H298.667A42.667 42.667 0 01256 341.333V128a42.667 42.667 0 0185.333 0v170.667H640A42.667 42.667 0 01640 384z"/></svg>',
			click() {
				vscode.postMessage({
					command: 'save',
					content: vditor.getValue(),
				})
			},
		},
		{
			name: 'refresh',
			tipPosition: 's',
			tip: 'Reload content from document',
			className: 'refresh',
			icon:
				'<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="32" height="32"><path d="M512 85.333C276.48 85.333 85.333 276.48 85.333 512s191.147 426.667 426.667 426.667c235.52 0 426.667-191.147 426.667-426.667S747.52 85.333 512 85.333zm0 768c-188.16 0-341.333-153.173-341.333-341.333S323.84 170.667 512 170.667s341.333 153.173 341.333 341.333S700.16 853.333 512 853.333zm-42.667-426.666v-128a42.667 42.667 0 0185.334 0v213.333a42.667 42.667 0 01-42.667 42.667H298.667a42.667 42.667 0 010-85.334h170.666z"/></svg>',
			click() {
				vscode.postMessage({
					command: 'refresh',
				})
			},
		},

		'emoji',
		'headings',
		'bold',
		'italic',
		'strike',
		'link',
		'|',
		'list',
		'ordered-list',
		'check',
		'outdent',
		'indent',
		'|',
		'quote',
		'line',
		generateCodeLangPicker(),
		'inline-code',
		'|',
		ag4sBlockMenu,
		ag4sBlockMenuB,
		'|',
		'insert-before',
		'insert-after',
		'|',
		'upload',
		'table',
		'|',
		'undo',
		'redo',
		'|',
		'outline',
		{
			name: 'more',
			tipPosition: 'e',
			toolbar: [
				{
					name: 'copy-markdown',
					icon: t('copyMarkdown'),
					async click() {
						try {
							await navigator.clipboard.writeText(vditor.getValue())
							vscode.postMessage({
								command: 'info',
								content: 'Copy Markdown successfully!',
							})
						} catch (error) {
							vscode.postMessage({
								command: 'error',
								content: `Copy Markdown failed! ${error.message}`,
							})
						}
					},
				},
				{
					name: 'copy-html',
					icon: t('copyHtml'),
					async click() {
						try {
							await navigator.clipboard.writeText(vditor.getHTML())
							vscode.postMessage({
								command: 'info',
								content: 'Copy HTML successfully!',
							})
						} catch (error) {
							vscode.postMessage({
								command: 'error',
								content: `Copy HTML failed! ${error.message}`,
							})
						}
					},
				},
				{
					name: 'reset-config',
					icon: t('resetConfig'),
					async click() {
						confirm(t('resetConfirm'), async () => {
							try {
								await vscode.postMessage({
									command: 'reset-config',
								})
								await vscode.postMessage({
									command: 'ready',
								})
								vscode.postMessage({
									command: 'info',
									content: 'Reset config successfully!',
								})
							} catch (error) {
								vscode.postMessage({
									command: 'error',
									content: 'Reset config failed!',
								})
							}
						})
					},
				},
			],
		},
	].map((it: any) => {
		if (typeof it === 'string') {
			it = { name: it }
		}
		it.tipPosition = it.tipPosition || 's'
		return it
	})

	return items
}

export function updateToolbarOptions(options: any) {
	if (currentOptions) {
		currentOptions.options = {
			...(currentOptions.options || {}),
			...options
		}
	}
}
