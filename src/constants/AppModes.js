export const appModes = {
    NOW_PLAYING: 'nowPlaying',
    UPCOMING: 'upcoming',
    POPULAR: 'popular',
    TOP_RATED: 'topRated',
    SEARCH: 'search'
}

export const appModesTitles = {
    [appModes.NOW_PLAYING]: 'now playing',
    [appModes.UPCOMING]: 'upcoming',
    [appModes.POPULAR]: 'popular',
    [appModes.TOP_RATED]: 'top rated',
    [appModes.SEARCH]: 'search'
}

export const browseModes = [appModes.NOW_PLAYING, appModes.UPCOMING, appModes.POPULAR, appModes.TOP_RATED]

export default appModes