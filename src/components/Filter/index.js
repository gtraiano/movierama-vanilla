import './style.css';
import { dispatchFilterTag } from '../../events/FilterTag';
import { stringTemplateToFragment } from '../util';
import { TagTypes } from '../../store/filter';

const template =
    `
<div>
    <button class="filter-button">filter</button>
    <div class="filter-tab">
        <button id="filter-clear">clear</button>
    </div>
</div>
`

class Filter extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        //this.innerHTML = template
        Array.from(this.children).forEach(c => c.remove())
        this.append(stringTemplateToFragment(template))
        this.getElementsByClassName('filter-button')[0].addEventListener('click', () => {
            const tab = this.getElementsByClassName('filter-tab')[0]
            this.toggleAttribute('visible')
            /*if (!tab.hasAttribute('visible')) tab.setAttribute('visible', '')
            else tab.removeAttribute('visible')*/
        })
        this.querySelector("#filter-clear").addEventListener("click", () => {
            this.uncheckFilterTags()
            this.clearFilterTitle()
        })
    }

    disconnectedCallback() {
        this.removeChild(this.children[0])
        document.removeEventListener('click', this.#detectClickOutside)
    }

    static get observedAttributes() {
        return ['visible']
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if(name === 'visible') {
            newValue === null && document.removeEventListener('click', this.#detectClickOutside)
            newValue === '' && document.addEventListener('click', this.#detectClickOutside)
        }
    }

    uncheckFilterTags = () => {
        this.querySelectorAll('filter-tab input:checked').forEach(i => i.click())
    }

    clearFilterTitle = () => {
        const title = this.querySelector('#filter-title > input:not(:placeholder-shown)')
        if (title) {
            title.value = ""
            title.dispatchEvent(new Event("input"))
        }
    }


    createTag = tag => {
        // create tag container
        const fe = document.createElement('div')
        fe.classList.add('filter-element')
        fe.id = `filter-${tag.name.replaceAll(/\s/g, '-')}`
        !tag.use && fe.setAttribute('hidden', '')

        if (tag.type === TagTypes.TEXT) {
            const lbl = document.createElement('label')
            lbl.textContent = tag.name
            fe.append(lbl);

            const inp = document.createElement('input')
            inp.type = 'text'
            inp.placeholder = ''
            inp.pattern = '(\\w+\\s*)+'
            inp.addEventListener('input', e => {
                dispatchFilterTag({ name: tag.name, value: e.target.value });
            });
            fe.append(inp)
        }
        else if (tag.type === TagTypes.CHECKBOXES) {
            // create label
            const lbl = document.createElement('label')
            lbl.textContent = tag.name
            fe.append(lbl)

            // create checkboxes container
            const cnt = document.createElement('div')
            cnt.classList.add(tag.type)

            // create checkboxes with labels
            Array.from(tag.boxes.keys()).sort().forEach(tagLabel => {
                const b = document.createElement('div')

                const l = document.createElement('label')
                //l.textContent = box.label
                //l.htmlFor = box.label
                l.textContent = tagLabel
                l.htmlFor = tagLabel

                const cb = document.createElement('input')
                cb.type = 'checkbox'
                //cb.id = box.label
                cb.id = tagLabel
                cb.addEventListener('change', e => {
                    //dispatchFilterTag({ name: tag.name, label: box.label, value: e.target.checked })
                    dispatchFilterTag({ name: tag.name, label: tagLabel, value: e.target.checked })
                    //this.querySelector('.filter-button').classList[this.#isActive() ? 'add' : 'remove']('active')
                })

                b.append(cb)
                b.append(l)

                cnt.append(b)
            })

            fe.append(cnt)
        }
        else {
            throw Error(`createTag: ${tag.type} is not a valid tag type`)
        }
        return fe
    }

    insertTag = tag => {
        if (!tag || !tag.name?.trim().length) return
        // to avoid duplicates
        const t = this.createTag(tag)
        // replace existing
        if (this.querySelector(`.filter-element#filter-${tag.name.replaceAll(/\s/g, '-')}`)) {
            this.querySelector(`.filter-element#filter-${tag.name.replaceAll(/\s/g, '-')}`).replaceWith(t)
        }
        // append new
        //else this.getElementsByClassName('filter-tab')[0].append(t)
        else this.querySelector('#filter-clear').insertAdjacentElement("beforebegin", t)
    }

    insertTags = (tags) => {
        tags.forEach(tag => {
            this.insertTag(tag)
        })
    }


    insertTags = (tags) => {
        tags.forEach(tag => {
            this.insertTag(tag)
        })
    }

    appendToTag = (tag, label) => {
        if (!tag || !label?.trim().length) return
        const target = [...this.querySelectorAll('.filter-element > label')].find(e => e.textContent === tag).parentElement

        if (!target) {
            console.warn(`appendToTag: Tag ${tag} does not exist`)
            return
        }

        if ([...target.querySelectorAll('input[type="checkbox"] ~ label')].findIndex(l => l.textContent === label) !== -1) {
            console.warn(`appendToTag: Tag name ${tag} already exists`)
            return
        }

        if (target.children[1].classList.contains('checkbox-container')) {
            const b = document.createElement('div')

            const l = document.createElement('label')
            l.textContent = label
            l.htmlFor = label

            const cb = document.createElement('input')
            cb.type = 'checkbox'
            cb.id = label
            cb.addEventListener('change', e => { dispatchFilterTag({ name: target.children[0].textContent, label: label, value: e.target.checked }) })

            b.append(cb)
            b.append(l)

            target.children[1].appendChild(b)
        }
        else {
            console.warn('appendToTag for text input is not implemented')
        }
    }

    clearTag = tag => {
        const target = [...this.querySelectorAll('.filter-element > label')].find(e => e.textContent === tag).parentElement
        if (!target) {
            console.warn(`clearTag: Tag ${tag} does not exist`)
            return
        }

        if (target.children[1].classList.contains('checkbox-container')) {
            //target.children[1].removeChild()
            target.children[1].childElementCount > 0 && [...target.children[1].children].forEach(c => {
                c.remove()
                //target.children[1].removeChild(c)
            })
        }
        else if (target.children[1].tagName === 'INPUT') {
            target.children[1].value = ''
        }
    }

    clearAllTags = () => {
        const targets = [...this.querySelectorAll('.filter-element > label')].map(t => t.parentElement)
        targets.forEach(t => { t.remove() })
    }

    #isActive = () => {
        return [...this.querySelectorAll('.filter-element input')].some(t => t.type === 'text' ? t.value.trim().length : t.checked)
    }

    toggleTag = (tag, show) => {
        const target = Array.from(this.querySelectorAll('.filter-element > label')).find(l => l.textContent === tag)
        if (show) target.parentElement.removeAttribute('hidden')
        else if (show === false) target.parentElement.setAttribute('hidden', '')
        else {
            if (target.getAttribute('hidden')) target.parentElement.removeAttribute('hidden')
            else target.parentElement.setAttribute('hidden', '')
        }
    }

    #detectClickOutside = (e) => {
        !this.contains(e.target) && this.toggleAttribute('visible')
    }
}

customElements.define('filter-tab', Filter);