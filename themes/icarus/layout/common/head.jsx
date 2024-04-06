const { Component } = require('inferno');
const MetaTags = require('hexo-component-inferno/lib/view/misc/meta');
const WebApp = require('hexo-component-inferno/lib/view/misc/web_app');
const OpenGraph = require('hexo-component-inferno/lib/view/misc/open_graph');
const WebSiteStructuredData = require('../misc/website_structured_data');
const StructuredData = require('hexo-component-inferno/lib/view/misc/structured_data');
const Assets = require('./assets');
const Constants = require('../constants');

function getPageTitle(helper, page, siteTitle, type) {
    const getPageName = () => {
        const { is_month, is_year, _p } = helper;
        const { title, year, month, category, tag } = page;

        switch (type) {
            case Constants.PAGE_TYPE_ARCHIVE:
                // eslint-disable-next-line no-case-declarations
                const pageName = _p('common.archive', Infinity);
                if (is_month()) {
                    return `${pageName}: ${year}/${month}`;
                } else if (is_year()) {
                    return `${pageName}: ${year}`;
                }
                return pageName;
            case Constants.PAGE_TYPE_CATEGORIES:
                return _p('common.category', Infinity);
            case Constants.PAGE_TYPE_CATEGORY:
                return `${_p('common.category', 1)}: ${category}`;
            case Constants.PAGE_TYPE_TAGS:
                return _p('common.tag', Infinity);
            case Constants.PAGE_TYPE_TAG:
                return `${_p('common.tag', 1)}: ${tag}`;
        }
        return title;
    };

    return [getPageName(), siteTitle].filter(str => typeof str !== 'undefined' && str.trim() !== '').join(' - ');
}

function getImages(url_for, page, article) {
    const { og_image, cover, thumbnail, content } = page;

    if (typeof og_image === 'string') {
        return [ og_image ];
    }
    if (typeof cover === 'string') {
        return [ url_for(cover) ];
    }
    if (cover && typeof cover.image === 'string') {
        return [ url_for(cover.image) ];
    }
    if (typeof thumbnail === 'string') {
        return [ url_for(thumbnail) ];
    }
    if (article && typeof article.og_image === 'string') {
        return [ article.og_image ];
    }
    if (content && content.includes('<img')) {
        const imgPattern = /<img [^>]*src=['"]([^'"]+)([^>]*>)/gi;
        const images = [];
        let img;
        while ((img = imgPattern.exec(content)) !== null) {
            images.push(img[1]);
        }
        return images;
    }

    return [ url_for('/img/og_image.png') ];
}

module.exports = class extends Component {
    renderOpenGraph(config, language, open_graph, images, page, pageType) {
        const { type, title, author, description, url, site_name, twitter_id, twitter_card, twitter_site, google_plus, fb_admins, fb_app_id, image } = open_graph;
        const { title: pageTitle, date, updated, description: pageDescription, excerpt, content, tags, permalink, photos } = page;
        const { title: cfgTitle, url: cfgUrl, author: cfgAuthor, description: cfgDescription, keywords: cfgKeywords } = config;

        let openGraphImages = images;
        if ((Array.isArray(image) && image.length > 0) || typeof image === 'string') {
            openGraphImages = image;
        } else if ((Array.isArray(photos) && photos.length > 0) || typeof photos === 'string') {
            openGraphImages = photos;
        }

        let keywords = cfgKeywords;
        if (tags && tags.length > 0) {
            switch (pageType) {
                case Constants.PAGE_TYPE_CATEGORIES:
                case Constants.PAGE_TYPE_TAGS:
                    keywords = tags.sort('name').sort('-length');
                    break;
                default:
                    keywords = tags.sort('name');
                    break;
            }
        }

        return <OpenGraph
            type={type || (pageType === Constants.PAGE_TYPE_POST ? 'article' : 'website')}
            title={title || pageTitle || cfgTitle}
            date={date}
            updated={updated}
            author={author || cfgAuthor}
            description={description || pageDescription || excerpt || content || cfgDescription}
            keywords={keywords}
            url={url || permalink || cfgUrl}
            images={openGraphImages}
            siteName={site_name || cfgTitle}
            language={language}
            twitterId={twitter_id}
            twitterCard={twitter_card}
            twitterSite={twitter_site}
            googlePlus={google_plus}
            facebookAdmins={fb_admins}
            facebookAppId={fb_app_id} />;
    }

    renderStructuredData(config, structured_data, images, page) {
        const { title, description, url, author, publisher, publisher_logo, image } = structured_data;
        const { title: pageTitle, description: pageDescription, excerpt, content, permalink, date, updated, photos } = page;
        const { title: cfgTitle, url: cfgUrl, description: cfgDescription, author: cfgAuthor } = config;

        let structuredImages = images;
        if ((Array.isArray(image) && image.length > 0) || typeof image === 'string') {
            structuredImages = image;
        } else if ((Array.isArray(photos) && photos.length > 0) || typeof photos === 'string') {
            structuredImages = photos;
        }

        return <StructuredData
            title={title || pageTitle || cfgTitle}
            description={description || pageDescription || excerpt || content || cfgDescription}
            url={url || permalink || cfgUrl}
            author={author || cfgAuthor}
            publisher={publisher || cfgTitle}
            publisherLogo={publisher_logo || config.logo}
            date={date}
            updated={updated}
            images={structuredImages} />;
    }

    render() {
        const { site, config, helper, page } = this.props;
        const { url_for } = helper;
        const { title: siteTitle, url: siteUrl, head = {}, article, widgets } = config;
        const {
            meta = [],
            manifest = {},
            open_graph = {},
            structured_data = {},
            canonical_url = page.permalink,
            rss,
            favicon,
            apple_touch_icons,
        } = head;

        const pageType = Constants.getPageType(helper);
        const noIndex = [Constants.PAGE_TYPE_ARCHIVE, Constants.PAGE_TYPE_CATEGORY, Constants.PAGE_TYPE_TAG].includes(pageType);
        const language = page.lang || page.language || config.language;
        const hasOpenGraph = typeof open_graph === 'object' && open_graph !== null;
        const hasStructuredData = typeof structured_data === 'object' && structured_data !== null;
        const hasMetaData = meta && meta.length > 0;
        const images = getImages(url_for, page, article);
        const webApp = {
            icons: apple_touch_icons || manifest.icons,
            themeColor: manifest.theme_color,
            name: manifest.name || siteTitle,
        };

        let adsenseClientId = null;
        let followItVerificationCode = null;
        if (Array.isArray(widgets)) {
            const adsense = widgets.find(({ type }) => type === 'adsense');
            if (adsense) {
                adsenseClientId = adsense.client_id;
            }
            const followIt = widgets.find(({ type }) => type === 'followit');
            if (followIt) {
                followItVerificationCode = followIt.verification_code;
            }
        }

        return <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            {noIndex && <meta name="robots" content="noindex" />}
            {hasMetaData && <MetaTags meta={meta} />}
            <title>{getPageTitle(helper, page, siteTitle, pageType)}</title>
            <WebApp.Cacheable helper={helper} favicon={favicon} icons={webApp.icons} themeColor={webApp.themeColor} name={webApp.name} />
            {hasOpenGraph && this.renderOpenGraph(config, language, open_graph, images, page, pageType)}
            <WebSiteStructuredData name={siteTitle} url={siteUrl} />
            {hasStructuredData && this.renderStructuredData(config, structured_data, images, page)}
            {canonical_url ? <link rel="canonical" href={canonical_url} /> : null}
            {rss ? <link rel="alternate" href={url_for(rss)} title={siteTitle} type="application/atom+xml" /> : null}
            {favicon ? <link rel="icon" href={url_for(favicon)} /> : null}
            <Assets site={site} config={config} helper={helper} page={page} head={true} type={pageType} />
            {adsenseClientId && <script data-ad-client={adsenseClientId} src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js" async></script>}
            {followItVerificationCode && <meta name="follow.it-verification-code" content={followItVerificationCode} />}
        </head>;
    }
};
