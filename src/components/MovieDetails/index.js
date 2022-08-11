import { dispatchRequestMovieDetails } from '../../events/RequestMovieDetails'
import './style.css'

class MovieDetails extends HTMLElement {
    constructor() {
        super()
    }

    render = ({ details, credits, trailers, reviews, similar }) => {
        //this.classList.add('movie-details')
        this.innerHTML = this.generateTemplate(details, trailers, credits, reviews, similar)
        this.children[0].style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${details.backdrop_path})`
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
        return (
            `
            <section>
                <iframe width="560" height="315" src="https://www.youtube.com/embed/${videos?.results[0]?.key}?html5=1}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allow-full-screen></iframe>
            </section>
            `
        )
    }

    generateCredits(movie, credits) {
        return (
            `
            <section style="width: 25%;">
                <div class="row">
                    <div style="width: 25%" class="column left"><strong>Released</strong></div>
                    <div style="width: 70%" class="column left">${movie.release_date}</div>
                </div>
                <div class="row">
                    <div style="width: 25%" class="column left"><strong>Producers</strong></div>
                    <div style="width: 70%" class="column left">
                        <ul style="margin: 0; padding: 0; list-style: none; text-align: left;">
                            ${movie.production_companies.map(c => `<li>${c.name}${c.origin_country ? ' ('+c.origin_country+')' : ''}</li>`).join('\n')}
                        </ul>
                    </div>
                </div>
                <div class="row">
                    <div style="width: 25%;" class="column left"><strong>Genres</strong></div>
                        <div style="width: 70%;" class="column left">
                            <ul style="margin: 0; padding: 0; list-style: none; text-align: left;">
                                ${movie.genres.map(g => `<li>${g.name}</li>`).join('\n')}
                            </ul>
                        </div>
                    </div>
                    <div class="row">
                        <div style="width: 25%;" class="column left"><strong>Director</strong></div>
                        <div style="width: 70%;" class="column left">
                            ${credits?.crew.find(c => c.job.toLowerCase() === 'director')?.name}
                        </div>
                    </div>
                    <div class="row">
                        <div style="width: 25%;" class="column left"><strong>Starring</strong></div>
                        <div style="width: 70%;" class="column left">
                            <ul style="margin: 0; padding: 0; list-style: none; text-align: left;">
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
                            </span> (${s.release_date.slice(0,4)})
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
                                    ${r.content}
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
            <h1>${movie.title}</h1>
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