import store from "."
import appModes, { browseModes, searchTypes } from "../constants/AppModes"

const tags = {
    title: {
        name: 'title',                              // tag name
        type: 'input',                              // tag type 'input'|'checkbox-container'
        value: '',                                  // input text value (only for type 'input')
        use: true,                                  // is in use
        inBrowseModes: browseModes,                 // used in app browse modes
        inSearchTypes: [searchTypes.MOVIE],         // used in app search types
        applyFilter: function() {                   // apply filter on UI
            const re = new RegExp(this.value, 'i')
            document.querySelectorAll('movie-list .in-theaters movie-card').forEach(card => {
                if(!re.test(card.querySelector('div.movie-item ').children[1].children[1].innerText)) card.style.display = 'none'
                else card.style.display = ''
            })
        }
    },

    genre: {
        name: 'genre',
        type: 'checkbox-container',
        boxes: new Map(),                           // checkboxes (label, truth) pair values
        use: true,
        inBrowseModes: browseModes,
        inSearchTypes: [searchTypes.MOVIE],
        applyFilter: function() {
            const activeGenres = Array.from(this.boxes.entries()).filter(([k, v]) => v === true).map((([k, v]) => k)).join('|')
            const re = new RegExp(activeGenres, 'i')
            document.querySelectorAll('movie-list .in-theaters movie-card').forEach(mc => {
                if(!re.test(mc.querySelector('div[role=movie-genres] > span').textContent)) mc.style.display = 'none'
                else mc.style.display = ''
            })
        },
        updateLabels: function(results) {           // generate labels from results as received from API
            if(!results) return
            const genres = [...new Set(results.map(r => r.genre_ids).reduce((g, cg) => {
                cg.forEach(v => { g.push(store.genres.lookup(v)) })
                return g
            }, []))].sort()
            
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
        type: 'input',
        value: '',
        use: false,
        inBrowseModes: [],
        inSearchTypes: [searchTypes.PERSON],
        applyFilter: function() {
            const re = new RegExp(this.value, 'i')
            document.querySelectorAll('movie-list .in-theaters person-card').forEach(card => {
                if(!re.test(card.querySelector('.name').textContent)) card.style.display = 'none'
                else card.style.display = ''
            })
        }
    },

    knownFor: {
        name: 'known for',
        type: 'checkbox-container',
        boxes: new Map(),
        use: false,
        inBrowseModes: [],
        inSearchTypes: [searchTypes.PERSON],
        updateLabels: results => {
            //if(!results) return
            const knownFor = [...new Set(results.map(p => p.known_for_department))].filter(kf => kf.trim().length).sort()
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
            document.querySelectorAll('movie-list .in-theaters person-card').forEach(pc => {
                if(!re.test(pc.querySelector('.known-for').textContent)) pc.style.display = 'none'
                else pc.style.display = ''
            })
        }
    }
}

export const filterTags = {
    tags: Object.values(tags),
    helpers: {
        isActive: () => filterTags.tags.some(t => t.type === 'input' ? t.value.length : Array.from(t.boxes.values()).some(b => b)),
        
        getTag: (name) => filterTags.tags.find(t => t.name === name),

        getTagEntries: name => {
            const tag = filterTags.tags.find(t => t.name === name)
            if(!tag) return []
            if(tag.type === 'input') return tag.value
            else if(tag.type === 'checkbox-container') return Array.from(tag.boxes.entries()).sort()
        },
        
        setTag: (tag) => {
            const target = filterTags.helpers.getTag(tag.name)
            if(!target) return console.warn(`Tag ${tag.name} does not exist`)
            if(target.type === 'input') target.value = tag.value.trim()
            else if(target.type === 'checkbox-container') {
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
            if(target.type === 'checkbox-container') {
               target.boxes.set(tag.label, tag.value ?? false)
            }
        },

        clearTag: name => {
            const target = store.filterTags.helpers.getTag(name)
            if(target.type === 'input') target.value = ''
            else if(target.type === 'checkbox-container') target.boxes.clear()
        },

        onModeUpdate: ({ mode, type, results }) => {
            if(!mode || !results) return
            for(const t of filterTags.tags) {
                t.use = mode !== appModes.SEARCH ? t.inBrowseModes.includes(mode) : t.inSearchTypes.includes(type)
                document.getElementsByTagName('filter-tab')[0].clearTag(tags.title.name)
                // init fresh tags
                document.querySelector('filter-tab').toggleTag(t.name, t.use)
                t.use && t.type === 'checkbox-container' && t.updateLabels(results)
            }
        }
    }
}