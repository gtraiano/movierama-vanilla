import './style.css'
import { dispatchCloseOverlay } from "../../events/Overlay/CloseOverlay"

const template = `
    <div tabindex="0" class="overlay">
        <span class="close-button">&times</span>
    </div>
`

class Overlay extends HTMLElement {
    constructor() {
        super()
    }

    clear = () => {
        // remove all html elements
        [...this.children[0].children].slice(1).forEach(element => {
            element.remove()
        });
    }

    closeOverlay = () => {
        dispatchCloseOverlay()
        this.clear()
    }

    closeOverlayOnKeyDown = (e) => {
        e.key === 'Escape' && this.closeOverlay()   
    }

    updateContent(content) {
        this.clear()
        this.children[0].appendChild(content)
    }

    render() {
        this.innerHTML = template
        // close button listener
        this.children[0].children[0].addEventListener('click', this.closeOverlay)
        // close on ESC key press
        this.children[0].addEventListener('keydown', this.closeOverlayOnKeyDown)
        // do not display yet
        this.style.display = 'none'
    }

    connectedCallback() {
        this.render()
    }

    disconnectedCallback() {
        this.children[0].children[0].removeEventListener('click', this.closeOverlay)
        this.children[0].removeEventListener('keydown', this.closeOverlayOnKeyDown)
    }

    static get observedAttributes() {
        return [];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
    }
}

customElements.define('over-lay', Overlay)