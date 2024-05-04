import './style.css'

const template = '<span class="loader"></span>'

class RingSpinner extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.innerHTML = template
    }

    disconnectedCallback() {
    }
}

customElements.define('ring-spinner', RingSpinner)