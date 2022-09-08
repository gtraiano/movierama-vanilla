import './style.css'

const template = `<div class="alert-box"></div>`

class AlertBox extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.innerHTML = template
    }

    disconnectedCallback() {
    }

    static get observedAttributes() {
        return []
    }

    attributeChangedCallback(name, oldValue, newValue) {
    }

    loading = (truth, message) => {
        truth = Boolean(truth)
        if(truth) {
            this.setAttribute('show', truth.toString())
            this.children[0].setAttribute('message', message ?? 'Fetching')
            this.setAttribute('loading', truth.toString())
        }
        else {
            this.removeAttribute('show')
            this.children[0].removeAttribute('message')
            this.removeAttribute('loading')
        }
    }

    show = (truth, message) => {
        truth = Boolean(truth)
        if(truth) {
            this.setAttribute('show', truth.toString())
            message && this.children[0].setAttribute('message', message)
        }
        else {
            this.removeAttribute('show')
            this.children[0].removeAttribute('message')
        }
    }

    showFor = (message, duration) => {
        this.setAttribute('show', 'true')
        message && this.children[0].setAttribute('message', message)
        setTimeout(() => {
            this.removeAttribute('show')
            this.children[0].removeAttribute('message')
        }, duration)
    }
}

customElements.define('alert-box', AlertBox)