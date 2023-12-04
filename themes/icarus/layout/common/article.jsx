const moment = require('moment');
const { Component, Fragment } = require('inferno');
const { toMomentLocale } = require('hexo/lib/plugins/helper/date');
const Share = require('./share');
const Donates = require('./donates');
const Comment = require('./comment');
const ArticleLicensing = require('hexo-component-inferno/lib/view/misc/article_licensing');

/**
 * Get the read time and the word count of text content.
 */
function getReadTimeAndWordCountOf(content) {
    const { english, hiragana, katakana, others } = getWordCount(content);

    const words = english + hiragana + katakana + others;

    const englishTime = (english / 150.0) * 60;
    const hiraganaTime = (hiragana / 300.0) * 60;
    const katakanaTime = (katakana / 300.0) * 60;
    const othersTime = (others / 150.0) * 60;
    const time = moment.duration(englishTime + hiraganaTime + katakanaTime + othersTime, 'seconds');

    return { words, time }
}

/**
 * Get the word count of text.
 */
function getWordCount(content) {
    if (typeof content === 'undefined') {
        return 0;
    }
    content = content.replace(/<\/?[a-z][^>]*>/gi, '');
    content = content.trim();
    const englishLength = content ? (content.match(/[a-zA-Z0-9]+/g) || []).length : 0;

    content = content.replace(/[ッャュョっゃゅょー]/gi, '');
    const hiraganaLength = content ? (content.match(/[\u3041-\u3093]+/g) || []).length : 0;
    const katakanaLength = content ? (content.match(/[\u30a0-\u30ff]+/g) || []).length : 0;

    content = content.replace(/[※©☆]/gi, '');
    const othersLength = content ? (content.match(/[^a-zA-Z0-9\u30a0-\u30ff\u3041-\u3093「」【】：:（）() 　、。,.-]+/g) || []).length : 0;

    return {
        english: englishLength,
        hiragana: hiraganaLength,
        katakana: katakanaLength,
        others: othersLength,
    };
}

module.exports = class extends Component {
    render() {
        const { config, helper, page, index } = this.props;
        const { article, plugins } = config;
        const { url_for, date, date_xml, __, _p } = helper;

        const indexLanguage = toMomentLocale(config.language || 'en');
        const language = toMomentLocale(page.lang || page.language || config.language || 'en');
        const coverSource = page.cover ? url_for(page.cover.src ? page.cover.src : page.cover) : null;
        const coverLayout = page.cover ? (page.cover.layout ? page.cover.layout : 'fill') : '';
        const updateTime = article && article.update_time !== undefined ? article.update_time : true;
        const isUpdated = page.updated && !moment(page.date).isSame(moment(page.updated));
        const shouldShowUpdated = page.updated && ((updateTime === 'auto' && isUpdated) || updateTime === true);

        return <Fragment>
            {/* Main content */}
            <div class="card">
                {/* Thumbnail */}
                {coverSource ? <div class="card-image">
                    {index ? <a href={url_for(page.link || page.path)} class="image is-7by3">
                        <img class={coverLayout} src={coverSource} alt={page.title || coverSource} />
                    </a> : <span class="image is-7by3">
                        <img class={coverLayout} src={coverSource} alt={page.title || coverSource} />
                    </span>}
                </div> : null}
                <article class={`card-content article${'direction' in page ? ' ' + page.direction : ''}`} role="article">
                    {/* Metadata */}
                    {page.layout !== 'page' ? <div class="article-meta is-size-7 is-uppercase level is-mobile">
                        <div class="level-left">
                            {/* Creation Date */}
                            {page.date && <span class="level-item" dangerouslySetInnerHTML={{
                                __html: _p('article.created_at', `<time dateTime="${date_xml(page.date)}" title="${new Date(page.date).toLocaleString()}">${date(page.date)}</time>`)
                            }}></span>}
                            {/* Last Update Date */}
                            {shouldShowUpdated && <span class="level-item" dangerouslySetInnerHTML={{
                                __html: _p('article.updated_at', `<time dateTime="${date_xml(page.updated)}" title="${new Date(page.updated).toLocaleString()}">${date(page.updated)}</time>`)
                            }}></span>}
                            {/* author */}
                            {page.author ? <span class="level-item"> {page.author} </span> : null}
                            {/* Categories */}
                            {page.categories && page.categories.length ? <span class="level-item">
                                {(() => {
                                    const categories = [];
                                    page.categories.forEach((category, i) => {
                                        categories.push(<a class="link-muted" href={url_for(category.path)}>{category.name}</a>);
                                        if (i < page.categories.length - 1) {
                                            categories.push(<span>&nbsp;/&nbsp;</span>);
                                        }
                                    });
                                    return categories;
                                })()}
                            </span> : null}
                            {/* Read time */}
                            {article && article.readtime && article.readtime === true ? <span class="level-item">
                                {(() => {
                                    const { words, time } = getReadTimeAndWordCountOf(page._content);
                                    return `${_p('article.read_time', time.locale(index ? indexLanguage : language).humanize())} (${_p('article.word_count', words)})`;
                                })()}
                            </span> : null}
                            {/* Visitor counter */}
                            {!index && plugins && plugins.busuanzi === true ? <span class="level-item" id="busuanzi_container_page_pv" dangerouslySetInnerHTML={{
                                __html: _p('plugin.visit_count', '<span id="busuanzi_value_page_pv">0</span>')
                            }}></span> : null}
                        </div>
                    </div> : null}
                    {/* Title */}
                    {page.title !== '' && index ? <p class="title is-3 is-size-4-mobile"><a class="link-muted" href={url_for(page.link || page.path)}>{page.title}</a></p> : null}
                    {page.title !== '' && !index ? <h1 class="title is-3 is-size-4-mobile">{page.title}</h1> : null}
                    {/* Content/Excerpt */}
                    <div class="content" dangerouslySetInnerHTML={{ __html: index && page.excerpt ? page.excerpt : page.content }}></div>
                    {/* Licensing block */}
                    {!index && article && article.licenses && Object.keys(article.licenses)
                        ? <ArticleLicensing.Cacheable page={page} config={config} helper={helper} /> : null}
                    {/* Tags */}
                    {page.tags && page.tags.length ? <div class="article-tags is-size-7 mb-4">
                        <span class="mr-2">#</span>
                        {page.tags.map(tag => {
                            return <a class="link-muted mr-2" rel="tag" href={url_for(tag.path)}>{tag.name}</a>;
                        })}
                    </div> : null}
                    {/* "Read more" button */}
                    {index && page.excerpt ? <a class="article-more button is-small is-size-7" href={`${url_for(page.link || page.path)}#more`}>{__('article.more')}</a> : null}
                    {/* Share button */}
                    {!index ? <Share config={config} page={page} helper={helper} /> : null}
                </article>
            </div>
            {/* Donate button */}
            {!index ? <Donates config={config} helper={helper} /> : null}
            {/* Post navigation */}
            {!index && (page.prev || page.next) ? <nav class="post-navigation mt-4 level is-mobile">
                {page.prev ? <div class="level-start">
                    <a class={`article-nav-prev level level-item${!page.prev ? ' is-hidden-mobile' : ''} link-muted`} href={url_for(page.prev.path)}>
                        <i class="level-item fas fa-chevron-left"></i>
                        <span class="level-item">{page.prev.title}</span>
                    </a>
                </div> : null}
                {page.next ? <div class="level-end">
                    <a class={`article-nav-next level level-item${!page.next ? ' is-hidden-mobile' : ''} link-muted`} href={url_for(page.next.path)}>
                        <span class="level-item">{page.next.title}</span>
                        <i class="level-item fas fa-chevron-right"></i>
                    </a>
                </div> : null}
            </nav> : null}
            {/* Comment */}
            {!index ? <Comment config={config} page={page} helper={helper} /> : null}
        </Fragment>;
    }
};
