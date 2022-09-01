import appModes from "../constants/AppModes"
import { preferences } from "./preferences";
import { configuration } from "./configuration";
import { genres } from "./genres";

export const store = {
    configuration,                  // moviedb api configuration
    preferences,                    // app preferences
    genres,                         // movie genres
    nowPlaying: {},                 // now playing data
    query: '',                      // search query text
    search: {},                     // search results data
    movieDetails: {},               // movie details data
    mode: appModes.NOW_PLAYING      // app mode
}

export default store