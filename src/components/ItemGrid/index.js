import appModes from '../../constants'
import store from '../../store'
import { stringTemplateToFragment } from '../util'
import './style.css'

const template = `
<div class="item-grid">
</div>
`

export class MovieList extends HTMLElement {
    constructor() {
        super()
    }

    render() {
        this.append(stringTemplateToFragment(template))
    }

    connectedCallback() {
        this.render()
    }

    static get observedAttributes() {
        return [];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
    }

    appendItems(items) {
        if(!items.results || !items.results.length) return
        const type = store.mode === appModes.SEARCH ? store.searchQuery.type : 'movie'
        const container = this.children[0]
        items.results.forEach(np => {
            const card = document.createElement(`${type}-card`);
            card.render(np)
            container.append(card)
        })
    }

    clear() {
        [...this.children[0].children].forEach(c => {
            c.remove()
        })
    }
}

customElements.define('item-grid', MovieList)