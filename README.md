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
- **Custom emojis**: Personalize your emoji toolbar with your favorite emojis
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

### Custom Emojis (default: `["😄", "👎", "👍", "😕", "👀", "❤️", "🚀", "🎉"]`)

Customize the emoji list available in the editor toolbar. Add your favorite emojis to personalize your editing experience.

```json
"algo4stock.rtl-markdown-editor.customEmojis": ["😀", "😊", "🎉", "❤️", "👍", "👎", "🔥", "⭐"]
```

**Note**: Changes to emoji settings require reopening the markdown editor to take effect.

## Acknowledgement

- [vscode](https://github.com/microsoft/vscode)
- [vditor](https://github.com/Vanessa219/vditor)

## License

MIT

Made by Algo4Stock 🇮🇷