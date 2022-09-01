// applications preferences
export const preferences = {
    includeAdultSearch: false,      // inlcude adult content in the results
    previewAdultPoster: false,      // hide adult content posters in movie list
    searchQueryDebounce: 1250,
    helpers: {                      // helper functions
        // set preference by name and values
        setPreference: function(name, value) {
            if(!Object.keys(preferences).filter(k => k !== 'helpers').includes(name)) {
                console.info('Preference', name, 'does not exist')
                return
            }
            preferences[name] = value
            // save preferences in local storage
            localStorage.setItem('preferences', JSON.stringify({
                ...(localStorage.getItem('preferences') && JSON.parse(localStorage.getItem('preferences'))),
                [name]: value
            }))

            dispatchEvent(new CustomEvent('updatepreference', {
                detail: name
            }))
        },
        // load preferences from local storage
        loadPreferences: function() {
            let prefs = localStorage.getItem('preferences')
            if(!prefs) return
            prefs = JSON.parse(prefs)
            for(const k in prefs) {
                if(k in preferences && k !== 'helpers') {
                    preferences[k] = prefs[k]
                }
            }
            //dispatchEvent(new Event('preferencesloaded', { bubbles: true }))
        }
    }
}