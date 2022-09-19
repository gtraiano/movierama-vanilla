// moviedb api genres
export const genres = Object.seal({
    table: [],                  // genres lookup table
    lookup: function(id) {      // genres lookup function
        return this.table.find(g => g.id === id)?.name
    }
})