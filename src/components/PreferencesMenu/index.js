import './DropDown'
import store from '../../store'

const template = `
<div>
    <button style="height:fit-content; font-size:x-large;">&#9965;</button>
    <drop-down>
        <div>
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
                <input id="typing_done_ms" placeholder="in ms" value="${store.preferences.searchQueryDebounce}" style="width:30%;"></input>
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
        this.querySelector('#incl_adult').addEventListener('change', this.#setPreference('includeAdultSearch'))
        this.querySelector('#prev_adult_poster').addEventListener('change', this.#setPreference('previewAdultPoster'))
    }

    #setPreference = name => e => {
        store.preferences.helpers.setPreference(name, Boolean(e.target.checked))
    }

    loadPreferences = pref => {
        console.info('Loading preferences in <preferences-menu>')
        this.querySelector('#incl_adult').checked = pref.includeAdultSearch
        this.querySelector('#prev_adult_poster').checked = pref.previewAdultPoster
    }

    #openDropDown = () => {
        const dd = this.getElementsByTagName('drop-down')[0]
        const isVisible = dd.getAttribute('visible')
        if(isVisible === null) dd.setAttribute('visible', '')
        else dd.removeAttribute('visible')
    }
}

customElements.define('preferences-menu', PreferencesMenu)