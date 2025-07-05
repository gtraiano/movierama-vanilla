import { dispatchModeUpdate } from "../events/ModeUpdate";
import { dispatchInitializedApp } from "../events/InitializedApp";

import movieDBAPI from "../controllers/MovieDB";
import appModes, { AdultGenre, browseModes, searchTypes } from "../constants";
import store from "../store";
import { PREFERENCES } from "../store/preferences";
import { fetchNextPageFromAPI, setAppMainTitle } from "./util";
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
        // prevent infinite scroll behaviour when filtering is active
        if(store.filterTags.helpers.isActive()) throw Error('Will not fetch further results while filter is active')
        
        // part of store to use
        const mode = store.mode
    
        // prevent requests if we have fetched all pages
        if(store[mode].page && store[mode].page === store[mode].total_pages) {
            document.querySelector('alert-box').showFor('Last page', 750)
            return
        }

        // show fetching alert
        document.querySelector('alert-box').loading(true)
        const nextPage = await fetchNextPageFromAPI(mode, infiniteScrollController)
        // update results
        if(!infiniteScrollController.abortController.signal.aborted) {
            store[mode] = {
                ...store[mode],
                ...nextPage,
                results: [...(store[mode]?.results ?? []), ...nextPage.results]
            }
            // append new page items to movie list
            document.querySelector('item-grid').appendItems(nextPage)
        }
        document.querySelector('alert-box').loading(false)
        // update filter tags 
        store.filterTags.helpers.onModeUpdate({ mode: store.mode, type: store.searchQuery.type, results: store[store.mode].results })
        
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
    store.mode = e.detail
    // on entering search mode, disable navigation menu
    document.querySelector('browse-mode')[e.detail === appModes.SEARCH ? 'disable' : 'enable']()

    // clear movie list items
    document.querySelector('item-grid').clear()
    
    // update page header
    setAppMainTitle()
    window.scrollTo(0, 0)

    // restore app mode tags (other than search)
    if(browseModes.includes(store.mode)) {
        // cleanup search attribute from item-grid
        document.querySelector('item-grid').removeAttribute('search', '');
        // fetch results from API if we have none in store
        if(!store[store.mode].results.length) {
            // show fetching alert
            document.querySelector('alert-box').loading(true)
            const nextPage = await fetchNextPageFromAPI(store.mode, infiniteScrollController)
            // update results
            store[store.mode] = {
                ...store[store.mode],
                ...nextPage,
                results: [...(store[store.mode]?.results ?? []), ...nextPage.results]
            }
            document.querySelector('alert-box').loading(false)
        }
    }
    else if(store.mode === appModes.SEARCH) {
        // add attribute to item-grid
        document.querySelector('item-grid').setAttribute('search', '');
    }
    // render cards
    document.querySelector('item-grid').appendItems(store[store.mode])
    // update filter tags
    store.filterTags.helpers.onModeUpdate({ mode: store.mode, type: store.searchQuery.type, results: store[store.mode].results })
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
        // signal app mode change
        dispatchModeUpdate(appModes.SEARCH)
        // update store
        store.searchQuery = e.detail

        // show alert box while search runs
        document.querySelector('alert-box').show(true, 'Searching')
        // switch item-grid attribute
        document.querySelector('item-grid').removeAttribute('search', '')
        document.querySelector('item-grid').setAttribute('searching', '')
        if(searchController.abortController) {
            searchController.abortController.abort()
        }
        searchController.abortController = new AbortController()
        searchController.isFetching = true
        store.search = await movieDBAPI[store.searchQuery.type === searchTypes.MOVIE ? 'fetchMovie' : 'fetchPerson']({
            query: store.searchQuery.query,
            signal: searchController.abortController.signal
        })
        // render search results in movie list
        document.querySelector('item-grid').clear()
        document.querySelector('item-grid').appendItems(store.search)
        // restore item-grid attribute
        document.querySelector('item-grid').removeAttribute('searching')
        document.querySelector('item-grid').setAttribute('search', '')
        // hide alert box after cards have been rendered
        document.querySelector('alert-box').show(false)
        window.scrollTo(0,0)
        // update filter tags
        store.filterTags.helpers.onModeUpdate({ mode: store.mode, type: store.searchQuery.type, results: store[store.mode].results })
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
        document.querySelector('alert-box').show(true, 'switching content language')
        // update store genres strings
        store.genres.setGenres(await movieDBAPI.fetchGenres())
        store.genres.addGenre({ id: 0, name: 'Adult' })
        // update all movie-card's content in new language
        /*document.querySelectorAll('movie-card').forEach(async mc => {
            const content = await movieDBAPI.fetchMovieDetails({ movieId: mc.getAttribute('movie-id')})
            await mc.render(content)
        })*/
        for(const mc of Array.from(document.querySelectorAll('movie-card'))) {
            const content = await movieDBAPI.fetchMovieDetails({ movieId: mc.getAttribute('movie-id')})
            await mc.render(content)
        }
        // remove genre labels from store filter and insert fresh ones
        store.filterTags.helpers.getTag(tags.genre.name).updateLabels(store[store.mode].results)
        // hide alert
        document.querySelector('alert-box').show(false)
    }
}

export const onFilterTag = e => {
    if(e.detail.name) {
        store.filterTags.helpers.setTag(e.detail)
        store.filterTags.helpers.getTag(e.detail.name).applyFilter()
    }
}