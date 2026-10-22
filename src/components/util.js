//const cleanRE = /(?<=>)([\n\s\t])*|([\n\s\t])*(?=<)/gm
export const stringTemplateToFragment = template => new Range().createContextualFragment(template)

// escape a value for safe interpolation into an HTML string
export const escapeHTML = value => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

export const fileTemplateToHTMLTemplate = async filePath => {
    let template = document.createElement("template")
    template.innerHTML = await (await fetch(filePath)).text()
    return template
}

export const debounce = (cb, delay = 250) => {
    let timeout
    return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => { cb(...args) }, delay)
    }
}