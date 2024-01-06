import { dispatchRequestMovieDetails } from '../../events/RequestMovieDetails'
import store from '../../store'
import './style.css'

class MovieDetails extends HTMLElement {
    constructor() {
        super()
    }

    render = ({ details, credits, trailers, reviews, similar }) => {
        this.innerHTML = this.generateTemplate(details, trailers, credits, reviews, similar)
        //this.children[0].style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${details.backdrop_path})`
        this.children[0].style.backgroundImage = `image-set(${store.configuration.helpers.images.generateBackdropUrls(details.backdrop_path ?? details.poster_path).join(',')})`
        Array.from(this.querySelectorAll('.movies-similar-entry')).forEach((e,i) => {
            e.addEventListener('click', this.requestMovieDetails(similar.results[i].id))
        })
    }

    requestMovieDetails = (id) => (e) => dispatchRequestMovieDetails(id)

    connectedCallback() {
    }

    disconnectedCallback() {
        Array.from(this.querySelectorAll('.movies-similar-entry')).forEach((e,i) => {
            e.removeEventListener('click', this.requestMovieDetails)
        })
    }

    generateTrailer(videos) {
        const trailer = videos.results.filter(v => v.type === 'Trailer' && v.site === 'YouTube')[0]?.key;
        return (
            `
            <section>
                ${
                    trailer
                    ? `<iframe class="movie-trailer" width="560" height="315" src="https://www.youtube.com/embed/${trailer}?html5=1}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allow-full-screen></iframe>`
                    : '<div class="movie-trailer"></div>' // empty div
                }
                
            </section>
            `
        )
    }

    generateCredits(movie, credits) {
        return (
            `
            <section class="movie-credits">
                <div class="row">
                    <div class="column left"><strong>Released</strong></div>
                    <div class="column left">${movie.release_date}</div>
                </div>
                <div class="row">
                    <div class="column left"><strong>Producers</strong></div>
                    <div class="column left">
                        <ul class="horizontal">
                            ${movie.production_companies.map(c => `<li>${c.name}${c.origin_country ? ' ('+c.origin_country+')' : ''}</li>`).join('\n')}
                        </ul>
                    </div>
                </div>
                <div class="row">
                    <div class="column left"><strong>Genres</strong></div>
                        <div class="column left">
                            <ul class="horizontal">
                                ${movie.genres.map(g => `<li>${g.name}</li>`).join('\n')}
                            </ul>
                        </div>
                    </div>
                    <div class="row">
                        <div class="column left"><strong>Director</strong></div>
                        <div class="column left">
                            ${credits?.crew.find(c => c.job.toLowerCase() === 'director')?.name ?? ''}
                        </div>
                    </div>
                    <div class="row">
                        <div class="column left"><strong>Starring</strong></div>
                        <div class="column left">
                            <ul class="horizontal">
                                ${credits?.cast.slice(0, 3).map(a => `<li>${a.name}</li>`).join('\n')}
                            </ul>
                        </div>
                    </div>
                </section>
            `
        )
    }

    generateSimilar(similar) {
        return `
            <section class="movies-similar">
                <h2>Similar movies</h2>
                <ul>
                    ${
                        similar?.results.map((s, i) => (
                            `<li>
                                <span
                                    class="movies-similar-entry"
                                >
                                    ${s.title}
                                </span> ${s.release_date ? `(${s.release_date.slice(0,4)})` : ''}
                            </li>`
                        )).join('\n')
                    }
                </ul>
            </section>
        `
    }

    generateOverview(movie) {
        return `
            <section class="movie-overview">
                <h2>Overview</h2>
                <div>${movie.overview}</div>
            </section>
        `
    }

    generateReviews(reviews) {
        const sanitize = (input) => {
            const e = document.createElement('div')
            e.innerText = input
            return e.innerHTML
        }
        return `
            <section class="movie-reviews-container">
                <h2>Reviews</h2>
                ${
                    reviews?.results.length
                    ?
                        reviews?.results
                            ?.slice(0, 2)
                            .map((r, i) => (
                                `<blockquote class="movie-review">
                                    ${sanitize(r.content)}
                                </blockquote>
                                <span>by <em>${r.author}</em></span>`
                            )).join('\n')
                    :  
                        `<span>No reviews listed</span>`
                }
            </section>
        `
    }

    generateTemplate(movie, videos, credits, reviews, similar) {
        return `
        <div class="movie-details">
            <h1 class="main-title">${movie.title}</h1>
            ${this.generateTrailer(videos)}
            ${this.generateCredits(movie, credits)}
            ${this.generateOverview(movie)}
            ${this.generateReviews(reviews)}
            ${this.generateSimilar(similar)}
        </div>
        `
    }
}

customElements.define('movie-details', MovieDetails)