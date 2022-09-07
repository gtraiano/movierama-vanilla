import { dispatchInfiniteScroll } from "../events/InfiniteScroll";
import { dispatchModeUpdate } from "../events/ModeUpdate";
import { dispatchInitializedApp } from "../events/InitializedApp";

import movieDBAPI from "../controllers/MovieDB";
import appModes from "../constants/AppModes";
import store from "../store";

const searchController = {
    isFetching: false,
    abortController: null
}
const infiniteScrollController = {
    isFetching: false,
    abortController: null
}

export const initializeApp = async () => {
    try {
        // check if api connection is ok
        await movieDBAPI.ping()
        // load preferences from localStorage
        store.preferences.helpers.loadPreferences()
        // set application theme
        document.documentElement.setAttribute('theme', store.preferences.theme)
        // fetch moviedb api configuration
        Object.assign(store.configuration, await movieDBAPI.fetchConfiguration())
        // fetch movie genres
        store.genres.table = await movieDBAPI.fetchGenres()
   
        // fetch 1st page of in theaters
        document.getElementsByTagName('alert-box')[0].loading(true)
        store.nowPlaying = await movieDBAPI.fetchNowPlaying({
            page: 1
        })
        document.getElementsByTagName('alert-box')[0].loading(false)
        dispatchInitializedApp()
    }
    catch(error) {
        document.getElementsByTagName('alert-box')[0].show(true, error.message)
        setTimeout(() => document.getElementsByTagName('alert-box')[0].show(false), 3000)   
    }
}

export const onInitializedApp = () => {
    // load preferences to menu
    document.getElementsByTagName('preferences-menu')[0].loadPreferences(store.preferences)
    // render now playing first page
    document.getElementsByTagName('movie-list')[0].appendMovieCards(store.nowPlaying)
}

export const scrolledToBottom = () => {
    const {
        scrollTop,
        scrollHeight,
        clientHeight
    } = document.documentElement;

    // just a little before page bottom
    if(scrollTop + clientHeight >= scrollHeight - 2) {
        dispatchInfiniteScroll()
    }
}

export const onInfiniteScroll = async () => {
    try {
        // part of store to use
        const mode = store.mode === appModes.NOW_PLAYING ? 'nowPlaying' : 'search'
        // movieDBAPI fetcher to use
        const fetcher = store.mode === appModes.NOW_PLAYING ? movieDBAPI.fetchNowPlaying : movieDBAPI.fetchMovie
    
        // prevent requests if we have fetched all pages
        if(Object.keys(store[mode]).length && store[mode]?.page === store[mode]?.total_pages) {
            document.getElementsByTagName('alert-box')[0].show(true, 'Last page')
            setTimeout(() => document.getElementsByTagName('alert-box')[0].show(false), 750)
            return
        }

        // check if fetcher is already busy
        if(infiniteScrollController.abortController) {
            infiniteScrollController.abortController.abort('onInfiniteScroll is already fetching next page')
        }
        infiniteScrollController.abortController = new AbortController()
        infiniteScrollController.isFetching = true

        // show fetching alert
        document.getElementsByTagName('alert-box')[0].loading(true)
        const nextPage = await fetcher({
            page: (store[mode]?.page ?? 0) + 1,
            ...(store.mode === appModes.SEARCH && { query: store.query }), // query only necessary for search
            signal: infiniteScrollController.abortController.signal
        })
        // update results
        if(!infiniteScrollController.abortController.signal.aborted) {
            store[mode] = {
                ...store[mode],
                ...nextPage,
                results: [...(store[mode]?.results ?? []), ...nextPage.results]
            }
        
            // append new page items to movie list
            document.getElementsByTagName('movie-list')[0].appendMovieCards(nextPage)
        }
        document.getElementsByTagName('alert-box')[0].loading(false)
    }
    catch(error) {
        if(error.name !== 'AbortError' || !(error instanceof DOMException)) {
            document.getElementsByTagName('alert-box')[0].show(true, error.message)
            setTimeout(() => document.getElementsByTagName('alert-box')[0].show(false), 3000)
        }
    }
    finally {
        infiniteScrollController.isFetching = false
    }
}

export const onModeUpdate = (e) => {
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
}

export const onCloseOverlay = () => {
    // hide alert
    document.getElementsByTagName('alert-box')[0].show(false)
    // restore body overflow and hide overlay
    document.body.style.overflow = 'visible'
    document.getElementsByTagName('over-lay')[0].removeAttribute('show')
    document.getElementsByTagName('top-bar')[0].classList.add('above')
}

export const onOpenOverlay = () => {
    // hide body overflow and display overlay
    document.body.style.overflow = 'hidden'
    document.getElementsByTagName('top-bar')[0].classList.remove('above')
    document.getElementsByTagName('over-lay')[0].setAttribute('show', '')
    
}

export const onSearchQuery = async e => {
    try {
        // signal app mode change
        store.mode = appModes.SEARCH
        dispatchModeUpdate(appModes.SEARCH)
        // update store
        store.query = e.detail

        // show alert box while search runs
        document.getElementsByTagName('alert-box')[0].show(true, 'Searching')
        if(searchController.abortController) {
            searchController.abortController.abort()
        }
        searchController.abortController = new AbortController()
        store.search = await movieDBAPI.fetchMovie({
            query: store.query,
            signal: searchController.abortController.signal
        })
        // render search results in movie list
        document.getElementsByTagName('movie-list')[0].clear()
        document.getElementsByTagName('movie-list')[0].appendMovieCards(store.search)
        window.scrollTo(0,0)
        // hide alert box after cards have been rendered
        document.getElementsByTagName('alert-box')[0].show(false)
    }
    catch(error) {
        if(error.name !== 'AbortError' || !(error instanceof DOMException)) {
            document.getElementsByTagName('alert-box')[0].show(true, error.message)
            setTimeout(() => document.getElementsByTagName('alert-box')[0].show(false), 3000)
        }
    }
}

export const onRequestMovieDetails = async e => {
    // show overlay with loading screen
    document.getElementsByTagName('over-lay')[0].openOverlay()
    document.getElementsByTagName('over-lay')[0].setAttribute('loading', 'true')
    
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
    // stop overlay loading screen
    document.getElementsByTagName('over-lay')[0].removeAttribute('loading')
}

export const onEndSearchQuery = () => {
    // end search query when displaying in theaters should do nothing
    if(store.mode === appModes.NOW_PLAYING) return;
    // clear stored query text and search results
    store.query = ''
    store.search = {}
    // update app mode
    dispatchModeUpdate(appModes.NOW_PLAYING)
}

export const onUpdatePreference = (e) => {
    // update search bar query debounce delay
    if(e.detail === 'searchQueryDebounce') {
        document.getElementsByTagName('search-bar')[0].setDelay(store.preferences.searchQueryDebounce)
    }
    // apply filter to adult posters
    else if(e.detail === 'previewAdultPoster') {
        document.querySelectorAll('.adult .poster > img').forEach(img => {
            img.classList.toggle('adult')
        })
    }
    // filter adult results
    else if(e.detail === 'includeAdultSearch') {
        document.querySelectorAll('movie-card.adult').forEach(c => {
            c.style.display = store.preferences.includeAdultSearch ? '' : 'none'
        })
    }
    // theme color
    else if(e.detail === 'theme') {
        document.documentElement.setAttribute('theme', store.preferences.theme)
    }
}