import './style.css'
import { dispatchSearchQuery } from '../../events/Search/SearchQuery/index.js'
import { dispatchEndSearchQuery } from '../../events/Search/EndSearchQuery'
import store from '../../store'
import { searchTypes } from '../../constants'
import { dispatchSearchTypeChange } from '../../events/Search/ChangeSearchType/index.js'
import { stringTemplateToFragment, debounce } from '../util.js'

const template = `
<div class="search-bar">
    <input autoComplete="true"></input>
    <span class="clear">&times</span>
    <select></select>
</div>
`

class SearchBar extends HTMLElement {
    // send search request debounce
    doneTypingDelay = 1000;
    
    constructor() {
        super()
    }

    render() {
        Array.from(this.children).forEach(c => c.remove())
        this.append(stringTemplateToFragment(template))
        // references to elements
        this.input = this.querySelector('input')
        this.clearButton = this.querySelector('.clear')
        const select = this.querySelector('select')
        
        this.setAttribute('search-type', store.searchQuery.type)
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

    sendQuery = debounce(() => {
        const query = this.input.value?.trim()
        if(!query?.length) return
        dispatchSearchQuery({ query, type: store.searchQuery.type })
    }, this.doneTypingDelay)

    hideResults = () => {
        this.input.value = ''
        dispatchEndSearchQuery();
    }

    updateSearchType = (e) => {
        dispatchSearchTypeChange(e.currentTarget.value)
        this.setAttribute('search-type', e.currentTarget.value)
    }

    // connect component
    connectedCallback() {
        this.render()
    }

    disconnectedCallback() {
        this.input.removeEventListener('keyup', this.sendQuery)
        this.clearButton.removeEventListener('click', this.hideResults)
    }

    static get observedAttributes() {
        return ['search-type']
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'search-type') {
            this.querySelector('input').placeholder = newValue?.length ? `search for ${newValue}` : 'search'
        }
    }
}

customElements.define('search-bar', SearchBar)