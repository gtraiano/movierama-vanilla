import "./style.css";

class Tab extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `<slot name="tab-content"></slot>`;
    }

    render(content) {
        content.slot = "tab-content";
        this.append(content);
    }

    disconnectedCallback() { }

    static get observedAttributes() {
        return ["tab-name"];
    }
}

customElements.define("tab-card", Tab);
