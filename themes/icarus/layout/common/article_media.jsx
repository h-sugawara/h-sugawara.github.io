const { Component } = require('inferno');

module.exports = class extends Component {
    render() {
        const { url, title, date, dateXml, categories, thumbnail } = this.props;
        return <article className="media">
            {thumbnail ? <figure className="media-left">
                <a className="image" href={url}><img src={thumbnail} alt={title} loading="lazy" /></a>
            </figure> : null}
            <div className="media-content">
                <p className="date"><time dateTime={dateXml}>{date}</time></p>
                <p className="title"><a href={url}>{title}</a></p>
                {categories.length ? <p className="categories">{categories.join(' / ')}</p> : null}
            </div>
        </article>;
    }
};
