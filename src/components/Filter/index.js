import './style.css';
import { dispatchFilterTag } from '../../events/FilterTag';

const template =
`
<div>
    <button class="filter-button">filter</button>
    <div class="filter-tab"></div>
</div>
`
class Filter extends HTMLElement {
    constructor() {
        super()
    }

    connectedCallback() {
        this.innerHTML = template
        this.getElementsByClassName('filter-button')[0].addEventListener('click', () => {
            const tab = this.getElementsByClassName('filter-tab')[0]
            if(!tab.hasAttribute('visible')) tab.setAttribute('visible', '')
            else tab.removeAttribute('visible')
        })
    }

    disconnectedCallback() {
        this.removeChild(this.children[0])
    }

    createTag = tag => {
        // create tag container
        const fe = document.createElement('div')
        fe.classList.add('filter-element')
        !tag.use && fe.setAttribute('hidden', '')
        
        if(tag.type === 'input') {            
            const lbl = document.createElement('label')
            lbl.textContent = tag.name
            fe.append(lbl);
            
            const inp = document.createElement('input')
            inp.oninput = dispatchFilterTag(tag.name)
            inp.addEventListener('input', e => {
                dispatchFilterTag({ name: tag.name, value: e.target.value });
                this.querySelector('.filter-button').classList[this.#isActive() ? 'add' : 'remove']('active')
            });
            fe.append(inp)
        }
        else if(tag.type === 'checkbox-container') {
            // create label
            const lbl = document.createElement('label')
            lbl.textContent = tag.name
            fe.append(lbl)
            
            // create checkboxes container
            const cnt = document.createElement('div')
            cnt.classList.add(tag.type)
            
            // create checkboxes with labels
            tag.boxes.forEach(box => {
                const b = document.createElement('div')
                
                const l = document.createElement('label')
                l.textContent = box.label
                l.htmlFor = box.label
                
                const cb = document.createElement('input')
                cb.type = 'checkbox'
                cb.id = box.label
                cb.addEventListener('change', e => {
                    dispatchFilterTag({ name: tag.name, label: box.label, value: e.target.checked })
                    this.querySelector('.filter-button').classList[this.#isActive() ? 'add' : 'remove']('active')
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
        // to avoid duplicates
        if([...this.querySelectorAll('.filter-element > label')].findIndex(l => l.textContent === tag.name) !== -1) {
            console.warn(`insertTag: Tag name ${tag.name} already exists`)
            return
        }
        const t = this.createTag(tag)
        this.getElementsByClassName('filter-tab')[0].append(t)
    }

    insertTags = (tags) => {
        tags.forEach(tag => {
            this.insertTag(tag)
        })
        this.querySelector('.filter-button').classList[this.#isActive() ? 'add' : 'remove']('active')
    }

    appendToTag = (tag, label) => {
        console.info('appendToTag', tag, label)
        const target = [...this.querySelectorAll('.filter-element > label')].find(e => e.textContent === tag).parentElement

        if(!target) {
            console.warn(`appendToTag: Tag ${tag} does not exist`)
            return
        }

        if([...target.querySelectorAll('input[type="checkbox"] ~ label')].findIndex(l => l.textContent === label) !== -1) {
            console.warn(`appendToTag: Tag name ${tag} already exists`)
            return
        }

        if(target.children[1].classList.contains('checkbox-container')) {
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
        if(!target) {
            console.log(`clearTag: Tag ${tag} does not exist`)
            return
        }

        if(target.children[1].classList.contains('checkbox-container')) {
            //target.children[1].removeChild()
            target.children[1].childElementCount > 0 && [...target.children[1].children].forEach(c => {
                c.remove()
                //target.children[1].removeChild(c)
            })
        }
        else if(target.children[1].tagName === 'INPUT') {
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
        if(show) target.parentElement.removeAttribute('hidden')
        else if(show === false) target.parentElement.setAttribute('hidden', '')
        else {
            if(target.getAttribute('hidden')) target.parentElement.removeAttribute('hidden')
            else target.parentElement.setAttribute('hidden', '')
        }
    }
}

customElements.define('filter-tab', Filter);