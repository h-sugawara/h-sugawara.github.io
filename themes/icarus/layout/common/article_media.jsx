const { Component } = require('inferno');

module.exports = class extends Component {
    render() {
        const { url, title, date, dateXml, categories, thumbnail } = this.props;

        return <a className="media" href={url}>
            {thumbnail ? <figure className="media-left image"><img src={thumbnail} alt="" loading="lazy" width="64" height="64" /></figure> : null}
            <div className="media-content">
                <time dateTime={dateXml}>{date}</time>
                <h4 className="title">{title}</h4>
                {categories.length > 0 && categories.join(' / ')}
            </div>
        </a>;
    }
};
