// moviedb api genres
export const genres = Object.seal({
    map: null,                  // genres map
    lookup: function(id) {      // genres lookup function
        return this.map.get(id)
    },
    setGenres: genresTable => { // set map from genres object as obtained from API
        genres.map = new Map(genresTable.map(g => [g.id, g.name]))
    },
    addGenre: ({ id, name }) => {
        genres.map.set(id, name)
    }
})