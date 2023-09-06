// app styling
import './style.css'

// custom events
import { eventName as SearchQuery } from './src/events/Search/SearchQuery'
import { eventName as RequestMovieDetails } from './src/events/RequestMovieDetails'
import { eventName as CloseOverlay } from './src/events/Overlay/CloseOverlay'
import { eventName as OpenOverlay } from './src/events/Overlay/OpenOverlay'
import { eventName as InfiniteScroll } from './src/events/InfiniteScroll'
import { eventName as ModeUpdate } from './src/events/ModeUpdate'
import { eventName as InitializedApp } from './src/events/InitializedApp'
import { eventName as EndSearchQuery } from './src/events/Search/EndSearchQuery'
import { eventName as UpdatePreference } from './src/events/UpdatePreference'
import { eventName as FilterTag } from './src/events/FilterTag'

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
    onUpdatePreference,
    onFilterTag
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
import './src/components/Filter'

// app html template
document.querySelector('#app').innerHTML = `
    <top-bar>
        <div>
            <div style="min-width: 50%;"><search-bar></search-bar></div>
            <preferences-menu></preferences-menu>
        </div>
    </top-bar>
    <filter-tab></filter-tab>
    <h1 class="main-title">In Theaters</h1>
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

// updated preference
window.addEventListener(UpdatePreference, onUpdatePreference)

// update filter tag
window.addEventListener(FilterTag, onFilterTag)

// cleanup
window.addEventListener('beforeunload', () => {
    window.removeEventListener('load', initializeApp)
    window.removeEventListener(InitializedApp, onInitializedApp)
    window.removeEventListener('scroll', scrolledToBottom)
    window.removeEventListener(InfiniteScroll, onInfiniteScroll)
    window.removeEventListener(ModeUpdate, onModeUpdate)
    window.removeEventListener(CloseOverlay, onCloseOverlay)
    window.removeEventListener(OpenOverlay, onOpenOverlay)
    window.removeEventListener(SearchQuery, onSearchQuery)
    window.removeEventListener(RequestMovieDetails, onRequestMovieDetails)
    window.removeEventListener(UpdatePreference, onUpdatePreference)
    window.removeEventListener(FilterTag, onFilterTag)
})