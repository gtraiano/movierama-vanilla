import './style.css'

const template = `<div><slot></slot></div>`

class DropDown extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        // re-insertion (or a stale enqueued reaction) can run this twice on the
        // same element — attaching a second shadow root throws NotSupportedError
        if (!this.shadowRoot) this.attachShadow({ mode: "open" })
        this.shadowRoot.innerHTML = template
    }
}

customElements.define('drop-down', DropDown)