// app styling
import './style.css'
import './App.css'

// constants
import appModes from './src/constants/AppModes'

// store
import store from './src/store/index.js'

// controllers
import movieDBAPI from './src/controllers/MovieDB'

// custom events
import { eventName as SearchQuery } from './src/events/SearchQuery'
import { dispatchInfiniteScroll, eventName as InfiniteScroll } from './src/events/InfiniteScroll'
import { dispatchModeUpdate, eventName as ModeUpdate } from './src/events/ModeUpdate'
import { eventName as RequestMovieDetails } from './src/events/RequestMovieDetails'
import { eventName as CloseOverlay } from './src/events/Overlay/CloseOverlay'
import { dispatchOpenOverlay, eventName as OpenOverlay } from './src/events/Overlay/OpenOverlay'

// custom elements
import {} from './src/components/SearchBar/'
import {} from './src/components/Overlay'
import {} from './src/components/MovieList'
import {} from './src/components/MovieCard'
import {} from './src/components/MovieDetails'

// app html template
document.querySelector('#app').innerHTML = `
    <h1>In Theaters</h1>
    <search-bar></search-bar>
    <movie-list></movie-list>
    <over-lay><over-lay>
`

const initializeApp = async () => {
    store.configuration = await movieDBAPI.fetchConfiguration()
    store.genres = await movieDBAPI.fetchGenres()
    store.nowPlaying = await movieDBAPI.fetchNowPlaying({
        page: store.currentPage
    })
    dispatchEvent(new Event('initializedApp'))
}

const scrolledToBottom = () => {
    const {
      scrollTop,
      scrollHeight,
      clientHeight
    } = document.documentElement;

    // just a little before page bottom
    if (scrollTop + clientHeight >= scrollHeight - 2) {
        dispatchInfiniteScroll()
    }
}

// initalize application
window.addEventListener('load', initializeApp)

// render now playing items in movie list after app initalization
window.addEventListener('initializedApp', () => {
    // target div inside movie-list
    document.getElementsByTagName('movie-list')[0].appendMovieCards(store.nowPlaying)
})

// scroll
window.addEventListener('scroll', scrolledToBottom)

// infinite scroll
window.addEventListener(InfiniteScroll, async e => {
    let nextPage
    // update respective store based on app mode
    if(store.mode === appModes.NOW_PLAYING) {
        nextPage = await movieDBAPI.fetchNowPlaying({
            page: (store.nowPlaying?.page ?? 0) + 1
        })
        store.nowPlaying = {
            ...store.nowPlaying,
            ...nextPage,
            results: [...store.nowPlaying.results, ...nextPage.results]
        }
    }
    
    else if(store.mode === appModes.SEARCH) {
        nextPage = await movieDBAPI.fetchMovie({
            query: store.query,
            page: (store.search.page ?? 0) + 1
        })

        store.search = {
            ...store.search,
            ...nextPage,
            results: [...store.search.results, ...nextPage.results]
        }
    }
    // append new page items to movie list
    document.getElementsByTagName('movie-list')[0].appendMovieCards(nextPage)
})

// app mode switching
window.addEventListener(ModeUpdate, e => {
    store.mode = e.detail
    // clear movie list items
    document.getElementsByTagName('movie-list')[0].clear()
    
    // when returning from search mode
    if(store.mode === appModes.NOW_PLAYING) {
        // render now playing items in movie list
        document.getElementsByTagName('movie-list')[0].appendMovieCards(store.nowPlaying)
    }
    
    // update page header
    document.querySelector('#app h1').textContent = store.mode === appModes.NOW_PLAYING ? 'In Theaters' : 'Search'
    window.scrollTo(0, 0)
})

// overlay events
window.addEventListener(CloseOverlay, e => {
    console.log(CloseOverlay)
    // restore body overflow and hide overlay
    document.querySelector('over-lay').style.display = 'none'
    document.body.style.overflow = 'visible'
})

window.addEventListener(OpenOverlay, () => {
    console.log(OpenOverlay)
    // hide body overflow and display overlay
    document.querySelector('over-lay').style.display = 'block'
    document.body.style.overflow = 'hidden'
})

// search query received
window.addEventListener(SearchQuery, async e => {
    // signal app mode change
    store.mode = appModes.SEARCH
    dispatchModeUpdate(appModes.SEARCH)
    // update store
    store.query = e.detail
    store.search = await movieDBAPI.fetchMovie({
        query: store.query
    })
    // render search results in movie list
    document.getElementsByTagName('movie-list')[0].clear()
    document.getElementsByTagName('movie-list')[0].appendMovieCards(store.search)
    window.scrollTo(0,0)
})

// movie details request
window.addEventListener(RequestMovieDetails, async e => {
    console.log('request movie detail for', e.detail)
    // fetch all movie details and update store
    store.movieDetails.details = await movieDBAPI.fetchMovieDetails({ movieId: e.detail })
    store.movieDetails.credits = await movieDBAPI.fetchMovieCredits({ movieId: e.detail })
    store.movieDetails.trailers = await movieDBAPI.fetchMovieVideos({ movieId: e.detail })
    store.movieDetails.reviews = await movieDBAPI.fetchMovieReviews({ movieId: e.detail })
    store.movieDetails.similar = await movieDBAPI.fetchMovieSimilar({ movieId: e.detail })

    // create movie details element
    const movieDetails = document.createElement('movie-details')
    movieDetails.render(store.movieDetails)
    // display in overlay
    document.getElementsByTagName('over-lay')[0].updateContent(movieDetails)
    dispatchOpenOverlay()
})
