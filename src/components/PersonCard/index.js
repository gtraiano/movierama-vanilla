import "./style.css";
import store from "../../store";
import { fileTemplateToHTMLTemplate } from '../util'

let template
(async () => {
	template = await fileTemplateToHTMLTemplate("/person-card-template.html")
})()

class PersonCard extends HTMLElement {
	static contentTemplate = null

	constructor() {
		super();
		if(!PersonCard.contentTemplate) {
            PersonCard.contentTemplate = template
            console.info(`loaded ${PersonCard.name} template`)
        }
	}

	connectedCallback() { }

	render = (person) => {
		person.adult && this.classList.add("adult")
		this.append(this.generateTemplate(person))
	}

	generateTemplate(person) {
		const card = PersonCard.contentTemplate.content.cloneNode(true)
		const img = card.querySelector("img")
		const figure = card.querySelector("figure")
		const figureCaption = card.querySelector("figcaption")

		figure.classList.add("person-item");
		
		figureCaption.querySelector(".name").textContent = `${person.name}${person.name !== person.original_name ? ` (${person.original_name})` : ""}`
		figureCaption.querySelector(".known-for").textContent = `${person.known_for_department || ''}`

		img.srcset = store.configuration.helpers.images.generatePosterUrls(person.profile_path).join(',')
		img.alt = `Image of ${person.name}`
		return card
	}
}

customElements.define("person-card", PersonCard);
