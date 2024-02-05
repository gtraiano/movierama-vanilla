//const cleanRE = /(?<=>)([\n\s\t])*|([\n\s\t])*(?=<)/gm
export const stringTemplateToFragment = template => new Range().createContextualFragment(template)

export const debounce = (cb, delay = 250) => {
    let timeout
    return (...args) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => { cb(...args) }, delay)
    }
}