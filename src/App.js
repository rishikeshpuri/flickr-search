import React from "react";
import "./App.css";

import ImageList from "./ImageList.js";
import constants from "./constants.js";
import { scrollAreaAvailable, debounce, throttle, checkHttpStatus, parseJSON } from "./utils.js";

export default class App extends React.Component {
    constructor(props) {
		super(props);
		const queriesFromStorage = JSON.parse(localStorage.getItem(constants.STORAGE_KEY));
		this.state = {
			searchText: "",
			imageList: [],
			pageNumber: 1,
			queries: queriesFromStorage ? queriesFromStorage : []
		};
    }

    componentDidMount() {
		/* Throttled scroll listener for infinite scrolling */
		window.onscroll = throttle(() => {
			if (scrollAreaAvailable()) return;
			this.handleScroll();
		}, 1000);

		/* Debounced function for search based on input text to mimimize network request on every character typed */
		this.makeDebouncedSearch = debounce(() => {
			/* Save search query */
			this.state.queries.push(this.state.searchText);
			this.setState({ queries: this.state.queries }, this.updateLocalStorage());

			/* Make API call for the query */
			const url = constants.BASE_URL + "&text=" + this.state.searchText;
			fetch(url)
				.then(checkHttpStatus)
				.then(parseJSON)
				.then(resp => {
					this.setState({ imageList: resp.photos.photo });
				})
				.catch(err => {
					console.log(err);
				});
		}, 1000);
	}

    updateLocalStorage() {
		localStorage.setItem(constants.STORAGE_KEY, JSON.stringify(this.state.queries));
	}

    onSearchInputChange= (evt) => {
		const searchText = evt.currentTarget.value;
		this.setState({ searchText });
		const trimmedText = searchText.replace(/\s+$/, "");
		if (trimmedText.length) this.makeDebouncedSearch(trimmedText);
	}

    handleScroll() {
		let url = constants.BASE_URL + "&text=" + this.state.searchText + "&page=" + (this.state.pageNumber + 1);
		fetch(url)
			.then(checkHttpStatus)
			.then(parseJSON)
			.then(resp => {
				resp.photos.photo.forEach(photo => this.state.imageList.push(photo));
				this.setState({
					pageNumber: resp.photos.page,
					imageList: this.state.imageList
				});
			})
			.catch(err => {
				console.log(err);
			});
	}

    render() {
        return(
            <div className="app">
				<div className="app-header">
					<h2 style={{ margin: "1rem 0" }}>Flickr Search</h2>
					<div className="h-flex jc ac search-bar">
						<input
							type="text"
							className="search-input"
							value={this.state.searchText}
							onChange={this.onSearchInputChange}
						/>
					</div>
                        {this.state.queries.length > 0 &&
                            <div style={{ marginTop: "16px" }}>
                                <h5 style={{ marginBottom: "5px" }}>Recent Searches</h5>
                                <ul className="h-flex jc">
                                    {this.state.queries.map((query, idx) =>
                                        <li key={idx} className="query">
                                            {query}
                                        </li>
                                    )}
                                </ul>
                            </div>}
                </div>

                <div className="app-content" ref="appContent">
					{this.state.imageList.length
						? <ImageList images={this.state.imageList}/>
						: <p style={{ margin: "1rem 0", color:'red' }}>
                        <h1>Type on search input box</h1>
                        </p>}
				</div>
        </div>    
        )    
    }

}