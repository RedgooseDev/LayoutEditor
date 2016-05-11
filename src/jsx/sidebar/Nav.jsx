module.exports = React.createClass({

	displayName : 'Navigation',

	getInitialState()
	{
		return {
			timestamp : Date.now()
		};
	},

	/**
	 * Upload images
	 *
	 * @param {Event} e
	 */
	upload(e)
	{
		this.props.upload(e.target.files);

		// reset input[type=file]
		this.setState({
			timestamp : Date.now()
		});
	},

	/**
	 * render
	 */
	render()
	{
		return (
            <nav className="nav-top">
        		<div className="wrap">
        			<button type="button" title="attach images" onClick={this.props.attach}>
						<i className="sp-ico ico-reply abs">Moving the image to grid block</i>
					</button>
					<button type="button" title="toggle select" onClick={this.props.toggleSelect}>
						<i className="sp-ico ico-select abs">Toggle all select</i>
					</button>
					<span title="upload images" key={this.state.timestamp}>
						<input type="file" ref="inputFile" onChange={this.upload} multiple />
						<i className="sp-ico ico-upload abs">upload images</i>
					</span>
					<button type="button" title="remove images" onClick={this.props.remove}>
						<i className="sp-ico ico-trash abs">remove images</i>
					</button>
				</div>
			</nav>
		);
	}
});
