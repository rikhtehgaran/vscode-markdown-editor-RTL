export interface RtlSettings {
  enableRtl: boolean
  persianFont: string
  englishFont: string
  persianFontSizePercent: number
  englishFontSizePercent: number
}

const PERSIAN_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/

const TEXT_ELEMENT_SELECTOR =
  'h1, h2, h3, h4, h5, h6, p, blockquote, td, th'

const BUNDLED_PERSIAN_FONT = 'Vazirmatn'

function isPersian(text: string): boolean {
  return PERSIAN_REGEX.test(text.replace(/\s/g, ''))
}

function isInsideCodeBlock(el: Element): boolean {
  return !!el.closest('.vditor-wysiwyg__block[data-type="code-block"]')
}

function getEditorRoot(): Element | null {
  return document.querySelector('.vditor-wysiwyg pre.vditor-reset')
}

function getEnglishFontFamily(settings: RtlSettings): string {
  if (settings.englishFont.trim()) {
    return settings.englishFont.trim()
  }
  return 'var(--vscode-editor-font-family)'
}

function getPersianFontFamily(settings: RtlSettings): string {
  const font = settings.persianFont.trim()
  if (!font || font === BUNDLED_PERSIAN_FONT) {
    return `'${BUNDLED_PERSIAN_FONT}', var(--vscode-editor-font-family)`
  }
  return font
}

function readOriginalFontSize(el: HTMLElement): string {
  el.style.removeProperty('font-size')
  return window.getComputedStyle(el).fontSize
}

function applyFontSize(el: HTMLElement, percent: number) {
  if (!el.dataset.rtlOriginalFontSize) {
    el.dataset.rtlOriginalFontSize = readOriginalFontSize(el)
  }
  const basePx = parseFloat(el.dataset.rtlOriginalFontSize)
  if (Number.isFinite(basePx)) {
    el.style.setProperty(
      'font-size',
      `${basePx * (percent / 100)}px`,
      'important'
    )
  }
}

function clearTypography(el: HTMLElement) {
  el.style.removeProperty('direction')
  el.style.removeProperty('text-align')
  el.style.removeProperty('font-family')
  el.style.removeProperty('font-size')
  delete el.dataset.rtlOriginalFontSize
}

function applyToElement(el: HTMLElement, settings: RtlSettings) {
  if (isInsideCodeBlock(el)) {
    return
  }

  const text = el.innerText || el.textContent || ''
  const hasPersian = isPersian(text)

  if (hasPersian) {
    if (settings.enableRtl) {
      el.style.setProperty('direction', 'rtl', 'important')
      el.style.setProperty('text-align', 'right', 'important')
    } else {
      el.style.removeProperty('direction')
      el.style.removeProperty('text-align')
    }
    el.style.setProperty(
      'font-family',
      getPersianFontFamily(settings),
      'important'
    )
    applyFontSize(el, settings.persianFontSizePercent)
    return
  }

  el.style.removeProperty('direction')
  el.style.removeProperty('text-align')
  el.style.setProperty(
    'font-family',
    getEnglishFontFamily(settings),
    'important'
  )
  applyFontSize(el, settings.englishFontSizePercent)
}

function applyToList(container: HTMLElement, settings: RtlSettings) {
  if (isInsideCodeBlock(container)) {
    return
  }

  const text = container.innerText || container.textContent || ''
  const hasPersian = isPersian(text)

  if (hasPersian && settings.enableRtl) {
    container.style.setProperty('margin-right', '35px', 'important')
    container.style.removeProperty('margin-left')
  } else {
    container.style.removeProperty('margin-right')
  }

  container.querySelectorAll('li').forEach((li) => {
    applyToElement(li as HTMLElement, settings)
  })
}

function enforceCodeBlockLtr(root: Element) {
  root.querySelectorAll(
    '.vditor-wysiwyg__block[data-type="code-block"], .vditor-wysiwyg__block[data-type="code-block"] pre, .vditor-wysiwyg__block[data-type="code-block"] code'
  ).forEach((el) => {
    const node = el as HTMLElement
    node.style.setProperty('direction', 'ltr', 'important')
    node.style.setProperty('text-align', 'left', 'important')
  })
}

export function createRtlController(initialSettings: RtlSettings) {
  let settings = { ...initialSettings }
  let observer: MutationObserver | null = null
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function processAll() {
    const root = getEditorRoot()
    if (!root) {
      return
    }

    root.querySelectorAll(TEXT_ELEMENT_SELECTOR).forEach((el) => {
      applyToElement(el as HTMLElement, settings)
    })

    root.querySelectorAll('ul, ol').forEach((list) => {
      applyToList(list as HTMLElement, settings)
    })

    enforceCodeBlockLtr(root)
  }

  function scheduleProcess() {
    debounceTimer && clearTimeout(debounceTimer)
    debounceTimer = setTimeout(processAll, 50)
  }

  function start() {
    stop()
    processAll()
    const root = getEditorRoot() || document.body
    observer = new MutationObserver(scheduleProcess)
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }

  function stop() {
    observer?.disconnect()
    observer = null
    debounceTimer && clearTimeout(debounceTimer)
    debounceTimer = null
  }

  function update(newSettings: RtlSettings) {
    settings = { ...newSettings }
    getEditorRoot()
      ?.querySelectorAll('[data-rtl-original-font-size]')
      .forEach((el) => {
        clearTypography(el as HTMLElement)
      })
    processAll()
  }

  return { start, stop, update, processAll }
}
