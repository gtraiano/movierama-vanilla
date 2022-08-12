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

    findGenre(id) {
        return store.genres.find(g => g.id === id).name
    }

    requestMovieDetails = () => {
        // use arrow function to have function bound to class!
        dispatchRequestMovieDetails(this.attributes.getNamedItem('movie-id').value)
    }

    updateCard(movie) {
        this.innerHTML = this.generateTemplate(movie)
        this.setAttribute('movie-id', movie.id)
        this.querySelector('div.poster').addEventListener('click', this.requestMovieDetails)
    }

    generateTemplate(movie) {
        return (
        `
            <div class="movie-item">
                <div class="movie-item-line poster">
                    <img
                        srcSet="
                            https://image.tmdb.org/t/p/w342/${movie.poster_path} 342w,
                            https://image.tmdb.org/t/p/w92/${movie.poster_path} 92w,
                            https://image.tmdb.org/t/p/w154/${movie.poster_path} 154w,
                            https://image.tmdb.org/t/p/w185/${movie.poster_path} 185w,
                            https://image.tmdb.org/t/p/w342/${movie.poster_path} 342w,
                            https://image.tmdb.org/t/p/w500/${movie.poster_path} 500w,
                            https://image.tmdb.org/t/p/w780/${movie.poster_path} 780w
                        "
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
                    <span>${movie.release_date}</span>
                </div>
                <div class="movie-item-line">
                    <label>Genres</label>
                    <span>${movie.genre_ids.map(id => this.findGenre(id)).join(', ')}</span>
                </div>
                <div class="movie-item-line">
                    <label>Vote average</label>
                    <span>${movie.vote_average}</span>
                </div>
                <div class="movie-item-line accordion overview">
                    <label style="width: 100%, text-align: center" for=${movie.id}>Overview</label>
                    <input type="checkbox" id=${movie.id}></input>
                    <span style="width: 100%">${movie.overview}</span>
                </div>
            </div>
        `)
    }
}

customElements.define('movie-card', MovieCard)