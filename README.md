# MovieRama Vanilla
My following attempt at implementing the **MovieRama** application with vanilla JS.

Live demo [here](https://movierama-vanilla.onrender.com/)

It covers all required typical user flows.

Developed using [vite](https://vitejs.dev)

All data provided by [The Movie DB API](https://developers.themoviedb.org/3/getting-started)

Using favicon by <a href="https://www.freepik.com/icon/photography_14062716#fromView=search&term=film+reel&track=ais&page=6&position=12&uuid=ce47139d-cd2d-422b-9912-ce2c647f2488">Roundicons Premium</a>

## Configuration
Requests to The Movie DB API require authentication. Should you run the application locally, you need to [issue](https://developers.themoviedb.org/3/getting-started/authentication) an API key.

Two authentication methods are supported
1. via an API key: set variable `VITE_API_KEY` equal to the value of your API key
2. via a bearer token: set variable `VITE_API_READ_ACCESS_TOKEN` equal to the value of your Read Access Token

The two methods are exclusive. If both variables are defined, method 2. is preferred.

Permanent storage of your credentials must be inside the `.env` file in the root folder.

## Scripts

`npm install` to install dependencies

`npm run dev` to start the development server

`npm run build` to build (bundle) the source code

## User Flows
1. _**In theaters**_
   - Show a list of movies now playing in theaters. Basic information about each movie is provided as well. The list is initially populated, and expanded with infinite scrolling afterwards.
2. _**Search for movies**_
   - Type a movie title in a search box and show the results. List behaviour is identical to the previous flow.
3. _**View movie details**_
   - Show extended information about a movie when the user clicks on it in the movies list.
4. _**Select content language**_
   - Allow user to view content in any of the languages MovieDB supports.
5. _**Select different movie lists methods**_
   - Besides "In Theaters", allow user to switch between and view movie lists offered by "Popular", "Upcoming" and "Top Rated" modes.

## Implementation
This section contains brief descriptions of the various components of the application. I utilized custom elements with the intent to separate the HTML and actions of each element from the main application code. This was my initiation to the concept and thus I have only applied the elementary features of custom elements.

The main flow was to either have the template HTML code stored as a string for simple/static templates, or have functions generating the template string when external data dependecy was involved.

Element reactivity was achieved by merely manipulating custom elements' tree and replacing/adding to stale elements fresh ones generated from updated data.

### Components
### **`<search-bar>`**
This component covers the _"search for movie"_ user flow. It dispatches the query text to the main app via a custom event.

The main app listens to events specific for receiving a search query and initiates a call to the Movie Database API (*MDB API*) and displays the search results as detail cards in a grid.

### **`<movie-card>`**
This component implements a visual presentation of basic information for a movie (a detail card).
It is used both in _"search for movie"_ and _"in theaters"_ user flows.

When the user clicks on the movie poster, the application shows the movie details in an overlay. The component dispatches a custom event to the main app to initiate all required actions for the _"view movie details"_ user flow.

### **`<item-grid>`**
This component presents `<movie-card>`s' in a grid and is used in _"search for movie"_, _"in theaters"_ and _"select different movie lists"_ user flows.

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

### **`<alert-box>`**
This component implements an alert box. It serves the purpose of notifying the user with a message via the UI.

Control of component display can be achieved with the following attributes:
1. `show` set to a boolean value
2. `loading` set to a boolean value to display text with a flashing animation

Complimentary to the above, the attribute `message` is used to set the text to be displayed within the alert box.

### **`<loading-spinner>`**
This component implements a loading spinner with a text label appended.
The following attributes are observed:
1. `message` sets the text label
2. `direction` set either to "row" (label appened next to spinner) or "column" (label appended below spinner) controls the flow of the component

### **`<top-bar>`**
This component implements a top header bar, which can contain other content (in our case the `search-bar`).

### **`<filter-tab>`**
This component implements a simple filter panel. The component dispatches events to signal changes, depending on the event handler to act on the events.

### **`<browse-mode>`**
This component implements a navigation menu for switching between the various movie lists modes offered by the TMDB API. The component signals the application mode change via an event dispatch.

### **`main.js`**
This is the main application component (entry point) that handles all user flows. The component stores _"in theaters"_ and _"search for movie"_ results locally, along with _"view movie details"_ data. All user flow actions are initiated by custom events which the app listens to.

### **Controllers**

### **`MovieDBAPI`**
A controller for *MDB API* requests. It uses the `fetch` API. Each of the *MDB API* endpoints necessary for the application is mapped to a respective function.

### **Store**
The application uses an object to store all data required in the different user flows. _"In theaters"_ (as well as the rest movie lists modes) data are "cached" in the store as to avoid unnecessary *MDB API* requests when switching between _"in theaters"_ and _"search for movie"_ user flows.

The following table presents the store schema 

|Property||||Description|
|-|-|-|-|-|
|**`configuration`**||||MDB API [configuration](https://developers.themoviedb.org/3/configuration/get-api-configuration)|
||`helpers`|||helper functions|
|||`images`|||
||||`posterBasewidth`|poster base width (in pixels) used in calculating ratios|
||||`generatePosterUrls(fname, mode, includeOriginal)`|generates `<img>` srcset urls for given `fname`<br>`mode` = 'x' \| 'w' determines whether urls will contain image width to `posterBaseSize` ratio (e.g. 1.5x) or image width (e.g. 720w) suffix|
||||`backdropBasewidth`|backdrop base width (in pixels) used in calculating ratios|
||||`generateBackdropUrls(fname, mode, includeOriginal)`|generates `image-set` urls for given `fname`<br>`mode` = 'x' \| 'w' determines whether urls will contain image width to `backdropBaseSize` ratio (e.g. 1.5x) or image width (e.g. 720w) suffix|
|**`genres`**||||movie genres|
||`table`|||movie genres lookup [table](https://developers.themoviedb.org/3/genres/get-item-grid)|
||`lookup(id)`|||movie genres lookup function|
|**`nowPlaying`**||||in theaters [results](https://developers.themoviedb.org/3/movies/get-now-playing)|
|**`query`**||||search query text|
|**`search`**||||search query [results](https://developers.themoviedb.org/3/search/search-movies)|
|**`movieDetails`**||||movie [details](https://developers.themoviedb.org/3/movies/get-movie-details) and relative data|
|**`mode`**||||application mode|
|**`filter`**||||movie list filter tags|
||`name: string, type: 'input'\|'checkbox-container', applyFilter: function, value?: string, boxes?: [], updateLabels?: function`|||tag object properties|
||`tags`|||array containing tag objects|
||`helpers`|||helper functions|
|||`getTag(name)`||returns reference to tag in `tags` with name equal to provided name|
|||`setTag(tag)`||sets tag with given name in `tags` equal to provided tag object|
|||`appendToTag(tag)`||appends elements to tag|

### **Custom Events**
|Event Name|Description|Use in Application|
|-|-|-|
|`initializedApp`|signals application initialization is complete|*MDB API* configuration and genre data have been fetched|
|`infinitescroll`|signals an infinite scroll event|fetch next page of movie data and render it as `movie-cards` in the `item-grid`|
|`modeupdate`|signals application has switched user mode flow|<ul style="padding-left:4%; list-style-type:decimal"><li>determine which movie dataset (_in theaters_ or _search_) to render in `item-grid`</li><li>determine which movie dataset to update on `infinitescroll` event</li></ul>|
|`searchquery`|signals a search query has been initiated|receive query text and perform necessary *MDB API* requests for _"search for movie"_ user flow|
|`endsearchquery`|signals a search query has ended/must end|switch app mode to _"in theaters"_|
|`requestmoviedetails`|signals a request for movie details|<ul style="padding-left:4%; list-style-type:decimal"><li>receive movie id and perform necessary *MDB API* requests for _"view movie details"_ user flow</li><li>render a `movie-details` element and present it inside the `over-lay` element</li></ul>|
|`openoverlay`|signals a request to show the `over-lay`|hide overflow of document body and call method to open `over-lay`|
|`closeoverlay`|signals a request to hide the `over-lay`|restore overflow of doument body and call method to close `over-lay`|
|`updatepreference`|signals that a preference value has changed|dispatched by the method `store.preferences.helpers.setPreference`, which in turn is called by change event listeners in `preferences-menu`|
|`filtertag`|signals that a filter tag value has changed|dispatched by the `<filter-tab>` component|