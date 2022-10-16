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

    appendMovieCards(movies) {
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

    clear() {
        [...this.children[0].children].forEach(c => {
            c.remove()
        })
    }
}

customElements.define('movie-list', MovieList)