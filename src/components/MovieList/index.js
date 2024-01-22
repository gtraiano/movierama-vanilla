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

    appendMovieCards(movies) {
        if(!movies.results || !movies.results.length) return
        /*
        // no results, add a message stating so
        if(!movies.results || !movies.results.length) {
            console.log('grid style', getComputedStyle(this.children[0]))
            const midCol = Math.ceil(getComputedStyle(this.children[0]).gridTemplateColumns.split(/\s/).length / 2)
            const div = document.createElement('div')
            div.textContent = 'Nothing to show'
            div.style.fontSize = 'x-large'
            div.style.gridColumn = String(midCol)
            this.children[0].append(div)
            return
        }
        */
        const container = this.children[0]
        movies.results.forEach(np => {
            const card = document.createElement('movie-card');
            card.updateCard(np)
            container.append(card)
        })
    }

    appendPersonCards(person) {
        if(!person.results || !person.results.length) return
        const container = this.children[0]
        person.results.forEach(np => {
            const card = document.createElement('person-card')
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