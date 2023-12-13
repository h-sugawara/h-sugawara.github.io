const { Component } = require('inferno');

module.exports = class extends Component {
    render() {
        const { url, title, date, dateXml, categories, thumbnail } = this.props;
        return <article class="media">
            {thumbnail ? <figure class="media-left">
                <a class="image" href={url}><img src={thumbnail} alt={title} loading="lazy" /></a>
            </figure> : null}
            <div class="media-content">
                <p class="date"><time dateTime={dateXml}>{date}</time></p>
                <p class="title"><a href={url}>{title}</a></p>
                {categories.length ? <p class="categories">{categories.join(' / ')}</p> : null}
            </div>
        </article>
    }
};
