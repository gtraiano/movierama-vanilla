import "./style.css";

const template = `
  <nav part="tab-label-container" class="tab-label-container">
    <ol part="tab-labels" class="tab-labels"></ol>
  </nav>
  <slot name="tab-card-container" part="tab-card-container"></slot>`;

class TabPanel extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open", slotAssignment: "manual" });
		this.shadowRoot.innerHTML = template;
	}

	#switchTab = (e) => {
		e.stopPropagation();
		// prevent actions when clicking outside a tab label
		if (!e.target?.closest?.("li.tab-label")) return;
		// tab index
		const index = Array.from(
			this.shadowRoot.querySelectorAll("li.tab-label")
		).findIndex((tl) => tl.contains(e.target));
		this._setActiveTab(index);
	}

	connectedCallback() {
		// create and append tab-label for children tab-card elements
		const tabLabels = this.shadowRoot.querySelector(".tab-labels");
		// avoid duplicating labels when the element is re-connected
		if (!tabLabels.children.length) {
			this.querySelectorAll("tab-card").forEach((tc) => {
				try {
					tabLabels.append(this._generateTabLabel(tc));
				}
				catch(e) {
					console.warn(`TabPanel.connectedCallback: ${e.message} [tab label for given name already exists]`);
				}
			});
			this.activeTab = 0;
		}
		// listens to all tab-labels click events
		this.shadowRoot
			.querySelector(".tab-label-container")
			.addEventListener("click", this.#switchTab);
	}

	disconnectedCallback() {
		this.shadowRoot
			.querySelector(".tab-label-container")
			.removeEventListener("click", this.#switchTab);
	}

	_setActiveTab(index) {
		// guard for out of range index
		const tabs = this.querySelectorAll("tab-card");
		if(index < 0 || index > tabs.length - 1) {
			throw RangeError(`Index ${index} is out of range`);
		}
		// clear current active tab label
		this.shadowRoot
			.querySelectorAll("li.tab-label-active")
			.forEach((tl) => {
				tl.classList.remove("tab-label-active");
				tl.part.remove("tab-label-active");
			});

		// set new active tab label
		const activeLabel = this.shadowRoot
			.querySelectorAll("li.tab-label")
			.item(index);
		activeLabel.classList.add("tab-label-active");
		activeLabel.part.add("tab-label-active");
		// assign tab content to slot
		this.querySelector("tab-card.active")?.classList.remove("active");
		tabs[index].classList.add("active");
		this.shadowRoot.querySelector("slot").assign(tabs[index]);
	}

	get activeTab() {
		return Array.from(this.querySelectorAll("tab-card")).findIndex((tc) =>
			tc.classList.contains("active")
		);
	}

	set activeTab(index) {
		try {
			this._setActiveTab(index);
		}
		catch(e) {
			console.warn(`TabPanel.activeTab: ${e.message}`);
		}
	}

	_tabsCount = () => {
		return this.querySelectorAll("tab-card").length;
	};

	static get observedAttributes() {
		// watcher not implemented yet
		return ["active-tab"];
	}

	_generateTabLabel(tab) {
		const tabNames = Array.from(
			this.shadowRoot.querySelectorAll("li.tab-label a.tab-link")
		).map((tl) => tl.textContent);
		const name = tab.getAttribute("tab-name")?.trim();
		if(!name?.length)
			throw Error("Tab name is empty!");
		if(tabNames.includes(name))
			throw Error(`Tab name ${name} is not unique!`);

		// prepare tab-label
		const label = document.createElement("li");
		label.classList.add("tab-label");
		label.part = "tab-label";
		const link = document.createElement("a");
		link.href = "";
		link.classList.add("tab-link");
		link.part = "tab-link";
		link.textContent = name;
		link.addEventListener("click", (e) => {
			e.preventDefault();
		});
		label.append(link);
		return label;
	}

	_insertTab(index, tab) {
		// index guard
		if(
			index !== 0 &&
			(index < 0 || index > this._tabsCount())
		)
			throw Error(`Index ${index} is out of range`);

		const label = this._generateTabLabel(tab);
		const tabLabels = this.shadowRoot.querySelector(".tab-labels");
		const tabCards = this.querySelectorAll("tab-card");
		if(!tabCards.length) {
			tabLabels.append(label);
			this.append(tab);
		}
		else {
			tabLabels.childNodes.item(index - 1).after(label);
			tabCards.item(index - 1).after(tab);
		}
	}

	appendTab(tab) {
		this._insertTab(this._tabsCount(), tab);
		// set 1st tab-card as active if none is already set
		if(this.activeTab === -1) this.activeTab = 0;
	}

	_removeTab(query) {
		// tab index
		const index =
			query.index ??
			Array.from(this.querySelectorAll("tab-card")).findIndex(
				(tc) => tc.getAttribute("tab-name") === query.name
			);
		// # of tab-cards in tab-panel
		const tabsCount = this.querySelectorAll("tab-card").length;
		// guard against invalid index or non-existing name
		if(
			typeof index !== "number" ||
			index === -1 ||
			index < 0 ||
			index > tabsCount - 1
		) {
			if (query.name) throw Error(`tab name ${query.name} does not exist`);
			else if (query.index !== undefined)
				throw Error(`tab index ${query.index} is out of range`);
			return;
		}
		// if tab to be removed is active
		if (this.activeTab === index) {
			// try previous tab-card
			if (index - 1 >= 0) this._setActiveTab(index - 1);
			// or next tab-card
			else if (index + 1 < tabsCount - 1) this._setActiveTab(index + 1);
			// no tab-cards left!
			else this.shadowRoot.querySelector("slot").assign(null);
		}
		// remove tab-card and tab-label
		this.querySelectorAll("tab-card").item(index).remove();
		this.shadowRoot
			.querySelectorAll("li.tab-label")
			.item(index)
			?.remove();
	}

	removeTabByIndex(index) {
		try {
			this._removeTab({ index });
		}
		catch(e) {
			console.error(`TabPanel.removeTabByIndex: ${e.message}`);
		}
	}

	removeTabByName(name) {
		try {
			this._removeTab({ name });
		}
		catch(e) {
			console.error(`TabPanel.removeTabByName: ${e.message}`);
		}
	}
}

customElements.define("tab-panel", TabPanel);
