import { dispatchModeUpdate } from "../events/ModeUpdate";
import { dispatchInitializedApp } from "../events/InitializedApp";

import movieDBAPI from "../controllers/MovieDB";
import appModes, { browseModes } from "../constants/AppModes";
import store from "../store";
import { PREFERENCES } from "../store/preferences";
import { fetchNextPageFromAPI, setAppMainTitle } from "./util";

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
        store.genres.table = await movieDBAPI.fetchGenres()
        
        // fetch 1st page of in theaters
        document.getElementsByTagName('alert-box')[0].loading(true)
        store[store.mode] = await movieDBAPI[store.mode === appModes.NOW_PLAYING ? 'fetchNowPlaying' : 'fetchUpcoming']({
            page: 1
        })
        document.getElementsByTagName('alert-box')[0].loading(false)
        dispatchInitializedApp()
    }
    catch(error) {
        document.getElementsByTagName('alert-box')[0].showFor(error.message, 3000)
    }
}

export const onInitializedApp = () => {
    // inject supported content languages to menu
    document.getElementsByTagName('preferences-menu')[0].injectContentLanguages(store.configuration.languages.sort((a, b) => a.english_name > b.english_name))
    // load preferences to menu
    document.getElementsByTagName('preferences-menu')[0].loadPreferences(store.preferences)
    // render now playing first page
    document.getElementsByTagName('movie-list')[0].appendMovieCards(store[store.mode])
    // add genre tags to store filter tags and update filter-tab checkboxes
    store.filterTags.helpers.getTag('genre').updateLabels(store[store.mode].results)
    document.getElementsByTagName('filter-tab')[0].insertTags(store.filterTags.tags)
}

export const onInfiniteScroll = async () => {
    try {
        // prevent infinite scroll behaviour when filtering is active
        if(store.filterTags.helpers.isActive()) throw Error('Will not fetch further results while filter is active')
        
        // part of store to use
        const mode = store.mode
    
        // prevent requests if we have fetched all pages
        if(store[mode].page && store[mode].page === store[mode].total_pages) {
            document.getElementsByTagName('alert-box')[0].showFor('Last page', 750)
            return
        }

        // show fetching alert
        document.getElementsByTagName('alert-box')[0].loading(true)
        const nextPage = await fetchNextPageFromAPI(mode, infiniteScrollController)
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
        
        // add new genre tags to store filter tags and update filter-tab checkboxes
        store.filterTags.helpers.getTag('genre').updateLabels(store[mode].results)
        //document.getElementsByTagName('filter-tab')[0].insertTags(store.filterTags.tags)
    }
    catch(error) {
        if(error.name !== 'AbortError' || !(error instanceof DOMException)) {
            document.getElementsByTagName('alert-box')[0].showFor(error.message, 3000)
        }
    }
    finally {
        infiniteScrollController.isFetching = false
    }
}

export const onModeUpdate = async (e) => {
    store.mode = e.detail
    // on entering search mode, disable navigation menu
    document.querySelector('browse-mode')[e.detail === appModes.SEARCH ? 'disable' : 'enable']()

    // clear movie list items
    document.getElementsByTagName('movie-list')[0].clear()
    
    // update page header
    setAppMainTitle()
    window.scrollTo(0, 0)

    // clear filter-tab tags and title
    store.filterTags.helpers.getTag('genre').boxes = []
    store.filterTags.helpers.getTag('title').value = ''
    document.getElementsByTagName('filter-tab')[0].clearTag('title')
    
    // restore app mode tags (other than search)
    if(browseModes.includes(store.mode)) {
        // fetch results from API if we have none in store
        if(!store[store.mode].results.length) {
            // show fetching alert
            document.getElementsByTagName('alert-box')[0].loading(true)
            const nextPage = await fetchNextPageFromAPI(store.mode, infiniteScrollController)
            // update results
            store[store.mode] = {
                ...store[store.mode],
                ...nextPage,
                results: [...(store[store.mode]?.results ?? []), ...nextPage.results]
            }
            document.getElementsByTagName('alert-box')[0].loading(false)
        }
        // render now playing items in movie list
        document.getElementsByTagName('movie-list')[0].appendMovieCards(store[store.mode])
        // update filter in store and filter-tab
        store.filterTags.helpers.getTag('genre').updateLabels(store[store.mode].results)
        document.getElementsByTagName('filter-tab')[0].clearTag('genre')
        store.filterTags.helpers.getTag('genre').boxes.forEach(b => {
            document.getElementsByTagName('filter-tab')[0].appendToTag('genre', b.label)    
        })
    }
}

export const onCloseOverlay = () => {
    // abort api calls and recreate abort controller
    movieDetailsController.abortController.abort()
    movieDetailsController.abortController = new AbortController()
    // hide alert
    document.getElementsByTagName('alert-box')[0].show(false)
    // hide overlay and show top bar
    document.getElementsByTagName('over-lay')[0].closeOverlay()
    document.getElementsByTagName('top-bar')[0].classList.add('above')
}

export const onOpenOverlay = () => {
    // hide top bar show overlay
    document.getElementsByTagName('top-bar')[0].classList.remove('above')
    document.getElementsByTagName('over-lay')[0].openOverlay()
    
}

export const onSearchQuery = async e => {
    try {
        // signal app mode change
        dispatchModeUpdate(appModes.SEARCH)
        // update store
        //store.query = e.detail
        store.searchQuery = e.detail

        // show alert box while search runs
        document.getElementsByTagName('alert-box')[0].show(true, 'Searching')
        if(searchController.abortController) {
            searchController.abortController.abort()
        }
        searchController.abortController = new AbortController()
        searchController.isFetching = true
        store.search = await movieDBAPI.fetchMovie({
            //query: store.query,
            query: store.searchQuery.query,
            signal: searchController.abortController.signal
        })
        // render search results in movie list
        document.getElementsByTagName('movie-list')[0].clear()
        document.getElementsByTagName('movie-list')[0].appendMovieCards(store.search)
        window.scrollTo(0,0)
        // hide alert box after cards have been rendered
        document.getElementsByTagName('alert-box')[0].show(false)

        // clear filter title
        document.getElementsByTagName('filter-tab')[0].clearTag('title')
        // init fresh tags
        //store.filterTags.helpers.getTag('genre').boxes = []
        store.filterTags.helpers.getTag('genre').updateLabels(store.search.results)

        document.getElementsByTagName('filter-tab')[0].clearTag('genre')
        store.filterTags.helpers.getTag('genre').boxes.forEach(b => {
            document.getElementsByTagName('filter-tab')[0].appendToTag('genre', b.label)    
        })
    }
    catch(error) {
        if(error.name !== 'AbortError' || !(error instanceof DOMException)) {
            document.getElementsByTagName('alert-box')[0].showFor(error.message, 3000)
        }
    }
    finally {
        searchController.isFetching = false
    }
}

export const onRequestMovieDetails = async e => {
    try {
        // show overlay with loading screen
        document.getElementsByTagName('over-lay')[0].openOverlay()
        document.getElementsByTagName('over-lay')[0].setAttribute('loading', 'true')

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
        document.getElementsByTagName('over-lay')[0].updateContent(movieDetails)
    }
    catch(error) {
        // display NON abort errors in alert-box
        if(error.name !== 'AbortError' || !(error instanceof DOMException)) {
            document.getElementsByTagName('alert-box')[0].showFor(error.message, 3000)
        }
    }
    finally {
        movieDetailsController.isFetching = false
        // stop overlay loading screen
        document.getElementsByTagName('over-lay')[0].removeAttribute('loading')
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
    //store.query = ''
    //store.searchQuery = { query: '', type: '' }
    store.search = {}
    // retrieve previous app mode
    dispatchModeUpdate(document.querySelector('browse-mode').getActiveMode())
}

export const onSearchTypeChange = (e) => {
    store.searchQuery.type = e.detail.type
    console.log(store.searchQuery)
}

export const onUpdatePreference = async (e) => {
    // apply filter to adult posters
    if(e.detail === PREFERENCES.PREVIEW_ADULT_POSTER) {
        document.querySelectorAll('.adult .poster > img').forEach(img => {
            img.classList.toggle('adult')
        })
    }
    // filter adult results
    else if(e.detail === PREFERENCES.INCLUDE_ADULT_SEARCH) {
        document.querySelectorAll('movie-card.adult').forEach(c => {
            c.style.display = store.preferences.includeAdultSearch ? '' : 'none'
        })
    }
    // theme color
    else if(e.detail === PREFERENCES.THEME) {
        document.documentElement.setAttribute('theme', store.preferences.theme)
    }

    else if(e.detail === PREFERENCES.CONTENT_LANGUAGE) {
        // alert for change
        document.getElementsByTagName('alert-box')[0].show(true, 'switching content language')
        // update store genres strings
        store.genres.table = await movieDBAPI.fetchGenres()
        // update all movie-card's content in new language
        document.querySelectorAll('movie-card').forEach(async mc => {
            const content = await movieDBAPI.fetchMovieDetails({ movieId: mc.getAttribute('movie-id')})
            mc.updateCard(content)
        })
        // remove genre labels from store filter and insert fresh ones
        store.filterTags.helpers.clearGenreLabels()
        store.filterTags.helpers.getTag('genre').updateLabels(store[store.mode].results)
        // remove all genre tags from filter-tab and insert fresh ones
        document.getElementsByTagName('filter-tab')[0].clearAllTags()
        document.getElementsByTagName('filter-tab')[0].insertTags(store.filterTags.tags)
        // hide alert
        document.getElementsByTagName('alert-box')[0].show(false)
    }
}

export const onFilterTag = e => {
    //if(e.name === undefined) return
    if(e.detail.name === 'title') {
        //if(e.detail.value === '') return
        store.filterTags.helpers.setTag(e.detail)
        store.filterTags.helpers.getTag('title').applyFilter()
    }
    else if(e.detail.name === 'genre') {
        store.filterTags.helpers.setTag(e.detail)
        store.filterTags.helpers.getTag('genre').applyFilter()
    }
    
}