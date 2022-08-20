# MovieRama Vanilla
My following attempt at implementing the **MovieRama** application with vanilla JS.

Live demo [here](https://movierama-vanilla.herokuapp.com)

It covers all required typical user flows.

Developed using [vite](https://vitejs.dev)

## Scripts

`npm install` to install dependencies

`npm run dev` to start the development server

`npm run build` to build (bundle) the source code

## Implementation
This section contains brief descriptions of the various components of the application. I utilized custom elements with the intent to separate the HTML and actions of each element from the main application code. This was my initiation to the concept and thus I have only applied the elementary features of custom elements.

The main flow was to either have the template HTML code stored as a string for simple/static templates, or have functions generating the template string when external data dependecy was involved.

Element reactivity was achieved by merely manipulating custom elements' tree and replacing stale elements and with fresh ones generated from updated data.

### Components
### **`<search-bar>`**
This component covers the _"search for movie"_ user flow. It dispatches the query text to the main app via a custom event. Dispatches are debounced and are only sent 1250 ms after the user has stopped typing in the search bar.

The main app listens to events specific for receiving a search query and initiates a call to the Movie Database API (*MDB API*) and displays the search results as detail cards in a grid.

### **`<movie-card>`**
This component implements a visual presentation of basic information for a movie (a detail card).
It is used both in _"search for movie"_ and _"in theaters"_ user flows.

When the user clicks on the movie poster, the application shows the movie details in an overlay. The component dispatches a custom event to the main app to initiate all required actions for the _"view movie details"_ user flow.

### **`<movie-list>`**
This component presents `<movie-card>`s' in a grid and is used in _"search for movie"_ and _"in theaters"_ user flows.

### **`<over-lay>`**
This component implements an overlay that presents content over the main app UI.
It is used in _"view movie details"_ user flow.

The component dispatches a custom event when the user closes it, either via the '&times;' button or by pressing the *Esc* key.

Controlling of overlay display can be achieved in two ways:
1. by the `show` attribute
2. by the `openOverlay` and `closeOverlay` methods

### **`<movie-details>`**
This component covers the _"view movie details"_ user flow and presents movie 
details. The component is provided with data for movie reviews, similar movies list and movie trailer urls and uses HTML template generator functions.

The similar movies list entries are clickable and display the selected movie details when clicked.

### **`main.js`**
This is the main application component (entry point) that handles all user flows. The component stores _"in theaters"_ and _"search for movie"_ results locally, along with _"view movie details"_ data. All user flow actions are initiated by custom events which the app listens to.

### **Controllers**

### **`MovieDBAPI`**
A controller for *MDB API* requests. It uses the fetch API. Each of the *MDB API* endpoints necessary for the application is mapped to a respective function.

### **Store**
The application uses an object to store all data required in the different user flows. _"In theaters"_ data are "cached" in the store as to avoid unnecessary *MDB API* requests when switching between _"in theaters"_ and _"search for movie"_ user flows.

The following table presents the store schema 

|Property||||Description|
|-|-|-|-|-|
|**`configuration`**||||MDB API [configuration](https://developers.themoviedb.org/3/configuration/get-api-configuration)|
||`helpers`|||helper functions|
|||`images`|||
||||`generatePosterUrls(fname, includeOriginal)`|generates `<img>` srcset urls for given `fname`|
|**`genres`**||||movie genres|
||`table`|||movie genres lookup [table](https://developers.themoviedb.org/3/genres/get-movie-list)|
||`lookup(id)`|||movie genres lookup function|
|**`nowPlaying`**||||in theaters [results](https://developers.themoviedb.org/3/movies/get-now-playing)|
|**`query`**||||search query text|
|**`search`**||||search query [results](https://developers.themoviedb.org/3/search/search-movies)|
|**`movieDetails`**||||movie [details](https://developers.themoviedb.org/3/movies/get-movie-details) and relative data|
|**`mode`**||||application mode|

### **Custom Events**
|Event Name|Description|Use in Application|
|-|-|-|
|`initializedApp`|signals application initialization is complete|*MDB API* configuration and genre data have been fetched|
|`infinitescroll`|signals an infinite scroll event|fetch next page of movie data and render it as `movie-cards` in the `movie-list`|
|`modeupdate`|signals application has switched user mode flow|<ul style="padding-left:4%; list-style-type:decimal"><li>determine which movie dataset (_in theaters_ or _search_) to render in `movie-list`</li><li>determine which movie dataset to update on `infinitescroll` event</li></ul>|
|`searchquery`|signals a search query has been initiated|receive query text and perform necessary *MDB API* requests for _"search for movie"_ user flow|
|`endsearchquery`|signals a search query has ended/must end|switch app mode to _"in theaters"_|
|`requestmoviedetails`|signals a request for movie details|<ul style="padding-left:4%; list-style-type:decimal"><li>receive movie id and perform necessary *MDB API* requests for _"view movie details"_ user flow</li><li>render a `movie-details` element and present it inside the `over-lay` element</li></ul>|
|`openoverlay`|signals a request to show the `over-lay`|hide overflow of document body and call method to open `over-lay`|
|`closeoverlay`|signals a request to hide the `over-lay`|restore overflow of doument body and call method to close `over-lay`|
