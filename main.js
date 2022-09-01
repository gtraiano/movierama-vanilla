// app styling
import './style.css'

import store from './src/store'

// custom events
import { eventName as SearchQuery } from './src/events/Search/SearchQuery'
import { eventName as RequestMovieDetails } from './src/events/RequestMovieDetails'
import { eventName as CloseOverlay } from './src/events/Overlay/CloseOverlay'
import { eventName as OpenOverlay } from './src/events/Overlay/OpenOverlay'
import { eventName as InfiniteScroll } from './src/events/InfiniteScroll'
import { eventName as ModeUpdate } from './src/events/ModeUpdate'
import { eventName as InitializedApp } from './src/events/InitializedApp'
import { eventName as EndSearchQuery } from './src/events/Search/EndSearchQuery'

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
    onRequestMovieDetails,
    onEndSearchQuery,
    onUpdatePreference
} from './src/handlers'

// custom elements
import './src/components/SearchBar/'
import './src/components/Overlay'
import './src/components/MovieList'
import './src/components/MovieCard'
import './src/components/MovieDetails'
import './src/components/AlertBox'
import './src/components/TopBar'
import './src/components/PreferencesMenu'

// app html template
document.querySelector('#app').innerHTML = `
    <top-bar>
        <div>
            <div style="min-width: 50%;"><search-bar></search-bar></div>
            <preferences-menu></preferences-menu>
        </div>
    </top-bar>
    <h1>In Theaters</h1>
    <movie-list></movie-list>
    <over-lay></over-lay>
    <alert-box></alert-box>
`

// initalize application
window.addEventListener('load', initializeApp)

// render now playing items in movie list after app initalization
window.addEventListener(InitializedApp, onInitializedApp)

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
// search query ended
window.addEventListener(EndSearchQuery, onEndSearchQuery)

// movie details request
window.addEventListener(RequestMovieDetails, onRequestMovieDetails)

window.addEventListener('beforeunload', () => {
    window.addEventListener('load', initializeApp)
    window.addEventListener(InitializedApp, onInitializedApp)
    window.addEventListener('scroll', scrolledToBottom)
    window.addEventListener(InfiniteScroll, onInfiniteScroll)
    window.addEventListener(ModeUpdate, onModeUpdate)
    window.addEventListener(CloseOverlay, onCloseOverlay)
    window.addEventListener(OpenOverlay, onOpenOverlay)
    window.addEventListener(SearchQuery, onSearchQuery)
    window.addEventListener(RequestMovieDetails, onRequestMovieDetails)
})

// updated preference
window.addEventListener('updatepreference', onUpdatePreference)