import './DropDown'
import store from '../../store'
import { PREFERENCES } from '../../store/preferences'
import './style.css'

const template = `
<div>
    <button style="height:fit-content; font-size:x-large;">&#9965;</button>
    <drop-down>
        <div>
            <div class="separator label">search</div>
            <div>
                <label for="incl_adult">Include adult results in search</label>
                <input id="incl_adult" type="checkbox"></input>
            </div>
            <div>
                <label for="prev_adult_poster">Hide adult poster previews</label>
                <input id="prev_adult_poster" type="checkbox"></input>
            </div>
            <div>
                <label for="typing_done_ms">Search query debounce</label>
                <input id="typing_done_ms" placeholder="in ms" type="number" style="width:30%;"></input>
            </div>
            <div class="separator label">theme</div>
            <div>
                <label for="theme_color">Theme style</label>
                <select id="theme_color">
                    <option value="dark">dark</option>
                    <option value="light">light</option>
                </select>
            </div>
            
        </div>
    </drop-down>
</div>
`

class PreferencesMenu extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.innerHTML = template
        this.getElementsByTagName('button')[0].addEventListener('click', this.#openDropDown)
        this.querySelector('#incl_adult').addEventListener('change', this.#setPreference(PREFERENCES.INCLUDE_ADULT_SEARCH))
        this.querySelector('#prev_adult_poster').addEventListener('change', this.#setPreference(PREFERENCES.PREVIEW_ADULT_POSTER))
        this.querySelector('#typing_done_ms').addEventListener('change', this.#setPreference(PREFERENCES.SEARCH_QUERY_DEBOUNCE))
        this.querySelector('#theme_color').addEventListener('change', this.#setPreference(PREFERENCES.THEME))
    }

    disconnectedCallback() {
        this.getElementsByTagName('button')[0].removeEventListener('click', this.#openDropDown)
        this.querySelector('#incl_adult').removeEventListener('change', this.#setPreference(PREFERENCES.INCLUDE_ADULT_SEARCH))
        this.querySelector('#prev_adult_poster').removeEventListener('change', this.#setPreference(PREFERENCES.PREVIEW_ADULT_POSTER))
        this.querySelector('#typing_done_ms').removeEventListener('change', this.#setPreference(PREFERENCES.SEARCH_QUERY_DEBOUNCE))
        this.querySelector('#theme_color').removeEventListener('change', this.#setPreference(PREFERENCES.THEME))
    }

    static get observedAttributes() {
        return ['open']
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'open') {
            if(newValue === '') {
                this.getElementsByTagName('drop-down')[0].setAttribute('visible', '')
                window.addEventListener('click', this.#detectClickOutside)
                this.addEventListener('keydown', this.#detectClickOutside)
            }
            else if(newValue === null) {
                this.getElementsByTagName('drop-down')[0].removeAttribute('visible', '')
                window.removeEventListener('click', this.#detectClickOutside)
                this.removeEventListener('keydown', this.#detectClickOutside)
            }
        }
    }

    #setPreference = name => e => {
        if(e.target.type === 'checkbox') store.preferences.helpers.setPreference(name, Boolean(e.target.checked))
        else if(e.target.type === 'number') store.preferences.helpers.setPreference(name, Number(e.target.value))
        else store.preferences.helpers.setPreference(name, e.target.value)
    }

    loadPreferences = pref => {
        console.info('Loading preferences in <preferences-menu>')
        this.querySelector('#incl_adult').checked = pref.includeAdultSearch
        this.querySelector('#prev_adult_poster').checked = pref.previewAdultPoster
        this.querySelector('#typing_done_ms').value = pref.searchQueryDebounce
        this.querySelector('#theme_color').value = pref.theme ?? 'black'
    }

    #detectClickOutside = e => {
        // tabbing outside
        if(e.type === 'keydown' && e.key === 'Tab') {
            // reached last child, nowhere else to tab to
            if(this.querySelector('drop-down > div').lastElementChild.contains(e.target)) {
                this.removeAttribute('open')
            }
        }
        // clicking outside menu
        else if(e.type === 'click') {
            // check if event target is not a descendant of the component (i.e. "outside" the menu)
            if(!this.contains(e.target)) {
                this.removeAttribute('open')
            }
        }
    }

    #openDropDown = () => {
        const isOpen = this.getAttribute('open')
        if(isOpen === null) {
            this.setAttribute('open', '')
        }
        else {
            this.removeAttribute('open')
        }
    }
}

customElements.define('preferences-menu', PreferencesMenu)