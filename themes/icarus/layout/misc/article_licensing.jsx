const {Component} = require('inferno');
const {cacheComponent} = require('hexo-component-inferno/lib/util/cache');

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

        return <div class="article-licensing box">
            <div class="licensing-title">
                {title ? <p>{title}</p> : null}
                <p><a href={link}>{link}</a></p>
            </div>
            <div class="licensing-meta level is-mobile">
                <div class="level-left">
                    {author ? <div class="level-item is-narrow"><div>
                        <p class="is-size-7">{authorTitle}</p><p>{author}</p>
                    </div></div> : null}
                    {createdAt ? <div class="level-item is-narrow"><div>
                        <p class="is-size-7">{createdTitle}</p><p>{createdAt}</p>
                    </div></div> : null}
                    {updatedAt ? <div class="level-item is-narrow"><div>
                        <p class="is-size-7">{updatedTitle}</p><p>{updatedAt}</p>
                    </div></div> : null}
                    {licenses && Object.keys(licenses).length ? <div class="level-item is-narrow"><div>
                        <p class="is-size-7">{licensedTitle}</p>
                        <p>{Object.keys(licenses).map(name => {
                            const license = licenses[name];
                            const className = license.icon ? 'icons' : '';
                            let iconList = [];
                            if (license.icon) {
                                iconList = Array.isArray(license.icon) ? license.icon : [license.icon];
                            }
                            return <a className={className}
                                      rel="noopener"
                                      target="_blank"
                                      title={name}
                                      href={license.url}>
                                {iconList.length ? iconList.map(icon => {
                                    return <i className={"icon ".concat(icon)}></i>
                                }) : name}
                            </a>
                        })}</p>
                    </div></div> : null}
                </div>
            </div>
        </div>
    }
}

ArticleLicensing.Cacheable = cacheComponent(ArticleLicensing, 'misc.article_licensing', props => {
    const { config, page, helper } = props;
    const licenses = (config.article || {}).licenses;
    const { url_for, __, date } = helper;

    let links = {};
    if (licenses) {
        Object.keys(licenses).forEach(name => {
            const license = licenses[name];
            links[name] = {
                url: url_for(typeof license === 'string' ? license : license.url),
                icon: license.icon
            };
        });
    }

    return {
        title: page.title,
        link: decodeURI(page.permalink),
        author: page.author || config.author,
        authorTitle: __('article.licensing.author'),
        createdAt: page.date ? date(page.date) : null,
        createdTitle: __('article.licensing.created_at'),
        updatedAt: page.updated ? date(page.updated) : null,
        updatedTitle: __('article.licensing.updated_at'),
        licenses: links,
        licensedTitle: __('article.licensing.licensed_under')
    };
});

module.exports = ArticleLicensing;
