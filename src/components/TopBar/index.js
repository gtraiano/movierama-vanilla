import './style.css'

class TopBar extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.attachShadow({ mode: "open" })
        this.shadowRoot.innerHTML = `
            <div>
                <slot></slot>
            </div>
        `
        this.classList.add('above')
    }
}

customElements.define('top-bar', TopBar)