import store from "../../store"

const movieDB = {
    apiBaseURL: 'https://api.themoviedb.org',
    apiVersion: '/3',
    auth: {
        // api key
        ...(import.meta.env.VITE_API_KEY && { apiKey: import.meta.env.VITE_API_KEY }),
        // api read access token
        ...(import.meta.env.VITE_API_READ_ACCESS_TOKEN && {
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_API_READ_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json;charset=utf-8'
                }
            }
        )
    }
}

const generateURL = (config) => {
    const url  = new URL(movieDB.apiVersion + config.path ?? '', movieDB.apiBaseURL)

    // include api key if api read access token is not defined
    !movieDB.auth?.headers && url.searchParams.append('api_key', movieDB.auth.apiKey)
    // default to english language
    url.searchParams.append('language', 'en-US')

    // add other query parameters
    if('searchParams' in config) {
        Object.entries(config.searchParams).forEach(([key, value]) => {
            url.searchParams.append(key, value)
        })
    }

    // include adult in search
    url.searchParams.append('include_adult', store.preferences.includeAdultSearch)

    return url.toString()
}

const fetcher = async (url, signal = undefined) => {
    const response = await fetch(url, {
        headers: {
            ...movieDB.auth.headers
        },
        signal: signal
    })
    if(!response.ok) throw new Error(`Request ${response.url} failed with "${response.statusText} [${response.status}]"`)
    return await response.json()
}

const fetchConfiguration = async () => {
    const url = generateURL({
        path: '/configuration',
    })
    return await fetcher(url)
}

const fetchNowPlaying = async (config) => {
    const url = generateURL({
        path: '/movie/now_playing',
        searchParams: {
            page: config.page ?? 1
        }
    })
    return await fetcher(url)
}

const fetchGenres = async () => {
    const url = generateURL({
        path: '/genre/movie/list'
    })
    return (await fetcher(url)).genres
}

const fetchMovie = async (config) => {
    const url = generateURL({
        path: '/search/movie',
        searchParams: {
            query: config.query,
            page: config.page ?? 1
        }
    })
    return await fetcher(url, config.signal)
}

const fetchMovieDetails = async (config) => {
    const url = generateURL({
        path: `/movie/${config.movieId}`,
    })
    return await fetcher(url)
}

const fetchMovieVideos = async (config) => {
    const url = generateURL({
        path: `/movie/${config.movieId}/videos`,
    })
    return await fetcher(url)
}

const fetchMovieReviews = async (config) => {
    const url = generateURL({
        path: `/movie/${config.movieId}/reviews`,
    })
    return await fetcher(url)
}

const fetchMovieSimilar = async (config) => {
    const url = generateURL({
        path: `/movie/${config.movieId}/similar`,
    })
    return await fetcher(url)
}

const fetchMovieCredits = async (config) => {
    const url = generateURL({
        path: `/movie/${config.movieId}/credits`,
    })
    return await fetcher(url)
}

export default {
    fetchNowPlaying,
    fetchGenres,
    fetchMovie,
    fetchMovieDetails,
    fetchMovieVideos,
    fetchMovieReviews,
    fetchMovieSimilar,
    fetchMovieCredits,
    fetchConfiguration
};
