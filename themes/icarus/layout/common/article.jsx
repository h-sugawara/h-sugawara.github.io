const moment = require('moment');
const { Component, Fragment } = require('inferno');
const { toMomentLocale } = require('hexo/lib/plugins/helper/date');
const Share = require('./share');
const Donates = require('./donates');
const Comment = require('./comment');
const ArticleLicensing = require('../misc/article_licensing');
const FontAwesomeIcon = require('../misc/font_awesome_icon');

/**
 * Get the read time and the word count of text content.
 */
function getReadTimeAndWordCountOf(content) {
    const { alphaNum, kana, kanji } = getWordCount(content);

    const words = alphaNum + kana + kanji;

    const alphaNumTime = (alphaNum / 150.0) * 60;
    const kanaTime = (kana / 400.0) * 60;
    const kanjiTime = (kanji / 160.0) * 60;
    const time = moment.duration(alphaNumTime + kanaTime + kanjiTime, 'seconds');

    return { words, time };
}

/**
 * Get the word count of text.
 */
function getWordCount(content) {
    if (typeof content === 'undefined') {
        return 0;
    }
    content = content.replace(/(<\/?[a-z][^>]*>|<!--[^-]*-->|{%[^%]+%}|#+ )/gi, '');
    content = content.replace(/!?\[(.+)]\(.+\)/gi, '$1');
    content = content.trim();
    const alphaNumLength = content ? (content.match(/[a-zA-Z0-9]+/g) || []).length : 0;

    const segmentation = new Intl.Segmenter('ja', { granularity: 'grapheme' });
    content = content.replace(/[ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶー]/gi, '');
    const kanaContent = content ? (content.match(/([\u3041-\u3094]|[\u30a1-\u30fa])+/g) || []).join('') : '';
    const kanaLength = [ ...segmentation.segment(kanaContent) ].length;
    const kanjiContent = content ? (content.match(/([\u3400-\u9fff\uf900-\ufaff]|[\ud840-\ud87f]|[\udc00-\udfff])+/g) || []).join('') : '';
    const kanjiLength = [ ...segmentation.segment(kanjiContent) ].length;

    return {
        alphaNum: alphaNumLength,
        kana: kanaLength,
        kanji: kanjiLength,
    };
}

module.exports = class extends Component {
    renderCoverImage(index, url_for, cover, title, pageUrl) {
        let coverImage = '';
        let coverSources = null;

        if (typeof cover === 'object') {
            const { sources = {}, image } = cover;

            if (!image) {
                return null;
            }
            coverImage = url_for(image);

            /*
             * smartphone layout:
             *   ~552px=small, 553px-624px=medium, 625px-696px=large, 697px-768px=default
             * tablet layout:
             *   769px-875px=small, 876px-981px=medium, 982px-1087px=large
             * desktop layout:
             *   1088px-1471px=large, 1472px~=default
             */
            const sourceMap = {
                small: [
                    '(max-width:552px)',
                    '(min-width:769px) and (max-width:875px)',
                ],
                medium: [
                    '(min-width:553px) and (max-width:624px)',
                    '(min-width:876px) and (max-width:981px)',
                ],
                large: [
                    '(min-width:625px) and (max-width:696px)',
                    '(min-width:982px) and (max-width:1471px)',
                ],
            };
            Object.keys(sources).forEach(name => {
                coverSources = <Fragment>
                    {coverSources}
                    {(sourceMap[name] || []).map(value => <source srcSet={sources[name]} media={value} />)}
                </Fragment>;
            });
        } else {
            coverImage = url_for(cover);
        }

        let Image = <img className="fill" src={coverImage} alt={title || coverImage} />;
        if (coverSources) {
            Image = <picture>{coverSources}{Image}</picture>;
        }

        if (index) {
            return <a href={pageUrl} className="card-image image is-7by3">{Image}</a>;
        }
        return <span className="card-image image is-7by3">{Image}</span>;
    }

    renderMetadata(config, helper, page, index) {
        const { article, plugins } = config;
        const { date, date_xml, _p } = helper;
        const { language: cfgLanguage = 'en' } = config;
        const { date: pageDate, updated: pageUpdated, author: pageAuthor, lang: pageLang, language: pageLanguage } = page;
        const { update_time: updateTime = true, readtime: hasReadTime = false } = article;
        const { busuanzi = false } = plugins;

        const language = toMomentLocale(index ? cfgLanguage : pageLang || pageLanguage || cfgLanguage);
        const isUpdated = pageUpdated && !moment(pageDate).isSame(moment(pageUpdated));
        const shouldShowUpdated = pageUpdated && ((updateTime === 'auto' && isUpdated) || updateTime === true);
        const hasVisitorCounter = !index && busuanzi === true;

        return <div className="article-meta level is-mobile level-left">
            {/* Creation Date */}
            {pageDate && <span className="level-item is-narrow" dangerouslySetInnerHTML={{
                __html: _p('article.created_at', `<time dateTime="${date_xml(pageDate)}" title="${new Date(pageDate).toLocaleString()}">${date(pageDate)}</time>`),
            }}></span>}
            {/* Last Update Date */}
            {shouldShowUpdated && <span className="level-item is-narrow" dangerouslySetInnerHTML={{
                __html: _p('article.updated_at', `<time dateTime="${date_xml(pageUpdated)}" title="${new Date(pageUpdated).toLocaleString()}">${date(pageUpdated)}</time>`),
            }}></span>}
            {/* author */}
            {pageAuthor ? <span className="level-item is-narrow"> {pageAuthor} </span> : null}
            {/* Read time */}
            {hasReadTime ? <span className="level-item is-narrow">
                {(() => {
                    const { time } = getReadTimeAndWordCountOf(page._content);
                    // return `${_p('article.read_time', time.locale(language).humanize())} (${_p('article.word_count', words)})`;
                    return `${_p('article.read_time', time.locale(language).humanize())}`;
                })()}
            </span> : null}
            {/* Visitor counter */}
            {hasVisitorCounter ? <span className="level-item is-narrow" id="busuanzi_container_page_pv" dangerouslySetInnerHTML={{
                __html: _p('plugin.visit_count', '<span id="busuanzi_value_page_pv">0</span>'),
            }}></span> : null}
        </div>;
    }

    renderTitle(index, title, pageUrl) {
        if (index) {
            return <a className="title link-muted" href={pageUrl}>{title}</a>;
        }
        return <h1 className="title">{title}</h1>;
    }

    renderCategories(categories, url_for) {
        return <div className="article-categories">
            <span>@</span>
            {(() => {
                const elements = [];
                categories.forEach((category, i) => {
                    elements.push(<a className="link-muted is-capitalized" href={url_for(category.path)}>{category.name}</a>);
                    if (i < categories.length - 1) {
                        elements.push(<span>&nbsp;/&nbsp;</span>);
                    }
                });
                return elements;
            })()}
        </div>;
    }

    renderTags(tags, url_for) {
        return <div className="article-tags">
            <span>#</span>
            {tags.sort('name').map(tag => <a className="link-muted" rel="tag" href={url_for(tag.path)}>{tag.name}</a>)}
        </div>;
    }

    renderPageNavigation(pagePrev, pageNext, url_for) {
        return <nav className="post-navigation level is-mobile">
            <div className={`level-start${pagePrev ? '' : ' is-invisible'}`}>
                {pagePrev ? <a className={'article-nav-prev level-item link-muted'} href={url_for(pagePrev.path)}>
                    <FontAwesomeIcon type="fa-chevron-left" className="nav-arrow-icon" />
                    <span>{pagePrev.title}</span>
                </a> : null}
            </div>
            <div className={`level-end${pageNext ? '' : ' is-invisible'}`}>
                {pageNext ? <a className={'article-nav-next level-item link-muted'} href={url_for(pageNext.path)}>
                    <span>{pageNext.title}</span>
                    <FontAwesomeIcon type="fa-chevron-right" className="nav-arrow-icon" />
                </a> : null}
            </div>
        </nav>;
    }

    render() {
        const { config, helper, page, index } = this.props;
        const { article } = config;
        const { url_for } = helper;
        const {
            title = '',
            categories = [],
            excerpt = false,
            tags = [],
            cover,
            link,
            path,
            prev: pagePrev,
            next: pageNext,
        } = page;
        const pageUrl = url_for(link || path);
        const showLicenseBlock = !index && article && article.licenses && Object.keys(article.licenses);
        const showPostNavigation = !index && (pagePrev || pageNext);

        return <Fragment>
            {/* Main content */}
            <div className="card">
                {/* Thumbnail */}
                {cover && this.renderCoverImage(index, url_for, cover, title, pageUrl)}
                <article className={`card-content article${'direction' in page ? ' ' + page.direction : ''}`} role="article">
                    {/* Metadata */}
                    {page.layout !== 'page' && this.renderMetadata(config, helper, page, index)}
                    {/* Title */}
                    {title !== '' && this.renderTitle(index, title, pageUrl)}
                    {/* Categories */}
                    {categories && categories.length ? this.renderCategories(categories, url_for) : null}
                    {/* Content/Excerpt */}
                    {index && excerpt ? <a className="content link-muted" href={pageUrl} dangerouslySetInnerHTML={{__html: excerpt}}></a>
                        : <div className="content" dangerouslySetInnerHTML={{__html: page.content}}></div>}
                    {/* Licensing block */}
                    {showLicenseBlock && <ArticleLicensing.Cacheable page={page} config={config} helper={helper} />}
                    {/* Tags */}
                    {tags && tags.length ? this.renderTags(tags, url_for) : null}
                    {/* "Read more" button */}
                    {/* index && page.excerpt ? <a class="article-more button is-small is-size-7" href={`${url_for(page.link || page.path)}#more`}>{__('article.more')}</a> : null */}
                    {/* Share button */}
                    {!index ? <Share config={config} page={page} helper={helper} /> : null}
                </article>
            </div>
            {/* Donate button */}
            {!index ? <Donates config={config} helper={helper} /> : null}
            {/* Post navigation */}
            {showPostNavigation && this.renderPageNavigation(pagePrev, pageNext, url_for)}
            {/* Comment */}
            {!index ? <Comment config={config} page={page} helper={helper}/> : null}
        </Fragment>;
    }
};
