import { dispatchModeUpdate } from "../events/ModeUpdate";
import { dispatchInitializedApp } from "../events/InitializedApp";

import movieDBAPI from "../controllers/MovieDB";
import appModes, { AdultGenre } from "../constants";
import store from "../store";
import { PREFERENCES } from "../store/preferences";
import { hideAdultPosters, hideAdultResults, infiniteScroll, modeUpdate, searchQuery, setAppMainTitle, switchContentLanguage } from "./util";
import { tags } from "../store/filter";

export { scrolledToBottom, setAppMainTitle } from './util'

 // api request controllers
const searchController = {
    isFetching: false,
    abortController: null
}

const infiniteScrollController = {
    isFetching: false,
    abortController: null
}

const movieDetailsController = {
    isFetching: false,
    abortController: new AbortController()
}

export const initializeApp = async () => {
    try {
        setAppMainTitle()
        // check if api connection is ok
        await movieDBAPI.ping()
        // load preferences from localStorage
        store.preferences.helpers.loadPreferences()
        // set application theme
        document.documentElement.setAttribute('theme', store.preferences.theme)
        // fetch moviedb api configuration
        Object.assign(store.configuration, await movieDBAPI.fetchConfiguration())
        // fetch supported content languages
        Object.assign(store.configuration.languages, (await movieDBAPI.fetchLanguages()).filter(l => l.iso_639_1 !== 'xx'))
        // fetch movie genres
        store.genres.setGenres(await movieDBAPI.fetchGenres())
        store.genres.addGenre(AdultGenre)
        // set movie poster image base width
        store.configuration.helpers.images.posterBaseWidth = store.configuration.helpers.images.gridItemWidth()
        
        // fetch 1st page of in theaters
        document.querySelector('alert-box').loading(true)
        store[store.mode] = await movieDBAPI[store.mode === appModes.NOW_PLAYING ? 'fetchNowPlaying' : 'fetchUpcoming']({
            page: 1
        })
        document.querySelector('alert-box').loading(false)
        dispatchInitializedApp()
    }
    catch(error) {
        document.querySelector('alert-box').showFor(error.message, 3000)
    }
}

export const onInitializedApp = () => {
    // inject supported content languages to menu
    document.querySelector('preferences-menu').injectContentLanguages(store.configuration.languages.sort((a, b) => a.english_name > b.english_name))
    // load preferences to menu
    document.querySelector('preferences-menu').loadPreferences(store.preferences)
    // render now playing first page
    document.querySelector('item-grid').appendItems(store[store.mode])
    // add genre tags to store filter tags and update filter-tab checkboxes
    store.filterTags.helpers.getTag(tags.genre.name).updateLabels(store[store.mode].results)
}

export const onInfiniteScroll = async () => {
    try {
        infiniteScroll(infiniteScrollController)
    }
    catch(error) {
        if(error.name !== 'AbortError' || !(error instanceof DOMException)) {
            document.querySelector('alert-box').showFor(error.message, 3000)
        }
        else {
            console.log(error)
        }
    }
    finally {
        infiniteScrollController.isFetching = false
    }
}

export const onModeUpdate = async (e) => {
    modeUpdate(e.detail)
}

export const onCloseOverlay = () => {
    // abort api calls and recreate abort controller
    movieDetailsController.abortController.abort()
    movieDetailsController.abortController = new AbortController()
    // hide alert
    document.querySelector('alert-box').show(false)
    // hide overlay and show top bar
    document.querySelector('over-lay').closeOverlay()
    document.querySelector('top-bar').classList.add('above')
}

export const onOpenOverlay = () => {
    // hide top bar show overlay
    document.querySelector('top-bar').classList.remove('above')
    document.querySelector('over-lay').openOverlay()
    
}

export const onSearchQuery = async e => {
    try {
        searchQuery({ query: e.detail, searchController })
    }
    catch(error) {
        if(error.name !== 'AbortError' || !(error instanceof DOMException)) {
            document.querySelector('alert-box').showFor(error.message, 3000)
        }
    }
    finally {
        searchController.isFetching = false
        
    }
}

export const onRequestMovieDetails = async e => {
    try {
        // show overlay with loading screen
        document.querySelector('over-lay').openOverlay()
        document.querySelector('over-lay').setAttribute('loading', 'true')

        movieDetailsController.isFetching = true
        
        // fetch all movie details and update store
        store.movieDetails.details = await movieDBAPI.fetchMovieDetails({ movieId: e.detail, signal: movieDetailsController.abortController.signal })
        store.movieDetails.credits = await movieDBAPI.fetchMovieCredits({ movieId: e.detail, signal: movieDetailsController.abortController.signal })
        store.movieDetails.trailers = await movieDBAPI.fetchMovieVideos({ movieId: e.detail, signal: movieDetailsController.abortController.signal })
        store.movieDetails.reviews = await movieDBAPI.fetchMovieReviews({ movieId: e.detail, signal: movieDetailsController.abortController.signal })
        store.movieDetails.similar = await movieDBAPI.fetchMovieSimilar({ movieId: e.detail, signal: movieDetailsController.abortController.signal })

        /*
        // alternative way, tracks errors for each request
        const actions = [
            { name: 'details', callback: async () => await movieDBAPI.fetchMovieDetails({ movieId: e.detail }) },
            { name: 'credits', callback: async () => await movieDBAPI.fetchMovieCredits({ movieId: e.detail }) },
            { name: 'trailers', callback: async () => await movieDBAPI.fetchMovieVideos({ movieId: e.detail }) },
            { name: 'reviews', callback: async () => await movieDBAPI.fetchMovieReviews({ movieId: e.detail }) },
            { name: 'similar', callback: async () => await movieDBAPI.fetchMovieSimilar({ movieId: e.detail }) }
        ]
        const promises = await Promise.allSettled(actions.map(async ({ callback }) => await callback()))
        // log if errors happened
        console.info(`Fetched movie details with${promises.some(({ status }) => status === 'rejected')? '' : 'out'} errors`)
        // log each error
        promises.filter(({ status }, index) => status === 'rejected').forEach(({ reason }) => {
            console.error(`Error in ${actions[index].name}`, reason.message)
        })
        */

        // create movie details element
        const movieDetails = document.createElement('movie-details')
        movieDetails.render(store.movieDetails)
        
        // display in overlay
        document.querySelector('over-lay').updateContent(movieDetails)
    }
    catch(error) {
        // display NON abort errors in alert-box
        if(error.name !== 'AbortError' || !(error instanceof DOMException)) {
            document.querySelector('alert-box').showFor(error.message, 3000)
        }
    }
    finally {
        movieDetailsController.isFetching = false
        // stop overlay loading screen
        document.querySelector('over-lay').removeAttribute('loading')
    }
}

export const onEndSearchQuery = () => {
    // end search query when displaying in theaters should do nothing
    if(store.mode === appModes.NOW_PLAYING) return;
    // stop search query in progress
    if(searchController.abortController) {
        searchController.abortController.abort()
    }
    // clear stored query text and search results
    store.searchQuery.query = ''
    store.search = {}
    // retrieve previous app mode
    dispatchModeUpdate(document.querySelector('browse-mode').getActiveMode())
}

export const onSearchTypeChange = (e) => {
    store.searchQuery.type = e.detail
}

export const onUpdatePreference = async (e) => {
    // apply filter to adult posters
    if(e.detail === PREFERENCES.PREVIEW_ADULT_POSTER) {
        hideAdultPosters()
    }
    // filter adult results
    else if(e.detail === PREFERENCES.INCLUDE_ADULT_SEARCH) {
        hideAdultResults()
    }
    // theme color
    else if(e.detail === PREFERENCES.THEME) {
        document.documentElement.setAttribute('theme', store.preferences.theme)
    }

    else if(e.detail === PREFERENCES.CONTENT_LANGUAGE) {
        switchContentLanguage()
    }
}

export const onFilterTag = e => {
    if(e.detail.name) {
        store.filterTags.helpers.setTag(e.detail)
        store.filterTags.helpers.getTag(e.detail.name).applyFilter()
    }
}