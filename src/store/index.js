import appModes from "../constants/AppModes"

export const store = {
    configuration: {},              // MovieDB API configuration (currently not used)
    genres: [],                     // genres lookup table
    nowPlaying: {},                 // now playing data
    query: '',                      // search query text
    search: {},                     // search results data
    movieDetails: {},               // movie details data
    mode: appModes.NOW_PLAYING      // app mode
}

export default store