const Langs = {
  en_US: {
    save: 'Save',
    copyMarkdown: 'Copy Markdown',
    copyHtml: 'Copy HTML',
    resetConfig: 'Reset config',
    resetConfirm: "Are you sure to reset the markdown editor config?",
  },
}

export const lang = 'en_US'

export function t(msg: string) {
  return Langs.en_US[msg]
}
