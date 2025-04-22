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
import { eventName as ChangeSearchType } from './src/events/Search/ChangeSearchType'

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
    onFilterTag,
    onSearchTypeChange
} from './src/handlers'

// custom elements
import './src/components/SearchBar/'
import './src/components/Overlay'
import './src/components/ItemGrid'
import './src/components/MovieCard'
import './src/components/MovieDetails'
import './src/components/AlertBox'
import './src/components/TopBar'
import './src/components/PreferencesMenu'
import './src/components/Filter'
import './src/components/BrowseMode'
import './src/components/PersonCard'
import { stringTemplateToFragment } from './src/components/util'
import './src/components/Spinner/'

const template =
`
<top-bar>
    <div>
        <browse-mode></browse-mode>
        <div><search-bar></search-bar></div>
        <preferences-menu></preferences-menu>
        <span class="tmdb-attribution">
            <a href="https://developer.themoviedb.org" referrerpolicy="no-referrer" target="_blank"><img src="https://files.readme.io/29c6fee-blue_short.svg"></a>
        </span>
    </div>
</top-bar>
<filter-tab></filter-tab>
<h1 class="main-title"></h1>
<item-grid></item-grid>
<over-lay></over-lay>
<alert-box></alert-box>
`

// app html template
document.querySelector('#app').append(stringTemplateToFragment(template))

// initalize application
window.addEventListener('load', initializeApp)

// render now playing items in movie list after app initalization
document.addEventListener(InitializedApp, onInitializedApp)

// scroll
document.addEventListener('scrollend', scrolledToBottom)

// infinite scroll
document.addEventListener(InfiniteScroll, onInfiniteScroll)

// app mode switching
document.addEventListener(ModeUpdate, onModeUpdate)

// overlay events
document.addEventListener(CloseOverlay, onCloseOverlay)
document.addEventListener(OpenOverlay, onOpenOverlay)

// search query received
document.addEventListener(SearchQuery, onSearchQuery)
// search query ended
document.addEventListener(EndSearchQuery, onEndSearchQuery)
// search type changed
document.addEventListener(ChangeSearchType, onSearchTypeChange)

// movie details request
document.addEventListener(RequestMovieDetails, onRequestMovieDetails)

// updated preference
document.addEventListener(UpdatePreference, onUpdatePreference)

// update filter tag
document.addEventListener(FilterTag, onFilterTag)

// cleanup
window.addEventListener('beforeunload', () => {
    window.removeEventListener('load', initializeApp)
    /*window.removeEventListener(InitializedApp, onInitializedApp)
    window.removeEventListener('scroll', scrolledToBottom)
    window.removeEventListener(InfiniteScroll, onInfiniteScroll)
    window.removeEventListener(ModeUpdate, onModeUpdate)
    window.removeEventListener(CloseOverlay, onCloseOverlay)
    window.removeEventListener(OpenOverlay, onOpenOverlay)
    window.removeEventListener(SearchQuery, onSearchQuery)
    window.removeEventListener(RequestMovieDetails, onRequestMovieDetails)
    window.removeEventListener(UpdatePreference, onUpdatePreference)
    window.removeEventListener(FilterTag, onFilterTag)*/
})