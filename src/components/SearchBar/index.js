import './style.css'
import { dispatchSearchQuery } from '../../events/Search/SearchQuery/index.js'
import { dispatchEndSearchQuery } from '../../events/Search/EndSearchQuery'
import store from '../../store'

const template = `
    <div class="search-bar">
        <input autoComplete="true" placeholder="search for movie"></input>
        <span class="clear">&times</span>
    </div>
`

class SearchBar extends HTMLElement {
    constructor() {
        super()
    }

    render() {
        this.innerHTML = template
        // references to elements
        this.input = this.children[0].children[0]
        this.closeButton = this.children[0].children[1]
        // listeners
        this.input.addEventListener('input', this.sendQuery)
        this.closeButton.addEventListener('click', this.hideResults)
    }

    sendQuery = () => {
        // do not send empty query
        if(!this.input.value.length) return
        dispatchSearchQuery(this.input.value.trim())
    }

    hideResults = () => {
        this.input.value = ''
        dispatchEndSearchQuery();
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