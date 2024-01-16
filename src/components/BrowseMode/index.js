import './style.css'
import { appModesTitles, browseModes } from "../../constants/AppModes"
import { dispatchModeUpdate } from '../../events/ModeUpdate'
import store from '../../store'

class BrowseMode extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.innerHTML = `
            <nav class="browse-mode">
                <ul>${browseModes.map(m => `<li><a href="" app-mode="${m}">${appModesTitles[m]}</a></li>`).join('\n')}</ul>
            </nav>`
        this.setAttribute('active-link', store.mode)
        this.querySelectorAll('.browse-mode > ul > li > a').forEach(a => {
            a.addEventListener('click', e => {
                e.preventDefault()
                this.setAttribute('active-link', e.currentTarget.getAttribute('app-mode'))
                dispatchModeUpdate(e.currentTarget.getAttribute('app-mode'))
            })
        })
    }

    disconnectedCallback() {
    }

    static get observedAttributes() {
        return ['active-link', 'disabled']
    }

    disable = () => {
        this.setAttribute('disabled', '')
    }

    enable = () => {
        this.removeAttribute('disabled')
    }

    getActiveMode = () => !Number.isNaN(Number.parseInt(this.getAttribute('active-link'))) 
        ? this.getAttribute('active-link')
        : [...this.querySelectorAll('.browse-mode > ul > li > a')].find(a => a.classList.contains('active')).getAttribute('app-mode')

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'active-link') {
            const useNumericIndex = !Number.isNaN(Number.parseInt(newValue))
            const links = this.querySelectorAll('.browse-mode > ul > li > a')
            const oldActive = useNumericIndex ? links.item(Number.parseInt(oldValue)) : [...links].find(a => a.getAttribute('app-mode') === oldValue)
            oldActive?.classList.remove('active')
            const active = useNumericIndex ? links.item(Number.parseInt(newValue)) : [...links].find(a => a.getAttribute('app-mode') === newValue)
            active?.classList.add('active')
        }
        else if(name === 'disabled') {
            this.classList[!newValue ? 'remove' : 'add']('disabled')
        }
    }
}

customElements.define('browse-mode', BrowseMode)