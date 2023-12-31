const { Component } = require('inferno');

module.exports = class extends Component {
    render() {
        const { url, title, date, dateXml, categories, thumbnail } = this.props;

        return <article className="media">
            {thumbnail ? <figure className="media-left">
                <a className="image" href={url}><img src={thumbnail} alt={title} loading="lazy" /></a>
            </figure> : null}
            <div className="media-content">
                <time className="date" dateTime={dateXml}>{date}</time>
                <a className="title" href={url}>{title}</a>
                {categories.length > 0 && <p className="categories">{categories.join(' / ')}</p>}
            </div>
        </article>;
    }
};
