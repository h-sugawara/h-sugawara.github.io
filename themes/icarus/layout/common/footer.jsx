const { Component, Fragment } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');
const FontAwesomeIcon = require('../misc/font_awesome_icon');

class Footer extends Component {
    render() {
        const {
            logo,
            logoUrl,
            siteUrl,
            siteTitle,
            siteYear,
            author,
            links,
            copyright,
            showVisitorCounter,
            visitorCounterTitle,
        } = this.props;

        let footerLogo = '';
        if (logo) {
            footerLogo = logo.text ? logo.text : <img src={logoUrl} alt={siteTitle} width="140" height="28" />;
        } else {
            footerLogo = siteTitle;
        }

        return <footer className="footer">
            <div className="container level">
                <div className="level-start">
                    <a className="footer-logo" href={siteUrl}>{footerLogo}</a>
                    <p>
                        <span dangerouslySetInnerHTML={{__html: `&copy; ${siteYear} ${author || siteTitle}`}}></span>
                        &nbsp;&nbsp;Powered by <a href="https://hexo.io/" target="_blank" rel="noopener" className="underline">Hexo</a>&nbsp;and&nbsp;
                        <a href="https://github.com/ppoffice/hexo-theme-icarus" target="_blank" rel="noopener" className="underline">Icarus</a>
                        {showVisitorCounter ? <Fragment>
                            <br />
                            <span id="busuanzi_container_site_uv" dangerouslySetInnerHTML={{__html: visitorCounterTitle}}></span>
                        </Fragment> : null}
                    </p>
                    {copyright ? <p dangerouslySetInnerHTML={{__html: copyright}}></p> : null}
                </div>
                <div className="level-end">
                    {Object.keys(links).length ? <div className="field has-addons">
                        {Object.keys(links).map(name => {
                            const { icon, url } = links[name];
                            return <a className={`control button${icon ? ' is-large' : ''}`} target="_blank" rel="noopener" title={name} href={url}>
                                {icon ? <FontAwesomeIcon type={icon} /> : name}
                            </a>;
                        })}
                    </div> : null}
                </div>
            </div>
        </footer>;
    }
}

module.exports = cacheComponent(Footer, 'common.footer', props => {
    const {config, helper} = props;
    const {url_for, _p, date} = helper;
    const {logo, title, author, footer, plugins} = config;

    const links = {};
    if (footer && footer.links) {
        Object.keys(footer.links).forEach(name => {
            const link = footer.links[name];
            links[name] = {
                url: url_for(typeof link === 'string' ? link : link.url),
                icon: link.icon,
            };
        });
    }

    return {
        logo,
        logoUrl: url_for(logo),
        siteUrl: url_for('/'),
        siteTitle: title,
        siteYear: date(new Date(), 'YYYY'),
        author,
        links,
        copyright: footer?.copyright ?? '',
        showVisitorCounter: plugins && plugins.busuanzi === true,
        visitorCounterTitle: _p('plugin.visitor_count', '<span id="busuanzi_value_site_uv">0</span>'),
    };
});
