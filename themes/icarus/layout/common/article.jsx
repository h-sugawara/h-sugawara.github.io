const moment = require('moment');
const { Component, Fragment } = require('inferno');
const { toMomentLocale } = require('hexo/dist/plugins/helper/date');
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
    renderHeader(config, helper, page, index, pageUrl) {
        const {
            title = '',
            cover,
            layout,
        } = page;
        const { url_for } = helper;

        const header = <Fragment>
            {/* Thumbnail */}
            {cover && this.renderCoverImage(url_for, cover, title)}
            <div className="article-header">
                {/* Metadata */}
                {layout !== 'page' && this.renderMetadata(config, helper, page, index)}
                {/* Title */}
                {title !== '' && this.renderTitle(title)}
            </div>
        </Fragment>;

        if (index) {
            return <a href={pageUrl} className="header link-muted">{header}</a>;
        }
        return header;
    }

    renderCoverImage(url_for, cover, title) {
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
             *   ~468px=small, 469px-596px=medium, 597px-724px=large, 725px-768px=default
             * tablet layout:
             *   769px-905px=medium, 906px-1087px=large
             * desktop layout:
             *   1088px-1471px=large, 1472px~=default
             */
            const sourceMap = {
                small: [
                    '(max-width:468px)',
                ],
                medium: [
                    '(min-width:469px) and (max-width:596px)',
                    '(min-width:769px) and (max-width:905px)',
                ],
                large: [
                    '(min-width:597px) and (max-width:724px)',
                    '(min-width:906px) and (max-width:1471px)',
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

        return <span className="card-image image is-7by3">{Image}</span>;
    }

    renderMetadata(config, helper, page, index) {
        const { article, plugins } = config;
        const { date, date_xml, _p } = helper;
        const { language: cfgLanguage = 'en' } = config;
        const { date: pageDate, updated: pageUpdated, author: pageAuthor = '', lang: pageLang, language: pageLanguage } = page;
        const { update_time: updateTime = true, readtime: hasReadTime = false } = article;
        const { busuanzi = false } = plugins;

        const language = toMomentLocale(index ? cfgLanguage : pageLang || pageLanguage || cfgLanguage);
        const isUpdated = pageUpdated && !moment(pageDate).isSame(moment(pageUpdated));
        const shouldShowUpdated = pageUpdated && ((updateTime === 'auto' && isUpdated) || updateTime === true);
        const hasVisitorCounter = !index && busuanzi === true;

        return <div className="article-meta level is-mobile level-left">
            {/* Last Update Date */}
            {shouldShowUpdated && <span className="level-item is-narrow" dangerouslySetInnerHTML={{
                __html: _p('article.updated_at', `<time dateTime="${date_xml(pageUpdated)}" title="${new Date(pageUpdated).toLocaleString()}">${date(pageUpdated)}</time>`),
            }}></span>}
            {/* Creation Date */}
            {pageDate && <span className="level-item is-narrow" dangerouslySetInnerHTML={{
                __html: _p('article.created_at', `<time dateTime="${date_xml(pageDate)}" title="${new Date(pageDate).toLocaleString()}">${date(pageDate)}</time>`),
            }}></span>}
            {/* author */}
            {pageAuthor !== '' && <span className="level-item is-narrow">{pageAuthor}</span>}
            {/* Read time */}
            {hasReadTime && <span className="level-item is-narrow">
                {(() => {
                    const { time } = getReadTimeAndWordCountOf(page._content);
                    // return `${_p('article.read_time', time.locale(language).humanize())} (${_p('article.word_count', words)})`;
                    return `${_p('article.read_time', time.locale(language).humanize())}`;
                })()}
            </span>}
            {/* Visitor counter */}
            {hasVisitorCounter && <span className="level-item is-narrow" id="busuanzi_container_page_pv" dangerouslySetInnerHTML={{
                __html: _p('plugin.visit_count', '<span id="busuanzi_value_page_pv">0</span>'),
            }}></span>}
        </div>;
    }

    renderTitle(title) {
        return <h2 className="title">{title}</h2>;
    }

    renderCategories(categories, url_for) {
        return <ul className="article-categories">
            {categories.map(({ path, name }) => <li><a className="link-muted is-capitalized" href={url_for(path)}>{name}</a></li>)}
        </ul>;
    }

    renderContent(page, index, pageUrl) {
        const { excerpt, more, content } = page;
        const hasExcerpt = excerpt !== '';

        if (index) {
            return <a className="content link-muted" href={pageUrl} dangerouslySetInnerHTML={{ __html: hasExcerpt ? excerpt : content }}></a>;
        }
        return <div className="content" dangerouslySetInnerHTML={{ __html: hasExcerpt ? excerpt + more : content }}></div>;
    }

    renderTags(tags, url_for) {
        return <div className="article-tags">
            <span>#</span>
            {tags.sort('name').map(({ path, name }) => <a className="link-muted" rel="tag" href={url_for(path)}>{name}</a>)}
        </div>;
    }

    renderPageNavigation(pagePrev, pageNext, url_for) {
        return <nav className="post-navigation">
            {pagePrev ? <div className="level-start">
                <a className="article-nav-prev" href={url_for(pagePrev.path)}>
                    <FontAwesomeIcon type="fa-chevron-left" className="nav-arrow-icon" />
                    {pagePrev.title}
                </a>
            </div> : <div className="level-start is-invisible"></div>}
            {pageNext ? <div className="level-end">
                <a className="article-nav-next" href={url_for(pageNext.path)}>
                    {pageNext.title}
                    <FontAwesomeIcon type="fa-chevron-right" className="nav-arrow-icon" />
                </a>
            </div> : <div className='level-end is-invisible'></div>}
        </nav>;
    }

    render() {
        const { config, helper, page, index } = this.props;
        const { article = {} } = config;
        const { url_for } = helper;
        const {
            categories = [],
            tags = [],
            direction = '',
            link,
            path,
            prev: pagePrev,
            next: pageNext,
            isSpecialPage = false,
        } = page;
        const { licenses = {} } = article;
        const pageUrl = url_for(link || path);
        const showLicenseBlock = !index && Object.keys(licenses).length > 0 && !isSpecialPage;
        const showPostNavigation = !index && (pagePrev || pageNext);

        return <Fragment>
            {/* Main content */}
            <div className="card">
                <article className={`card-content article${direction !== '' ? ` ${direction}` : ''}`} role={!index && 'main'}>
                    {/* Header */}
                    {this.renderHeader(config, helper, page, index, pageUrl)}
                    {/* Categories */}
                    {categories.length > 0 && this.renderCategories(categories, url_for)}
                    {/* Content/Excerpt */}
                    {this.renderContent(page, index, pageUrl)}
                    {/* Licensing block */}
                    {showLicenseBlock && <ArticleLicensing.Cacheable page={page} config={config} helper={helper} />}
                    {/* Tags */}
                    {tags.length > 0 && this.renderTags(tags, url_for)}
                    {/* "Read more" button */}
                    {/* index && page.excerpt ? <a class="article-more button is-small is-size-7" href={`${url_for(page.link || page.path)}#more`}>{__('article.more')}</a> : null */}
                    {/* Share button */}
                    {!index && <Share config={config} page={page} helper={helper} />}
                </article>
            </div>
            {/* Donate button */}
            {!index && <Donates config={config} helper={helper} />}
            {/* Post navigation */}
            {showPostNavigation && this.renderPageNavigation(pagePrev, pageNext, url_for)}
            {/* Comment */}
            {!index && <Comment config={config} page={page} helper={helper} />}
        </Fragment>;
    }
};
