import './style.css'
import { dispatchCloseOverlay } from "../../events/Overlay/CloseOverlay"
import { dispatchOpenOverlay } from '../../events/Overlay/OpenOverlay'

const template = `
    <div class="overlay">
        <span class="close-button">&times</span>
    </div>
`

class Overlay extends HTMLElement {
    constructor() {
        super()
    }

    clear = () => {
        // remove all html elements except close button
        [...this.children[0].children].slice(1).forEach(element => {
            element.remove()
        });
    }

    closeOverlay = () => {
        if(!this.hasAttribute('show')) return;
        this.clear()
        dispatchCloseOverlay()
        this.style.display = 'none'
    }

    openOverlay = () => {
        if(this.hasAttribute('show')) return;
        dispatchOpenOverlay()
        this.style.display = 'block'
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
        return ['show'];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'show') {
            if(newValue === '')
                this.openOverlay()
            else if(newValue === null)
                this.closeOverlay()
        }
    }
}

customElements.define('over-lay', Overlay)