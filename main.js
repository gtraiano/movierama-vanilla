// app styling
import './style.css'

// store
import store from './src/store/index.js'

// custom events
import { eventName as SearchQuery } from './src/events/SearchQuery'
import { eventName as RequestMovieDetails } from './src/events/RequestMovieDetails'
import { eventName as CloseOverlay } from './src/events/Overlay/CloseOverlay'
import { eventName as OpenOverlay } from './src/events/Overlay/OpenOverlay'
import { eventName as InfiniteScroll } from './src/events/InfiniteScroll'
import { eventName as ModeUpdate } from './src/events/ModeUpdate'

// event handlers
import {
    initializeApp,
    onInitializedApp,
    scrolledToBottom,
    onInfiniteScroll,
    onModeUpdate,
    onOpenOverlay,
    onCloseOverlay,
    onSearchQuery,
    onRequestMovieDetails
} from './src/handlers'

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

// initalize application
window.addEventListener('load', initializeApp)

// render now playing items in movie list after app initalization
window.addEventListener('initializedApp', onInitializedApp)

// scroll
window.addEventListener('scroll', scrolledToBottom)

// infinite scroll
window.addEventListener(InfiniteScroll, onInfiniteScroll)

// app mode switching
window.addEventListener(ModeUpdate, onModeUpdate)

// overlay events
window.addEventListener(CloseOverlay, onCloseOverlay)

window.addEventListener(OpenOverlay, onOpenOverlay)

// search query received
window.addEventListener(SearchQuery, onSearchQuery)

// movie details request
window.addEventListener(RequestMovieDetails, onRequestMovieDetails)
