/* credit: https://css-tricks.com/five-methods-for-five-star-ratings/#aa-method-5-using-unicode-symbols */
import './style.css'

class StarRating extends HTMLElement {
    static base = 10; // rating range [0, 10]
    constructor() {
        super()
    }

    connectedCallback() {}

    disconnectedCallback() {}

    static get observedAttributes() {
        return ['rating', 'ratings-count']
    }
  
    attributeChangedCallback(name, _oldValue, newValue) {
        if(name === 'rating') {
            if(!Number.isNaN(Number.parseFloat(newValue))) {
                this.querySelector('div.stars')?.remove()
                const stars = document.createElement('div')
                stars.textContent = '★'.repeat(StarRating.base)
                stars.classList.add('stars')
                const pct = (newValue / StarRating.base) * 100
                stars.style.background = `linear-gradient(90deg, var(--star-background) ${pct}%, var(--star-color) ${pct}%)`
                stars.style.backgroundClip = 'text'
                this.append(stars)
            }
        }
    }
}

customElements.define('star-rating', StarRating)

export default StarRating