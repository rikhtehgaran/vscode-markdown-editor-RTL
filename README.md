# Ag4s RTL Markdown Editor

A full-featured WYSIWYG editor for RTL Markdown with Persian font support.

## Install

[Install from VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=Algo4Stock.rtl-markdown-editor)

Or install the latest `.vsix` file directly:

- Download from [Releases](https://github.com/rikhtehgaran/vscode-markdown-editor-RTL/releases)
- `code --install-extension rtl-markdown-editor-0.0.5.vsix`

## Demo

![demo](./demo-v2.gif)

## Features

- What You See Is What You Get (WYSIWYG)
- Auto sync changes between the VS Code editor and webview
- **Automatic RTL/LTR**: Persian/Arabic lines are right-aligned; English lines stay left-to-right
- **Separate fonts**: Bundled Vazirmatn for Persian text; VS Code editor font for English (both configurable)
- **Independent font scaling**: Adjust Persian and English text size separately as a percentage of the default
- **Built-in emoji toolbar**: 39 emojis ready to use (8 default + 31 custom)
- Code blocks are always left-to-right
- Copy markdown/html
- Uploaded/pasted/drag-dropped images will be auto-saved to the `assets` folder
- Multi-theme support
- Shortcut keys
- Multiple editing modes: instant Rendering mode / WYSIWYG mode / split screen mode
- Markdown extensions
- Multiple graph support including KaTeX / Mermaid / Graphviz / ECharts / abc.js(notation) / ...
- UI language is English

## Install

Install from a packaged `.vsix` file or build locally with `yarn pack`.

## Usage

### 1. Command mode in markdown file

- open a markdown file
- type `cmd-shift-p` to enter command mode
- type `algo4stock.rtl-markdown-editor: Open with Ag4s RTL Markdown Editor`

### 2. Key bindings

- open a markdown file
- type `ctrl+shift+alt+m` for win or `cmd+shift+alt+m` for mac

### 3. Explorer Context menu

- right click on markdown file
- then click `Open with Ag4s RTL Markdown Editor`

### 4. Editor title context menu

- right click on a opened markdown file's tab title
- then click `Open with Ag4s RTL Markdown Editor`

## Settings

Add these to your VS Code `settings.json`:

### Enable RTL (default: `true`)

When enabled, any normal text block (headings, paragraphs, lists — not code blocks) that contains Persian or Arabic characters gets `direction: rtl` and `text-align: right`. English-only blocks stay left-to-right.

```json
"algo4stock.rtl-markdown-editor.enableRtl": true
```

### Persian font (default: `Vazirmatn`)

Uses the bundled Vazirmatn font by default. Set any installed system font name to override.

```json
"algo4stock.rtl-markdown-editor.persianFont": "Vazirmatn"
```

### English font (default: empty)

Leave empty to use the VS Code editor font. Set a font name to override.

```json
"algo4stock.rtl-markdown-editor.englishFont": ""
```

### Persian font size percent (default: `100`)

Scales Persian/Arabic text relative to the editor's default size. `100` is unchanged; `80` is smaller; `120` is larger.

```json
"algo4stock.rtl-markdown-editor.persianFontSizePercent": 100
```

### English font size percent (default: `100`)

Same as above, but only for English/Latin text blocks.

```json
"algo4stock.rtl-markdown-editor.englishFontSizePercent": 100
```

### Custom CSS

```json
"algo4stock.rtl-markdown-editor.customCss": "my custom css rules"
```

### Auto Save (default: `true`)

Automatically save changes to the file when editing. When disabled, you will be prompted to save before closing unsaved files.

```json
"algo4stock.rtl-markdown-editor.autoSave": true
```

**Note**: When auto-save is disabled and you try to close a file with unsaved changes, a dialog will appear asking if you want to save, discard, or cancel.

## Emoji Toolbar

The editor includes a comprehensive emoji toolbar with **39 emojis** (8 default Vditor emojis + 31 custom emojis):

**Default Vditor emojis:** 👍 👎 😕 👀️ ❤️ ️  🎉️

**Custom emojis:** ️ 📝 📋 📄 📁 🔗 📎 💡  👀 ❓ ⚠️ 🧩 📦 ⚡ 🚀 🛠️ ✅ ❌ 🔥 ✨ 🆕 ➡️ ️ 🔽 🔼 🎯 🏁 📊 🗣️ 🔍

These emojis are built-in and ready to use immediately. No configuration needed!

## Changelog

### v0.4.0
- Added customizable code block languages via settings (`codeBlockLanguage1`, `codeBlockLanguage2`, `codeBlockLanguage3`) to dynamically select languages in the toolbar.
- Added Ag4s custom blocks (`ag4s-block`) and tags (`ag4s-block-b`) in the toolbar to wrap selections with custom HTML/Markdown elements.
- Preconfigured default custom CSS styling for `ag4s-console` blocks and their spans (blue, green, red, brown, purple, cyan, gray).
- Added a toolbar manual refresh button to sync and reload content from the active VS Code document.
- Improved auto-save functionality and overall stability.

### v0.3.0
- Fixed custom emoji functionality.
- Improved emoji handling, rendering, and display stability.

### v0.2.0
- Added customizable emoji list configuration.

### v0.0.5
- Initial release ready for the marketplace, featuring WYSIWYG editing, Persian/English font configuration, auto-save, copy utilities, etc.

## Acknowledgement

- [vscode](https://github.com/microsoft/vscode)
- [vditor](https://github.com/Vanessa219/vditor)

## License

MIT

Made by Algo4Stock 🇮🇷
