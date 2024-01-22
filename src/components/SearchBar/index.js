import './style.css'
import { dispatchSearchQuery } from '../../events/Search/SearchQuery/index.js'
import { dispatchEndSearchQuery } from '../../events/Search/EndSearchQuery'
import store from '../../store'
import { searchTypes } from '../../constants/AppModes.js'
import { dispatchSearchTypeChange } from '../../events/Search/ChangeSearchType/index.js'

const template = `
    <div class="search-bar">
        <input autoComplete="true" placeholder="search for movie"></input>
        <span class="clear">&times</span>
        <select></select>
        <!--div class="controls">
            <span class="clear">&times</span>
            <select></select>
        </div-->
    </div>
`

class SearchBar extends HTMLElement {
    constructor() {
        super()
    }

    render() {
        this.innerHTML = template
        // references to elements
        this.input = this.querySelector('input')
        this.clearButton = this.querySelector('.clear')
        const select = this.querySelector('select')
        // populate options
        Object.values(searchTypes).forEach(st => {
            const option = document.createElement('option')
            option.value = st
            option.textContent = st
            select.append(option)
        })
        // set selected option
        select.querySelector(`option[value=${store.searchQuery.type}]`).setAttribute('selected', '')
        
        // listeners
        this.input.addEventListener('input', this.sendQuery)
        this.clearButton.addEventListener('click', this.hideResults)
        select.addEventListener('change', this.updateSearchType)
    }

    sendQuery = () => {
        // do not send empty query
        if(!this.input.value.length) return
        dispatchSearchQuery({ query: this.input.value.trim(), type: store.searchQuery.type })
    }

    hideResults = () => {
        this.input.value = ''
        dispatchEndSearchQuery();
    }

    updateSearchType = (e) => {
        dispatchSearchTypeChange(e.currentTarget.value)
    }

    // connect component
    connectedCallback() {
        this.render()
    }

    disconnectedCallback() {
        this.input.removeEventListener('keyup', this.sendQuery)
        this.clearButton.removeEventListener('click', this.hideResults)
    }
}

customElements.define('search-bar', SearchBar)