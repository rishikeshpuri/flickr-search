import React from "react";
import { getImageUrl } from "./utils.js";

export default class ImageList extends React.Component {
	constructor(props) {
		super(props);
	}

	renderImageItem(image, idx) {
		const { farm, server, id, secret } = image;
		return (
			<li key={idx} className="image-item">
				<img src={getImageUrl(farm, server, id, secret)} alt="" width="300px" />
			</li>
		);
	}

	render() {
		return (
			<ul className="h-flex sb">
				{this.props.images.map((image, idx) => this.renderImageItem(image, idx))}
			</ul>
		);
	}
}
