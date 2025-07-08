import appModes, { appModesTitles, searchTypes, browseModes } from "../constants"
import movieDBAPI from "../controllers/MovieDB"
import { dispatchInfiniteScroll } from "../events/InfiniteScroll"
import store from "../store"
import { tags } from "../store/filter"
import { dispatchModeUpdate } from "../events/ModeUpdate"

export const scrolledToBottom = () => {
    const {
        scrollTop,
        scrollTopMax
    } = document.documentElement;

    // reached page bottom
    if (scrollTop === scrollTopMax) {
        dispatchInfiniteScroll()
    }
}

export const hideAdultPosters = () => {
    document.querySelectorAll('.adult .poster > img').forEach(img => {
        img.classList.toggle('adult')
    })
}

export const hideAdultResults = () => {
    document.querySelectorAll('movie-card.adult').forEach(c => {
        c.style.display = store.preferences.includeAdultSearch ? '' : 'none'
    })
}

export const switchContentLanguage = async () => {
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
    for (const mc of Array.from(document.querySelectorAll('movie-card'))) {
        const content = await movieDBAPI.fetchMovieDetails({ movieId: mc.getAttribute('movie-id') })
        await mc.render(content)
    }
    // remove genre labels from store filter and insert fresh ones
    store.filterTags.helpers.getTag(tags.genre.name).updateLabels(store[store.mode].results)
    // hide alert
    document.querySelector('alert-box').show(false)
}

export const infiniteScroll = async (infiniteScrollController) => {
    // prevent infinite scroll behaviour when filtering is active
    if (store.filterTags.helpers.isActive()) throw Error('Will not fetch further results while filter is active')

    // part of store to use
    const mode = store.mode

    // prevent requests if we have fetched all pages
    if (store[mode].page && store[mode].page === store[mode].total_pages) {
        document.querySelector('alert-box').showFor('Last page', 750)
        return
    }

    // show fetching alert
    document.querySelector('alert-box').loading(true)
    const nextPage = await fetchNextPageFromAPI(mode, infiniteScrollController)
    // update results
    if (!infiniteScrollController.abortController.signal.aborted) {
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

export const modeUpdate = async ({ mode, infiniteScrollController }) => {
    store.mode = mode
    // on entering search mode, disable navigation menu
    document.querySelector('browse-mode')[mode === appModes.SEARCH ? 'disable' : 'enable']()

    // clear movie list items
    document.querySelector('item-grid').clear()

    // update page header
    setAppMainTitle()
    window.scrollTo(0, 0)

    // restore app mode tags (other than search)
    if (browseModes.includes(store.mode)) {
        // cleanup search attribute from item-grid
        document.querySelector('item-grid').removeAttribute('search', '');
        // fetch results from API if we have none in store
        if (!store[store.mode].results.length) {
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
    else if (store.mode === appModes.SEARCH) {
        // add attribute to item-grid
        document.querySelector('item-grid').setAttribute('search', '');
    }
    // render cards
    document.querySelector('item-grid').appendItems(store[store.mode])
    // update filter tags
    store.filterTags.helpers.onModeUpdate({ mode: store.mode, type: store.searchQuery.type, results: store[store.mode].results })
}

export const searchQuery = async ({ query, searchController }) => {
    // signal app mode change
    dispatchModeUpdate(appModes.SEARCH)
    // update store
    store.searchQuery = query

    // show alert box while search runs
    document.querySelector('alert-box').show(true, 'Searching')
    // switch item-grid attribute
    document.querySelector('item-grid').removeAttribute('search', '')
    document.querySelector('item-grid').setAttribute('searching', '')
    if (searchController.abortController) {
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
    // check for adult posters preview
    if (store.preferences.includeAdultSearch && store.preferences.previewAdultPoster) {
        hideAdultPosters()
    }
    // restore item-grid attribute
    document.querySelector('item-grid').removeAttribute('searching')
    document.querySelector('item-grid').setAttribute('search', '')
    // hide alert box after cards have been rendered
    document.querySelector('alert-box').show(false)
    window.scrollTo(0, 0)
    // update filter tags
    store.filterTags.helpers.onModeUpdate({ mode: store.mode, type: store.searchQuery.type, results: store[store.mode].results })
}

export const fetchNextPageFromAPI = async (mode, abortController) => {
    // movieDBAPI fetcher to use
    let fetcher
    switch (mode) {
        case appModes.NOW_PLAYING:
            fetcher = movieDBAPI.fetchNowPlaying
            break
        case appModes.UPCOMING:
            fetcher = movieDBAPI.fetchUpcoming
            break
        case appModes.POPULAR:
            fetcher = movieDBAPI.fetchPopular
            break
        case appModes.TOP_RATED:
            fetcher = movieDBAPI.fetchTopRated
        case appModes.SEARCH:
            fetcher = store.searchQuery.type === searchTypes.MOVIE ? movieDBAPI.fetchMovie : movieDBAPI.fetchPerson
            break
    }

    // check if fetcher is already busy
    if (abortController.abortController) {
        abortController.abortController.abort('onInfiniteScroll is already fetching next page')
    }
    abortController.abortController = new AbortController()
    abortController.isFetching = true

    const nextPage = await fetcher({
        page: (store[mode]?.page ?? 0) + 1,
        ...(store.mode === appModes.SEARCH && { query: store.searchQuery.query }), // query only necessary for search
        signal: abortController.abortController.signal
    })

    return nextPage
}

export const setAppMainTitle = (value) => {
    document.querySelector('#app > .main-title').textContent = value || appModesTitles[store.mode]
}