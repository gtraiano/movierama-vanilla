import "./style.css";
import store from "../../store";

class PersonCard extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {}
    /*
    render(person) {
      const div = document.createElement("div");
      div.classList.add("person-item");
      this.setAttribute("person-id", String(person.id));

      const img = document.createElement("img");
      // use srcset!
      img.src = `https://media.themoviedb.org/t/p/w600_and_h900_bestv2${person.profile_path}`;
      img.loading = "lazy";
      div.append(img);
      div.append(document.createTextNode(person.name));

      this.append(div);
      //this.querySelector('.person-item').append(figure)
    }
    */
    render = (person) => {
      person.adult && this.classList.add("adult");
      const div = document.createElement("div");
      div.classList.add("person-item");
      this.setAttribute("person-id", String(person.id));

      const figure = document.createElement("figure");
      figure.classList.add("person-item");

      const figureCaption = document.createElement("figcaption");
      figureCaption.innerHTML = `<p class="name">${person.name}${person.name !== person.original_name ? ` (${person.original_name})` : ""}</p><p class="known-for">${person.known_for_department || ''}</p>`;

      const img = document.createElement("img");
      //img.src = `https://media.themoviedb.org/t/p/w600_and_h900_bestv2${person.profile_path}`;
      //img.srcset = person.profile_path ? `https://media.themoviedb.org/t/p/w600_and_h900_bestv2${person.profile_path} 600w, https://media.themoviedb.org/t/p/w400_and_h600_bestv2${person.profile_path} 400w, https://media.themoviedb.org/t/p/w300_and_h450_bestv2${person.profile_path} 300w` : ''
      img.srcset = store.configuration.helpers.images.generatePosterUrls(person.profile_path).join(',');
      //img.sizes = img.srcset ? "(min-width: 1280px), (max-width: 900px), (max-width: 450px)" : ''
      img.loading = "lazy";
      img.alt = `Image of ${person.name}`;

      figure.append(img);
      figure.append(figureCaption);

      this.append(figure);
    }
}

customElements.define("person-card", PersonCard);
