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
    static OBSERVED_ATTRIBUTES = Object.freeze({
        SHOW: 'show',
        LOADING: 'loading',
        HIDE_DOC_BODY_SCROLL: 'hide-body-scroll'
    })

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
        this.removeAttribute(Overlay.OBSERVED_ATTRIBUTES.HIDE_DOC_BODY_SCROLL)
        this.removeAttribute(Overlay.OBSERVED_ATTRIBUTES.SHOW)
        dispatchCloseOverlay()
    }

    openOverlay = () => {
        if(this.hasAttribute(Overlay.OBSERVED_ATTRIBUTES.SHOW)) return;
        this.setAttribute(Overlay.OBSERVED_ATTRIBUTES.HIDE_DOC_BODY_SCROLL, '')
        this.setAttribute(Overlay.OBSERVED_ATTRIBUTES.SHOW, '')
        dispatchOpenOverlay()
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
    }

    connectedCallback() {
        this.render()
    }

    disconnectedCallback() {
        this.children[0].children[0].removeEventListener('click', this.closeOverlay)
        this.children[0].removeEventListener('keydown', this.closeOverlayOnKeyDown)
    }

    static get observedAttributes() {
        return Object.values(Overlay.OBSERVED_ATTRIBUTES)
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
        if(name === Overlay.OBSERVED_ATTRIBUTES.SHOW) {
            if(newValue === '')
                this.openOverlay()
            else if(newValue === null)
                this.closeOverlay()
        }

        else if(name === Overlay.OBSERVED_ATTRIBUTES.LOADING) {
            if(Boolean(newValue) || newValue === '') {
                const div = document.createElement('div')
                div.classList.add(Overlay.OBSERVED_ATTRIBUTES.LOADING)
                this.appendChild(div)
                
                const { flexDirection } = getComputedStyle(div);
                const spinner = document.createElement('loading-spinner')
                div.appendChild(spinner)
                spinner.style.width = '5%'
                spinner.setAttribute('direction', flexDirection)
                spinner.setAttribute('message', 'Loading...')
            }
            else if(!Boolean(newValue) || newValue === null) {
                this.getElementsByClassName(Overlay.OBSERVED_ATTRIBUTES.LOADING)[0].remove()
                this.removeAttribute(Overlay.OBSERVED_ATTRIBUTES.LOADING)
                this.children[0].focus()
            }
        }

        else if(name === Overlay.OBSERVED_ATTRIBUTES.HIDE_DOC_BODY_SCROLL) {
            if(Boolean(newValue) || newValue === '') document.body.style.overflow = 'hidden'
            else if(!Boolean(newValue) || newValue === null) document.body.style.overflow = 'unset'
        }
    }
}

customElements.define('over-lay', Overlay)