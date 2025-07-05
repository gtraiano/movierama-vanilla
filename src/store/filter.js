import store from "."
import appModes, { AdultGenre, browseModes, searchTypes } from "../constants"

export const TagTypes = {
    TEXT: 'text',
    CHECKBOXES: 'checkbox-container'
}

export const tags = {
    title: {
        name: 'title',                              // tag name
        type: TagTypes.TEXT,                        // tag type 'input'|'checkbox-container'
        value: '',                                  // input text value (only for type 'input')
        use: true,                                  // use in approved app browse modes/search types
        inBrowseModes: browseModes,                 // approved app browse modes
        inSearchTypes: [searchTypes.MOVIE],         // approved app search types
        applyFilter: function() {                   // apply filter on UI
            const re = new RegExp(this.value, 'i')
            document.querySelectorAll('item-grid .item-grid movie-card').forEach(card => {
                if(!re.test(card.querySelector('div.movie-item ').children[1].children[1].innerText)) card.style.display = 'none'
                else card.style.display = ''
            })
        }
    },

    genre: {
        name: 'genre',
        type: TagTypes.CHECKBOXES,
        boxes: new Map(),                           // checkboxes (label, truth) pair values
        use: true,
        inBrowseModes: browseModes,
        inSearchTypes: [searchTypes.MOVIE],
        applyFilter: function() {
            const activeGenres = Array.from(this.boxes.entries()).filter(([k, v]) => v === true).map((([k, v]) => k)).join('|')
            const re = new RegExp(activeGenres, 'i')
            document.querySelectorAll('item-grid .item-grid movie-card').forEach(mc => {
                if(!re.test(mc.querySelector('div[role=movie-genres] > span').textContent)) mc.style.display = 'none'
                else mc.style.display = ''
            })
        },
        updateLabels: function(results) {           // generate labels from results as received from API
            if(!results) return
            this.boxes.clear()
            const genres = [...new Set(results.map(r => r.genre_ids).reduce((g, cg) => {
                cg?.forEach(v => { g.push(store.genres.lookup(v)) })
                return g
            }, []))]
            if(results.map(m => m.adult).some(Boolean)) {
                genres.push(AdultGenre.name)
            }
            genres.sort()
            genres.forEach(g => {
                store.filterTags.helpers.appendToTag({
                    name: tags.genre.name,
                    label: g,
                    value: false
                })  
            })
            document.getElementsByTagName('filter-tab')[0].insertTags(store.filterTags.tags)
        }
    },

    name: {
        name: 'name',
        type: TagTypes.TEXT,
        value: '',
        use: false,
        inBrowseModes: [],
        inSearchTypes: [searchTypes.PERSON],
        applyFilter: function() {
            const re = new RegExp(this.value, 'i')
            document.querySelectorAll('item-grid .item-grid person-card').forEach(card => {
                if(!re.test(card.querySelector('.name').textContent)) card.style.display = 'none'
                else card.style.display = ''
            })
        }
    },

    knownFor: {
        name: 'department',
        type: TagTypes.CHECKBOXES,
        boxes: new Map(),
        use: false,
        inBrowseModes: [],
        inSearchTypes: [searchTypes.PERSON],
        updateLabels: function(results) {
            if(!results) return
            this.boxes.clear()
            const knownFor = [...new Set(results.map(p => p.known_for_department))].filter(kf => kf?.trim().length).sort()
            knownFor.forEach(kf => {
                store.filterTags.helpers.appendToTag({
                    name: tags.knownFor.name,
                    label: kf.trim(),
                    value: false
                })
            })
            document.getElementsByTagName('filter-tab')[0].insertTags(store.filterTags.tags)
        },
        applyFilter: function() {
            const activeTypes = Array.from(this.boxes.entries()).filter(([k, v]) => v === true).map((([k, v]) => k)).join('|')
            const re = new RegExp(activeTypes, 'i')
            document.querySelectorAll('item-grid .item-grid person-card').forEach(pc => {
                if(!re.test(pc.querySelector('.known-for').textContent)) pc.style.display = 'none'
                else pc.style.display = ''
            })
        }
    }
}

export const filterTags = {
    tags: Object.values(tags),
    helpers: {
        isActive: () => filterTags.tags.some(t => t.type === TagTypes.TEXT ? t.value.length : Array.from(t.boxes.values()).some(b => b)),
        
        getTag: (name) => filterTags.tags.find(t => t.name === name),

        getTagEntries: name => {
            const tag = filterTags.tags.find(t => t.name === name)
            if(!tag) return []
            if(tag.type === TagTypes.TEXT) return tag.value
            else if(tag.type === TagTypes.CHECKBOXES) return Array.from(tag.boxes.entries()).sort()
        },
        
        setTag: (tag) => {
            const target = filterTags.helpers.getTag(tag.name)
            if(!target) return console.warn(`Tag ${tag.name} does not exist`)
            if(target.type === TagTypes.TEXT) target.value = tag.value.trim()
            else if(target.type === TagTypes.CHECKBOXES) {
                if(!target.boxes.has(tag.label)) return console.warn(`Checkbox ${tag.label} does not exist`)
                target.boxes.set(tag.label, tag.value)
            }
        },
        
        appendToTag: (tag) => {
            const target = filterTags.tags.find(t => t.name === tag.name)
            if(!target) {
                console.warn(`Tag ${tag.name} does not exist`)
                return
            }
            if(target.type === TagTypes.CHECKBOXES) {
               target.boxes.set(tag.label, tag.value ?? false)
            }
        },

        clearTag: name => {
            const target = store.filterTags.helpers.getTag(name)
            if(target.type === TagTypes.TEXT) target.value = ''
            else if(target.type === TagTypes.CHECKBOXES) target.boxes.clear()
        },

        onModeUpdate: ({ mode, type, results }) => {
            if(!mode || !results) return
            for(const t of filterTags.tags) {
                t.use = mode !== appModes.SEARCH ? t.inBrowseModes.includes(mode) : t.inSearchTypes.includes(type)
                document.getElementsByTagName('filter-tab')[0].clearTag(tags.title.name)
                // init fresh tags
                document.querySelector('filter-tab').toggleTag(t.name, t.use)
                t.use && t.type === TagTypes.CHECKBOXES && t.updateLabels(results)
            }
        }
    }
}