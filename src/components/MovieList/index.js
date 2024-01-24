import appModes, { browseModes } from '../../constants/AppModes'
import store from '../../store'
import './style.css'

const template = `
    <div class="in-theaters">
    </div>
`

export class MovieList extends HTMLElement {
    constructor() {
        super()
    }

    render() {
        this.innerHTML = template
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

customElements.define('movie-list', MovieList)