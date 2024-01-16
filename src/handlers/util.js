import appModes, { appModesTitles } from "../constants/AppModes"
import movieDBAPI from "../controllers/MovieDB"
import { dispatchInfiniteScroll } from "../events/InfiniteScroll"
import store from "../store"

export const scrolledToBottom = () => {
    const {
        scrollTop,
        scrollHeight,
        clientHeight,
    } = document.documentElement;

    // reached page bottom
    if(scrollTop + clientHeight >= scrollHeight) {
        dispatchInfiniteScroll()
    }
}

export const fetchFromAPI = async (mode, abortController) => {
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
            fetcher = movieDBAPI.fetchMovie
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
        ...(store.mode === appModes.SEARCH && { query: store.query }), // query only necessary for search
        signal: abortController.abortController.signal
    })

    return nextPage
}

export const setAppMainTitle = (value) => {
    document.querySelector('#app > .main-title').textContent = value || appModesTitles[store.mode]
}