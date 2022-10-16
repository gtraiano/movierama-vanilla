import appModes from "../constants/AppModes"
import { preferences } from "./preferences";
import { configuration } from "./configuration";
import { genres } from "./genres";
import { filterTags } from "./filter"

export const store = Object.seal({
    configuration,                  // moviedb api configuration
    preferences,                    // app preferences
    genres,                         // movie genres
    nowPlaying: {},                 // now playing data
    query: '',                      // search query text
    search: {},                     // search results data
    movieDetails: {                 // movie details data
        details: null,
        credits: null,
        trailers: null,
        reviews: null,
        similar: null
    },               
    mode: appModes.NOW_PLAYING,     // app mode
    filterTags
})

export default store