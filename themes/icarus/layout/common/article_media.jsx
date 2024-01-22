const { Component } = require('inferno');

module.exports = class extends Component {
    render() {
        const { url, title, date, dateXml, categories, thumbnail } = this.props;

        return <a className="media link-muted" href={url}>
            {thumbnail ? <figure className="media-left image"><img src={thumbnail} alt={title} loading="lazy" /></figure> : null}
            <div className="media-content">
                <time className="date" dateTime={dateXml}>{date}</time>
                <h4 className="title">{title}</h4>
                {categories.length > 0 && <p className="categories">{categories.join(' / ')}</p>}
            </div>
        </a>;
    }
};
