import './style.css'

const template = `<div><slot></slot></div>`

class DropDown extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.attachShadow({ mode: "open" })
        this.shadowRoot.innerHTML = template
    }
}

customElements.define('drop-down', DropDown)