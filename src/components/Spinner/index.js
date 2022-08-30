import './style.css'

const template = `
<div class="spin"></div>
`

class Spinner extends HTMLElement {
    message = undefined
    
    constructor() {
        super()
    }

    connectedCallback() {
        this.innerHTML = template
    }

    disconnectedCallback() {
    }

    static get observedAttributes() {
        return ['message', 'direction']
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'message') {
            this.children[0].setAttribute('message', newValue)
        }
        if(name === 'direction') {
            if(['row', 'column'].includes(newValue)) {
                this.children[0].classList.add(newValue)
            }
        }
    }
}

customElements.define('loading-spinner', Spinner)