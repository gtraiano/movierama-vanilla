import { dispatchUpdatePreference } from "../events/UpdatePreference"

export const PREFERENCES = Object.freeze({
    INCLUDE_ADULT_SEARCH: 'includeAdultSearch',
    PREVIEW_ADULT_POSTER: 'previewAdultPoster',
    THEME: 'theme',
    CONTENT_LANGUAGE: 'contentLanguage'
})

const PREFERENCES_LOCAL_STORAGE_KEY = 'preferences'

// applications preferences
export const preferences = Object.seal({
    [PREFERENCES.INCLUDE_ADULT_SEARCH]: false,      // inlcude adult content in the results
    [PREFERENCES.PREVIEW_ADULT_POSTER]: false,      // hide adult content posters in movie list
    [PREFERENCES.THEME]:                            // application color theme
        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    [PREFERENCES.CONTENT_LANGUAGE]:                 // default language for content
        navigator.languages.find(l => !l.includes('-')) ?? 'en',
    
    helpers: {                      // helper functions
        // set preference by name and values
        setPreference: function(name, value) {
            if(!Object.keys(preferences).filter(k => k !== 'helpers').includes(name)) {
                console.info('Preference', name, 'does not exist')
                return
            }
            preferences[name] = value
            // save preferences in local storage
            localStorage.setItem(PREFERENCES_LOCAL_STORAGE_KEY, JSON.stringify({
                ...(localStorage.getItem(PREFERENCES_LOCAL_STORAGE_KEY) && JSON.parse(localStorage.getItem(PREFERENCES_LOCAL_STORAGE_KEY))),
                [name]: value
            }))

            dispatchUpdatePreference(name)
        },
        // load preferences from local storage
        loadPreferences: function() {
            let prefs = localStorage.getItem(PREFERENCES_LOCAL_STORAGE_KEY)
            if(!prefs) return
            prefs = JSON.parse(prefs)
            for(const k in prefs) {
                if(k in preferences && k !== 'helpers') {
                    preferences[k] = prefs[k]
                }
            }
        }
    }
})