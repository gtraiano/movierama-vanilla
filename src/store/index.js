import appModes from "../constants/AppModes"

export const store = {
    configuration: {},
    genres: [],
    nowPlaying: {},
    query: '',
    search: {},
    movieDetails: {},
    mode: appModes.NOW_PLAYING
}

export default store