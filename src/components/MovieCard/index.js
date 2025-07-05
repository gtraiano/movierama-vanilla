import './style.css'
import store from '../../store'
import { dispatchRequestMovieDetails } from '../../events/RequestMovieDetails'
import { fileTemplateToHTMLTemplate } from '../util'

let template
(async () => {
    template = await fileTemplateToHTMLTemplate("./src/components/MovieCard/template.html")
})()

class MovieCard extends HTMLElement {
    static contentTemplate = null

    constructor() {
        super()
        this.movieId = null

        if(!MovieCard.contentTemplate) {
            MovieCard.contentTemplate = template
            console.info(`loaded ${MovieCard.name} template`)
        }
    }

    connectedCallback() {
    }

    disconnectedCallback() {
        this.querySelector('div.poster').removeEventListener('click', this.requestMovieDetails)
    }

    static get observedAttributes() {
        return []
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
    }

    generateGenres = (ids, separator = ', ') => ids?.map(id => store.genres.lookup(id)).filter(g => typeof g == 'string').join(separator) ?? ''

    requestMovieDetails = () => {
        // use arrow function to have it bound to the class!
        dispatchRequestMovieDetails(this.attributes.getNamedItem('movie-id').value)
    }

    render = async (movie) => {
        if(!movie) {
            console.error("Rendering empty movie")
        }
        Array.from(this.children).forEach(c => c.remove())
        this.append(this.generateTemplate(movie))
        movie.adult && this.classList.add('adult')
        this.setAttribute('movie-id', movie.id)
        this.querySelector('div.poster').addEventListener('click', this.requestMovieDetails)
    }

    generateTemplate(movie) {
        const card = MovieCard.contentTemplate.content.cloneNode(true);
        const img = card.querySelector("img")
        img.srcset = `${store.configuration.helpers.images.generatePosterUrls(movie.poster_path)?.join(',') ?? ''}`
        img.alt = `${movie.title} poster`
        card.querySelector(".movie-item-line[role=movie-title] > span").textContent = `${movie.title}${movie.original_language !== 'en' ? ' ('+movie.original_title+')' : ''}`
        card.querySelector(".movie-item-line[role=movie-release-date] > span").textContent = `${movie.release_date ?? ''}`
        card.querySelector(".movie-item-line[role=movie-genres] > span").textContent = `${this.generateGenres(movie.genre_ids ?? movie?.genres?.map(g => g.id))}${movie.adult && movie?.genre_ids?.length >= 1 ? ', ' : ''}${movie.adult ? store.genres.lookup(0) : ''}`
        card.querySelector(".movie-item-line[role=movie-rating] > span").textContent = `${movie.vote_average ?? ''}`
        card.querySelector(".overview-container").textContent = `${movie.overview?.trim()}`
        return card
    }
}

customElements.define('movie-card', MovieCard)