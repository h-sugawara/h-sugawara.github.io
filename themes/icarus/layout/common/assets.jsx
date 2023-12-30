const { Component, Fragment } = require('inferno');
const Plugins = require('./plugins');
const Constants = require('../constants');

function getHighlightThemeName(highlight, article) {
    if (highlight && highlight.enable === false) {
        return null;
    } else if (article && article.highlight && article.highlight.theme) {
        return article.highlight.theme;
    }
    return 'atom-one-light';
}

function getHighlightConfig(article) {
    let fold = 'unfolded';
    let clipboard = true;
    if (article && article.highlight) {
        if (typeof article.highlight.clipboard !== 'undefined') {
            clipboard = !!article.highlight.clipboard;
        }
        if (typeof article.highlight.fold === 'string') {
            fold = article.highlight.fold;
        }
    }
    const embeddedConfig = `var IcarusThemeSettings={article:{highlight:{clipboard:${clipboard},fold:'${fold}'}}};`;

    return { clipboard, embeddedConfig };
}

function getMainCssUrl(url_for, type, variant) {
    switch (type) {
        case Constants.PAGE_TYPE_ARCHIVE:
        case Constants.PAGE_TYPE_CATEGORIES:
        case Constants.PAGE_TYPE_TAGS:
            return `/css/${type}/${variant}.css`;
        case Constants.PAGE_TYPE_CATEGORY:
            return `/css/${Constants.PAGE_TYPE_CATEGORIES}/${variant}-articles.css`;
        case Constants.PAGE_TYPE_TAG:
            return `/css/${Constants.PAGE_TYPE_TAGS}/${variant}-articles.css`;
        case Constants.PAGE_TYPE_PAGE:
        case Constants.PAGE_TYPE_POST:
            return `/css/posts/${variant}.css`;
    }
    return url_for(`/css/${variant}.css`);
}

function getCssUrl(helper, config, type) {
    const { url_for, cdn, fontcdn, iconcdn } = helper;
    const { article, highlight, variant = 'default' } = config;

    const fonts = {
        default: fontcdn('Source+Code+Pro&display=swap', 'css2'),
        cyberpunk: fontcdn('Oxanium:wght@300;400;600&family=Roboto+Mono&display=swap', 'css2'),
    };

    return {
        main: getMainCssUrl(url_for, type, variant),
        sub: url_for(`/css/${variant}-secondary.css`),
        font: fonts[variant],
        icon: iconcdn(),
        codeBlock: url_for(`/css/${variant}-codeblock.css`),
        hlTheme: cdn('highlight.js', '11.7.0', `styles/${getHighlightThemeName(highlight, article)}.css`),
    };
}

function getScriptUrl(helper, config) {
    const { url_for, cdn } = helper;
    const { search = { type: 'insights' } } = config;

    return {
        main: url_for('/js/main.js'),
        jQuery: cdn('jquery', '3.3.1', 'dist/jquery.min.js'),
        moment: cdn('moment', '2.22.2', 'min/moment-with-locales.min.js'),
        relativeDateTime: url_for('/js/relative_datetime.js'),
        searchJs: url_for(`/js/${search.type}.js`),
        toc: url_for('/js/toc.js'),
        toggleToc: url_for('/js/toggle_toc.js'),
        clipboard: cdn('clipboard', '2.0.4', 'dist/clipboard.min.js'),
        codeBlock: url_for('/js/codeblock.js'),
        gallery: url_for('/js/gallery.js'),
    };
}

module.exports = class extends Component {
    render() {
        const { site, config, page, helper, head, type } = this.props;
        const { clipboard, embeddedConfig } = getHighlightConfig(config.article);
        const language = page.lang || page.language || config.language;

        const hasIcon = page.has_icon || config.has_icon;
        const hasCode = page.has_code || config.has_code;
        const searchEnabled = typeof config.search.type === 'string' && config.search.type !== '';
        const { moment: momentEnabled = false } = config;
        const showToc = (config.toc === true) && ['page', 'post'].includes(page.layout);
        const { has_gallery: hasGallery = false } = page;

        if (!head) {
            return <Fragment>
                {hasCode && <script dangerouslySetInnerHTML={{__html: embeddedConfig}}></script>}
                {momentEnabled && <script dangerouslySetInnerHTML={{__html: `moment.locale("${language}");`}}></script>}
                <Plugins site={site} config={config} helper={helper} page={page} head={false} />
            </Fragment>;
        }

        const {
            main: mainCssUrl,
            sub: subCssUrl,
            font: fontCssUrl,
            icon: iconCssUrl,
            codeBlock: codeBlockCssUrl,
            hlTheme: hlThemeCssUrl,
        } = getCssUrl(helper, config, type);
        const {
            main: mainJsUrl,
            jQuery: jQueryScriptUrl,
            moment: momentJsUrl,
            relativeDateTime: relativeDateTimeJsUrl,
            searchJs: searchJsUrl,
            toc: tocJsUrl,
            toggleToc: toggleTocJsUrl,
            clipboard: clipboardJsUrl,
            codeBlock: codeBlockJsUrl,
            gallery: galleryJsUrl,
        } = getScriptUrl(helper, config);

        const onLoadForPreloadCss = 'this.onload=null;this.rel=\'stylesheet\'';

        return <Fragment>
            <link rel="stylesheet" href={mainCssUrl} />
            <link rel="preload" href={subCssUrl} as="style" onLoad={onLoadForPreloadCss} />
            {hasIcon && <link rel="preload" href={iconCssUrl} as="style" onLoad={onLoadForPreloadCss} />}
            {hasCode ? <Fragment>
                <link rel="preload" href={hlThemeCssUrl} as="style" onLoad={onLoadForPreloadCss} />
                <link rel="preload" href={codeBlockCssUrl} as="style" onLoad={onLoadForPreloadCss} />
                {clipboard && <script src={clipboardJsUrl} defer></script>}
            </Fragment> : null}
            <link rel="preload" href={fontCssUrl} as="style" onLoad={onLoadForPreloadCss} />
            <noscript>
                <link rel="stylesheet" href={subCssUrl} />
                {hasIcon && <link rel="stylesheet" href={iconCssUrl} />}
                {hasCode ? <Fragment>
                    <link rel="stylesheet" href={hlThemeCssUrl} />
                    <link rel="stylesheet" href={codeBlockCssUrl} />
                </Fragment> : null}
                <link rel="stylesheet" href={fontCssUrl} />
            </noscript>
            <script src={jQueryScriptUrl} defer></script>
            <Plugins site={site} config={config} helper={helper} page={page} head={true} />
            {momentEnabled ? <Fragment>
                <script src={momentJsUrl} defer></script>
                <script src={relativeDateTimeJsUrl} defer></script>
            </Fragment> : null}
            {searchEnabled && <script src={searchJsUrl} defer></script>}
            {showToc ? <Fragment>
                <script src={tocJsUrl} defer></script>
                <script src={toggleTocJsUrl} defer></script>
            </Fragment> : null}
            {hasCode && <script src={codeBlockJsUrl} defer></script>}
            {hasGallery && <script src={galleryJsUrl} defer></script>}
            <script src={mainJsUrl} defer></script>
        </Fragment>;
    }
};
