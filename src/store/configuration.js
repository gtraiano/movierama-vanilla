import { generateImageUrls } from "./utils";

// MovieDB API configuration
export const configuration = {
    // supported content languages
    languages: [],
    // helper functions
    helpers: {
        images: {
            gridItemWidth: () => Number.parseFloat(/\d+\.?\d+?(?=px\s*?)/gm.exec(window.getComputedStyle(document.querySelector('.item-grid')).gridTemplateColumns)[0]),
            posterBaseWidth: (window.screen.width / 8) * window.devicePixelRatio,    // poster target width in pixels (value changed on app initialization)
            generatePosterUrls: function(fname, mode = 'x', includeOriginal = true) {
                // poster img srcset urls generator
                // @fname               poster file name
                // @mode                ratio to posterBaseSize ('x', e.g. 1.5x) or image width ('w', e.g. 720w) mode
                // @includeOriginal     whether to include original size in list
                return generateImageUrls(
                    configuration.images.secure_base_url,
                    this.posterBaseWidth,
                    configuration.images.poster_sizes,
                    fname,
                    mode,
                    includeOriginal
                )
            },

            backdropBaseWidth: (window.screen.width / 2) * window.devicePixelRatio,  // backdrop target width in pixels
            generateBackdropUrls: function(fname, mode = 'x', includeOriginal = true) {
                // backdrop background-image image-set urls generator
                // @fname               backdrop file name
                // @mode                ratio to backdropBaseSize ('x', e.g. 1.5x) or image width ('w', e.g. 720w) mode
                // @includeOriginal     whether to include original size in list
                return generateImageUrls(
                    configuration.images.secure_base_url,
                    configuration.helpers.images.backdropBaseWidth,
                    configuration.images.backdrop_sizes,
                    fname,
                    mode,
                    includeOriginal
                ).map(u => u.replace(/^(\S+)/, 'url(\"$1\")')) // wrap url("...") around generated image url (excluding size/ratio), e.g. url("http://..../file.jpg") 1.5x
            }
        }
    }
}