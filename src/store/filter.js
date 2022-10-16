import store from "."

export const filterTags = {
    tags: [
        {
            name: 'title',
            value: '',
            type: 'input',
            applyFilter: function () {
                const re = new RegExp(this.value, 'i')
                document.querySelectorAll('movie-list .in-theaters movie-card').forEach(card => {
                    //console.log(card.querySelector('div.movie-item ').children[1].children[1].innerText.includes(e.detail.value))
                    if(!re.test(card.querySelector('div.movie-item ').children[1].children[1].innerText)) card.style.display = 'none'
                    else card.style.display = ''
                })
            }
        },
        {
            name: 'genre',
            type: 'checkbox-container',
            boxes: [],
            updateLabels: (results) => {
                const genres = [...new Set(results.map(r => r.genre_ids).reduce((g, cg) => {
                    cg.forEach(v => { g.push(store.genres.lookup(v)) })
                    return g
                }, []))].sort()
                
                genres.forEach(g => {
                    store.filterTags.helpers.appendToTag({
                        name: 'genre',
                        label: g,
                        value: false
                    })  
                })
                
                document.getElementsByTagName('filter-tab')[0].insertTags(store.filterTags.tags)
            },
            applyFilter: () => {
                const activeGenres = filterTags.helpers.getTag('genre').boxes.filter(b => b.value).map(t => t.label).join('|')
                const re = new RegExp(activeGenres, 'i')
                document.querySelectorAll('movie-list .in-theaters movie-card').forEach(mc => {
                    if(!re.test(mc.children[0].children[3].children[1].textContent)) mc.style.display = 'none'
                    else mc.style.display = ''
                })
            }
        }
    ],
    helpers: {
        getTag: (name) => filterTags.tags.find(t => t.name === name),
        
        setTag: (tag) => {
            const target = filterTags.helpers.getTag(tag.name)
            if(!target) return console.warn(`Tag ${tag.name} does not exist`)
            if(target.type === 'input') target.value = tag.value
            else {
                const cb = target.boxes.find(l => l.label === tag.label)
                if(!cb) return console.warn(`Checkbox ${tag.label} does not exist`)
                cb.value = tag.value
            }
        },
        
        appendToTag: (tag) => {
            const target = filterTags.tags.find(t => t.name === tag.name)
            if(!target) {
                console.warn(`Tag ${tag.name} does not exist`)
                return
            }
            if(target.type === 'checkbox-container') {
                target.boxes.push({
                    label: tag.label,
                    value: tag.value ?? false
                })
            }
        }
    }
    
}