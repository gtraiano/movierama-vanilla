import './style.css'
import { dispatchCloseOverlay } from "../../events/Overlay/CloseOverlay"
import { dispatchOpenOverlay } from '../../events/Overlay/OpenOverlay'
import "../Spinner/index"

const template = `
    <div tabindex="1" class="overlay">
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
        // focus on container div so that keydown events can be listened to instantly
        this.children[0].focus()
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
        return ['show', 'loading'];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'show') {
            if(newValue === '')
                this.openOverlay()
            else if(newValue === null)
                this.closeOverlay()
        }

        if(name === 'loading') {
            if(Boolean(newValue) || newValue === '') {
                const div = document.createElement('div')
                div.classList.add('loading')
                this.appendChild(div)
                
                const { flexDirection } = getComputedStyle(div);
                const spinner = document.createElement('loading-spinner')
                div.appendChild(spinner)
                spinner.style.width = '5%'
                spinner.setAttribute('direction', flexDirection)
                spinner.setAttribute('message', 'Loading...')
            }
            else if(!Boolean(newValue) || newValue === null) {
                this.getElementsByClassName('loading')[0].remove()
                this.removeAttribute('loading')
                this.children[0].focus()
            }
        }
    }
}

customElements.define('over-lay', Overlay)