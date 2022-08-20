import appModes from "../constants/AppModes"

export const store = {
    configuration: {                // MovieDB API configuration (currently not used)
        helpers: {
            images: {
                generatePosterUrls: function(fname, includeOriginal = false) {
                    // poster img srcset urls generator
                    // @fname               poster file name
                    // @includeOriginal     whether to include original size in list
                    return store.configuration.images.poster_sizes.flatMap(
                        (sz, i, szs) => /^w\d+$/.test(sz)
                            ? `${store.configuration.images.secure_base_url}${sz}${fname} ${sz.substring(1)}w`
                            : includeOriginal
                                ? `${this.secure_base_url}${sz}${url} ${Number.parseInt(szs[i-1].substring(1)) * 4}w` // 4*720w
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