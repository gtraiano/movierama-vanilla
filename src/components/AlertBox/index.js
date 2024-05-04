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
        return ['show', 'loading']
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'loading') {
            if(newValue !== null || newValue === 'true') {
                console.log(name, newValue)
                const spinner = document.createElement('ring-spinner')
                spinner.style.position = 'absolute'
                spinner.style.left = '2%';
                spinner.style.width = '2em';
                this.children[0].appendChild(spinner)
            }
            else if(newValue === null || newValue === 'false') {
                this.children[0].querySelectorAll('ring-spinner').forEach(s => { s.remove() })
            }
        }
    }

    loading = (truth, message) => {
        truth = Boolean(truth)
        if(truth) {
            this.setAttribute('show', '')
            this.children[0].setAttribute('message', message ?? 'Fetching')
            this.setAttribute('loading', '')
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
            this.setAttribute('show', '')
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