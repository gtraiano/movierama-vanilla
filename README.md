# MovieRama Vanilla
My following attempt at implementing the **MovieRama** application with vanilla JS.

Live demo [here](https://movierama-vanilla.herokuapp.com/)

It covers all required typical user flows.

Developed using [vite](https://vitejs.dev/])

## Scripts

`npm install` to install dependencies

`npm run dev` to start the development server

`npm run build` to build (bundle) the source code

## Implementation
This section contains brief descriptions of the various components of the application. To avoid writing huge pieces of HTML code in big chunks, I utilized custom elements instead. This was my initiation to the concept and thus I have only applied the elementary features of custom elements.

The main flow was to either have the template HTML code stored as a string for simple/static templates, or have functions generating the template string when external data dependecy was involved.

Element reactivity was achieved by merely manipulating custom elements' tree and replacing stale elements and with fresh ones generated from updated data.

### Components
### **`SearchBar`**
This component covers the _"search for movie"_ user flow. It dispatches the query text to the main app via a custom event. Dispatches are debounced and are only sent 1250 ms after the user has stopped typing in the search bar.

The main app listens to events specific for receiving a search query and initiates a call to the Movie Database API (*MDB API*) and displays the search results as detail cards in a grid.

### **`MovieCard`**
This component implements a visual presentation of basic information for a movie (a detail card).
It is used both in _"search for movie"_ and _"in theaters"_ user flows.

When the user clicks on the movie poster, the application shows the movie details in an overlay. The component dispatches a custom event to the main app to initiate all required actions for the _"view movie details"_ user flow.

### **`MovieList`**
This component presents `MovieCards` in a grid and is used in _"search for movie"_ and _"in theaters"_ user flows.

### **`Overlay`**
This component implements an overlay that presents content over the main app UI.
It is used in _"view movie details"_ user flow.

The component dispatches a custom event when the user closes it, either via the 'x' button or by pressing the *Esc* key.

Controlling of overlay display can be achieved in two ways:
1. by the `show` attribute
2. by the `openOverlay` and `closeOverlay` methods

### **`MovieDetails`**
This component covers the _"view movie details"_ user flow and presents movie 
details. The component is provided with data for movie reviews, similar movies list and movie trailer urls and uses HTML template generator functions.

The similar movies list entries are clickable and display the selected movie details when clicked.

### **`main.js`**
This is the main application component (entry point) that handles all user flows. The component stores _"in theaters"_ and _"search for movie"_ results locally, along with _"view movie details"_ data. All user flow actions are initiated by custom events which the app listens to.

### **Controllers**

### **`MovieDBAPI`**
A controller for *MDB API* requests. It uses the fetch API. Each of the *MDB API* endpoints necessary for the application has a respective function.

### **Store**
The application uses an object to store all data required in the different user flows. _"In theaters"_ data are "cached" in the store as to avoid unnecessary *MDB API* requests when switching between _"in theaters"_ and _"search for movie"_ user flows.

### **Flow Chart**
