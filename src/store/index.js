import appModes from "../constants/AppModes"
import { generateImageUrls } from "./utils";

export const store = {
    configuration: {                // MovieDB API configuration
        helpers: {
            images: {
                posterBaseWidth: window.screen.width / 8,    // poster target width in pixels
                generatePosterUrls: function(fname, mode = 'x', includeOriginal = true) {
                    // poster img srcset urls generator
                    // @fname               poster file name
                    // @mode                ratio to posterBaseSize ('x', e.g. 1.5x) or image width ('w', e.g. 720w) mode
                    // @includeOriginal     whether to include original size in list
                    return generateImageUrls(
                        store.configuration.images.secure_base_url,
                        store.configuration.helpers.images.posterBaseWidth,
                        store.configuration.images.poster_sizes,
                        fname,
                        mode,
                        includeOriginal
                    )
                },

                backdropBaseWidth: window.screen.width / 2,  // backdrop target width in pixels
                generateBackdropUrls: function(fname, mode = 'x', includeOriginal = true) {
                    // backdrop background-image image-set urls generator
                    // @fname               backdrop file name
                    // @mode                ratio to backdropBaseSize ('x', e.g. 1.5x) or image width ('w', e.g. 720w) mode
                    // @includeOriginal     whether to include original size in list
                    return generateImageUrls(
                        store.configuration.images.secure_base_url,
                        store.configuration.helpers.images.backdropBaseWidth,
                        store.configuration.images.backdrop_sizes,
                        fname,
                        mode,
                        includeOriginal
                    ).map(u => u.replace(/^(\S+)/, 'url(\"$1\")')) // wrap url("...") around generated image url (excluding size/ratio), e.g. url("http://..../file.jpg") 1.5x
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