const moment = require('moment');
const { Component, Fragment } = require('inferno');
const { toMomentLocale } = require('hexo/lib/plugins/helper/date');
const Paginator = require('./misc/paginator');
const ArticleMedia = require('./common/article_media');
const {post} = require("hexo/lib/plugins/helper/is");

module.exports = class extends Component {
    render() {
        const { config, page, helper } = this.props;
        const { url_for, __, date_xml, date } = helper;

        const language = toMomentLocale(page.lang || page.language || config.language);
        moment.locale(language);

        const renderArticleList = (posts, year, month = null) => {
            const time = moment([year, month ? month - 1 : null].filter(i => i !== null));

            return <div className="card card-content">
                <h3 className="timeline-period">{time.format(month === null ? 'YYYY年' : 'YYYY年 MM月')}</h3>
                <div className="timeline">
                    {posts.map(({link, path, title, date: created, categories, thumbnail }) => <ArticleMedia
                        url={url_for(link || path)}
                        title={title}
                        date={date(created)}
                        dateXml={date_xml(created)}
                        categories={categories.map(({ name }) => name)}
                        thumbnail={thumbnail ? url_for(thumbnail) : null}/>
                    )}
                </div>
            </div>;
        };

        let articleList;
        if (!page.year) {
            const years = {};
            page.posts.each(p => { years[p.date.year()] = null; });
            articleList = Object.keys(years).sort((a, b) => b - a).map(year => {
                const posts = page.posts.filter(p => p.date.year() === parseInt(year, 10));
                return renderArticleList(posts, year, null);
            });
        } else {
            articleList = renderArticleList(page.posts, page.year, page.month);
        }

        return <Fragment>
            {articleList}
            {page.total > 1 ? <Paginator
                current={page.current}
                total={page.total}
                baseUrl={page.base}
                path={config.pagination_dir}
                urlFor={url_for}
                prevTitle={__('common.prev')}
                nextTitle={__('common.next')} /> : null}
        </Fragment>;
    }
};
