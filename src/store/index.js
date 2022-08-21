import appModes from "../constants/AppModes"

export const store = {
    configuration: {                // MovieDB API configuration
        helpers: {
            images: {
                posterBaseSize: 342,    // poster target size in pixels
                generatePosterUrls: function(fname, mode = 'x', includeOriginal = true) {
                    // poster img srcset urls generator
                    // @fname               poster file name
                    // @mode                ratio to posterBaseSize ('x', e.g. 1.5x) or image width ('w', e.g. 720w) mode
                    // @includeOriginal     whether to include original size in list
                    if(!fname) return [];
                    const baseSize = store.configuration.helpers.images.posterBaseSize
                    mode = mode.toLowerCase()
                    return store.configuration.images.poster_sizes.flatMap(
                        (sz, i, szs) => /^w\d+$/.test(sz)
                            ? `${store.configuration.images.secure_base_url}${sz}${fname} ${mode === 'x'? (Number.parseInt(sz.substring(1)) / baseSize).toFixed(2) : sz.substring(1)}${mode}`
                            : includeOriginal
                                ? `${store.configuration.images.secure_base_url}${sz}${fname} ${mode === 'x' ? 3 * Number.parseInt(szs[i-1].substring(1)) / baseSize : 3 * Number.parseInt(szs[i-1].substring(1))}${mode}` // 3*720
                                : []
                    )
                }
            }
        }
    },
    genres: {
        table: [],                  // genres lookup table
        lookup: function(id) {      // genres lookup function
            return this.table.find(g => g.id === id)?.name
        }
    },                     
    nowPlaying: {},                 // now playing data
    query: '',                      // search query text
    search: {},                     // search results data
    movieDetails: {},               // movie details data
    mode: appModes.NOW_PLAYING      // app mode
}

export default store