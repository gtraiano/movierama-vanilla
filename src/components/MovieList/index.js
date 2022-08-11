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