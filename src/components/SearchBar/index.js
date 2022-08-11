import './style.css'
import { dispatchSearchQuery } from '../../events/SearchQuery/index.js'
import { dispatchModeUpdate } from '../../events/ModeUpdate/index.js'
import appModes from '../../constants/AppModes.js'

const template = `
    <div class="search-bar">
        <input autoComplete="true" placeholder="search for movie"></input>
        <span class="clear">&times</span>
    </div>
`

class SearchBar extends HTMLElement {
    delay = 1250
    timer = undefined
    
    constructor() {
        super()
    }

    render() {
        this.innerHTML = template
        // references to elements
        this.input = this.children[0].children[0]
        this.closeButton = this.children[0].children[1]
        // listeners
        this.input.addEventListener('keyup', this.sendQuery)
        this.closeButton.addEventListener('click', this.hideResults)
    }

    sendQuery = () => {
        // do not send empty query
        if(!this.input.value.length) return
        // debounce sending query
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
            dispatchSearchQuery(this.input.value.trim())
        }, this.delay)
    }

    hideResults = (e) => {
        // no need to hide results for empty query
        if(!this.input.value.length) return
        dispatchModeUpdate(appModes.NOW_PLAYING)
        this.input.value = ''
    }

    // connect component
    connectedCallback() {
        this.render()
    }

    disconnectedCallback() {
        this.input.removeEventListener('keyup', this.sendQuery)
        this.closeButton.removeEventListener('click', this.hideResults)
    }
}

customElements.define('search-bar', SearchBar)