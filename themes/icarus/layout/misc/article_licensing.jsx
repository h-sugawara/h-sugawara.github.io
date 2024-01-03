const {Component} = require('inferno');
const {cacheComponent} = require('hexo-component-inferno/lib/util/cache');
const FontAwesomeIcon = require('./font_awesome_icon');

class ArticleLicensing extends Component {
    render() {
        const {
            title,
            link,
            author,
            authorTitle,
            createdAt,
            createdTitle,
            updatedAt,
            updatedTitle,
            licenses,
            licensedTitle,
        } = this.props;

        return <div className="article-licensing box">
            <div className="licensing-title">
                {title ? <p>{title}</p> : null}
                <a href={link}>{link}</a>
            </div>
            <div className="licensing-meta level is-mobile level-left">
                {author ? <div className="level-item is-narrow"><div><p>{authorTitle}</p>{author}</div></div> : null}
                {createdAt ? <div className="level-item is-narrow"><div><p>{createdTitle}</p>{createdAt}</div></div> : null}
                {updatedAt ? <div className="level-item is-narrow"><div><p>{updatedTitle}</p>{updatedAt}</div></div> : null}
                {licenses && Object.keys(licenses).length ? <div className="level-item is-narrow"><div>
                    <p>{licensedTitle}</p>
                    {Object.keys(licenses).map(name => {
                        const license = licenses[name];
                        let iconList = [];
                        if (license.icon) {
                            iconList = Array.isArray(license.icon) ? license.icon : [ license.icon ];
                        }
                        return <a className={license.icon ? 'icons' : ''}
                            rel="noopener"
                            target="_blank"
                            title={name}
                            href={license.url}>
                            {iconList.length ? iconList.map(icon => <FontAwesomeIcon type={icon} className="icon" />) : name}
                        </a>;
                    })}
                </div></div> : null}
            </div>
        </div>;
    }
}

ArticleLicensing.Cacheable = cacheComponent(ArticleLicensing, 'misc.article_licensing', props => {
    const { config, page, helper } = props;
    const licenses = (config.article || {}).licenses;
    const { url_for, __, date } = helper;
    const { title, author = config.author, date: created, updated } = page;

    const links = {};
    if (licenses) {
        Object.keys(licenses).forEach(name => {
            const license = licenses[name];
            links[name] = {
                url: url_for(typeof license === 'string' ? license : license.url),
                icon: license.icon,
            };
        });
    }

    return {
        title,
        link: decodeURI(page.permalink),
        author,
        authorTitle: __('article.licensing.author'),
        createdAt: created ? date(created) : null,
        createdTitle: __('article.licensing.created_at'),
        updatedAt: updated ? date(updated) : null,
        updatedTitle: __('article.licensing.updated_at'),
        licenses: links,
        licensedTitle: __('article.licensing.licensed_under'),
    };
});

module.exports = ArticleLicensing;
