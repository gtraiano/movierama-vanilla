import appModes, { appModesTitles, searchTypes } from "../constants"
import movieDBAPI from "../controllers/MovieDB"
import { dispatchInfiniteScroll } from "../events/InfiniteScroll"
import store from "../store"

export const scrolledToBottom = () => {
    const {
        scrollTop,
        scrollTopMax
    } = document.documentElement;

    // reached page bottom
    if(scrollTop === scrollTopMax) {
        dispatchInfiniteScroll()
    }
}

export const fetchNextPageFromAPI = async (mode, abortController) => {
    // movieDBAPI fetcher to use
    let fetcher
    switch(mode) {
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
    if(abortController.abortController) {
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