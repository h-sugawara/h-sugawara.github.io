const { Component, Fragment } = require('inferno');
const Plugins = require("./plugins");

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

function getCssUrl(helper, config) {
    const { url_for, cdn, fontcdn, iconcdn } = helper;
    const { article, highlight, variant = 'default' } = config;

    const main = url_for(`/css/${variant}.css`);
    const sub = url_for(`/css/${variant}-secondary.css`);
    const codeBlock = url_for(`/css/${variant}-codeblock.css`);
    const hlTheme = cdn('highlight.js', '11.7.0', `styles/${getHighlightThemeName(highlight, article)}.css`);
    const fonts = {
        default: fontcdn('Source+Code+Pro&display=swap', 'css2'),
        cyberpunk: fontcdn('Oxanium:wght@300;400;600&family=Roboto+Mono&display=swap', 'css2')
    };

    return { main, sub, codeBlock, hlTheme, font: fonts[variant], icon: iconcdn() };
}

function getScriptUrl(helper, config) {
    const { url_for, cdn } = helper;
    const { search = { type: 'insights' } } = config;

    const main = url_for('/js/main.js');
    const clipboard = cdn('clipboard', '2.0.4', 'dist/clipboard.min.js');
    const jQuery = cdn('jquery', '3.3.1', 'dist/jquery.min.js');
    const moment = cdn('moment', '2.22.2', 'min/moment-with-locales.min.js');
    const searchJs = url_for(`/js/${search.type}.js`);

    return { clipboard, main, jQuery, moment, searchJs };
}

module.exports = class extends Component {
    render() {
        const { site, config, page, helper, head } = this.props;
        const { clipboard, embeddedConfig } = getHighlightConfig(config.article);
        const language = page.lang || page.language || config.language;

        const hasIcon = page.has_icon || config.has_icon;
        const hasCode = page.has_code || config.has_code;
        const searchEnabled = typeof config.search.type === 'string' && config.search.type !== '';
        const { moment: momentEnabled = false } = config;

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
            codeBlock: codeBlockCssUrl,
            hlTheme: hlThemeCssUrl,
            font: fontCssUrl,
            icon: iconCssUrl,
        } = getCssUrl(helper, config);
        const {
            main: mainJsUrl,
            clipboard: clipboardJsUrl,
            jQuery: jQueryScriptUrl,
            moment: momentJsUrl,
            searchJs: searchJsUrl,
        } = getScriptUrl(helper, config)

        const onLoadForPreloadCss = "this.onload=null;this.rel='stylesheet'";

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
            {momentEnabled && <script src={momentJsUrl} defer></script>}
            {searchEnabled && <script src={searchJsUrl} defer></script>}
            <script src={mainJsUrl} defer></script>
        </Fragment>;
    }
};
