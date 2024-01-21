import appModes, { searchTypes } from "../constants/AppModes"
import { preferences } from "./preferences";
import { configuration } from "./configuration";
import { genres } from "./genres";
import { filterTags } from "./filter"

export const store = Object.seal({
    configuration,                  // moviedb api configuration
    preferences,                    // app preferences
    genres,                         // movie genres
    [appModes.NOW_PLAYING]: {       // now playing data
        page: 0,
        total_pages: 0,
        results: []
    },
    [appModes.UPCOMING]: {          // upcoming movies data
        page: 0,
        total_pages: 0,
        results: []
    },
    [appModes.POPULAR]: {           // popular movies data
        page: 0,
        total_pages: 0,
        results: []
    },
    [appModes.TOP_RATED]: {         // top rated movies data
        page: 0,
        total_pages: 0,
        results: []
    },
    //query: '',                      // search query text
    searchQuery: {
        query: '',
        type: searchTypes.MOVIE
    },
    [appModes.SEARCH]: {            // search results data
        page: 0,
        total_pages: 0,
        results: []
    },
    movieDetails: {                 // movie details data
        details: null,
        credits: null,
        trailers: null,
        reviews: null,
        similar: null
    },               
    mode: appModes.NOW_PLAYING,        // app mode
    filterTags                      // displayed data filtering tags
})

export default store