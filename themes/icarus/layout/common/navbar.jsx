const { Component, Fragment } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');
const classname = require('hexo-component-inferno/lib/util/classname');
const FontAwesomeIcon = require('../misc/font_awesome_icon');

function isSameLink(a, b) {
    function santize(url) {
        let paths = url.replace(/(^\w+:|^)\/\//, '').split('#')[0].split('/').filter(p => p.trim() !== '');
        if (paths.length > 0 && paths[paths.length - 1].trim() === 'index.html') {
            paths = paths.slice(0, paths.length - 1);
        }
        return paths.join('/');
    }

    return santize(a) === santize(b);
}

class Navbar extends Component {
    render() {
        const {
            logo,
            logoUrl,
            siteUrl,
            siteTitle,
            menu,
            links,
            showToc,
            tocTitle,
            showSearch,
            searchTitle,
        } = this.props;

        let navbarLogo = '';
        if (logo) {
            navbarLogo = logo.text ? logo.text : <img src={logoUrl} alt={siteTitle} width="140" height="28" />;
        } else {
            navbarLogo = siteTitle;
        }

        return <nav className="navbar navbar-main">
            <div className="container navbar-container">
                <h1 className="navbar-brand">
                    <a className="navbar-item navbar-logo" href={siteUrl}>{navbarLogo}</a>
                </h1>
                <div className="navbar-menu">
                    {Object.keys(menu).length ? <div className="navbar-start">
                        {Object.keys(menu).map(name => {
                            const { active, url } = menu[name];
                            return <a className={classname({ 'navbar-item': true, 'is-active': active })} href={url}>{name}</a>;
                        })}
                    </div> : null}
                    <div className="navbar-end">
                        {Object.keys(links).length ? <Fragment>
                            {Object.keys(links).map(name => {
                                const { url, icon } = links[name];
                                return <a className="navbar-item" target="_blank" rel="noopener" title={name} href={url}>
                                    {icon ? <i className={icon}></i> : name}
                                </a>;
                            })}
                        </Fragment> : null}
                        {showToc && <button className="navbar-item catalogue" title={tocTitle} type="button">
                            <FontAwesomeIcon type="fa-list-ul" className="nav-toc-icon" />
                        </button>}
                        {showSearch && <button className="navbar-item search" title={searchTitle} type="button">
                            <FontAwesomeIcon type="fa-search" className="nav-search-icon" />
                        </button>}
                    </div>
                </div>
            </div>
        </nav>;
    }
}

module.exports = cacheComponent(Navbar, 'common.navbar', props => {
    const { config, helper, page } = props;
    const { url_for, _p, __ } = helper;
    const { logo, title, navbar, widgets, search, plugins } = config;
    const { back_to_top = false } = plugins;

    const hasTocWidget = Array.isArray(widgets) && widgets.find(widget => widget.type === 'toc');
    const showToc = (config.toc === true || page.toc) && hasTocWidget && !back_to_top && ['page', 'post'].includes(page.layout);

    const menu = {};
    if (navbar && navbar.menu) {
        const pageUrl = typeof page.path !== 'undefined' ? url_for(page.path) : '';
        Object.keys(navbar.menu).forEach(name => {
            const url = url_for(navbar.menu[name]);
            const active = isSameLink(url, pageUrl);
            menu[name] = { url, active };
        });
    }

    const links = {};
    if (navbar && navbar.links) {
        Object.keys(navbar.links).forEach(name => {
            const link = navbar.links[name];
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
        menu,
        links,
        showToc,
        tocTitle: _p('widget.catalogue', Infinity),
        showSearch: search && search.type,
        searchTitle: __('search.search'),
    };
});
