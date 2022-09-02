import './DropDown'
import store from '../../store'
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
        this.querySelector('#incl_adult').addEventListener('change', this.#setPreference('includeAdultSearch'))
        this.querySelector('#prev_adult_poster').addEventListener('change', this.#setPreference('previewAdultPoster'))
        this.querySelector('#typing_done_ms').addEventListener('change', this.#setPreference('searchQueryDebounce'))
        this.querySelector('#theme_color').addEventListener('change', this.#setPreference('theme'))
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

    #openDropDown = () => {
        const dd = this.getElementsByTagName('drop-down')[0]
        const isVisible = dd.getAttribute('visible')
        if(isVisible === null) dd.setAttribute('visible', '')
        else dd.removeAttribute('visible')
    }
}

customElements.define('preferences-menu', PreferencesMenu)