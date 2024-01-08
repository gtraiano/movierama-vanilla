import './style.css'
import store from '../../store'
import { dispatchRequestMovieDetails } from '../../events/RequestMovieDetails'

class MovieCard extends HTMLElement {
    constructor() {
        super()
        this.movieId = null
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

    generateGenres = (ids, separator = ', ') => ids.map(id => store.genres.lookup(id)).join(separator)

    requestMovieDetails = () => {
        // use arrow function to have it bound to the class!
        dispatchRequestMovieDetails(this.attributes.getNamedItem('movie-id').value)
    }

    updateCard = (movie) => {
        this.innerHTML = this.generateTemplate(movie)
        movie.adult && this.classList.add('adult')
        this.setAttribute('movie-id', movie.id)
        this.querySelector('div.poster').addEventListener('click', this.requestMovieDetails)
    }

    generateTemplate(movie) {
        return (
        `
            <div class="movie-item">
                <div class="movie-item-line poster">
                    <img
                        ${(movie.adult && store.preferences.previewAdultPoster) ? 'class="adult"' : ''}
                        srcset="${store.configuration.helpers.images.generatePosterUrls(movie.poster_path)?.join(',') ?? ''}"
                        alt="${movie.title} poster"
                        loading="lazy"
                        title="Click for movie details"
                    />
                </div>
                <div class="movie-item-line">
                    <label>Title</label>
                    <span>${movie.title}${movie.original_language !== 'en' ? ' ('+movie.original_title+')' : ''}</span>
                </div>
                <div class="movie-item-line">
                    <label>Released</label>
                    <span>${movie.release_date ?? ''}</span>
                </div>
                <div class="movie-item-line">
                    <label>Genres</label>
                    <span>${this.generateGenres(movie.genre_ids ?? movie.genres.map(g => g.id))}</span>
                </div>
                <div class="movie-item-line">
                    <label>Vote average</label>
                    <span>${movie.vote_average}</span>
                </div>
                <div class="movie-item-line accordion">
                    <label style="width: 100%, text-align: center" for=${movie.id}>Overview</label>
                    <input type="checkbox" id=${movie.id}></input>
                    <span style="width: 100%">${movie.overview}</span>
                </div>
            </div>
        `)
    }
}

customElements.define('movie-card', MovieCard)