const moment = require('moment');
const { Component, Fragment } = require('inferno');
const { toMomentLocale } = require('hexo/dist/plugins/helper/date');
const Paginator = require('./misc/paginator');
const ArticleMedia = require('./common/article_media');

module.exports = class extends Component {
    render() {
        const { config, page, helper } = this.props;
        const { url_for, __, _p, date_xml, date } = helper;
        const { lang, language, year, posts, month, current, total, base } = page;
        const { language: cfgLanguage, pagination_dir } = config;

        moment.locale(toMomentLocale(lang || language || cfgLanguage));

        const renderArticleList = (posts, year, month = null) => {
            const time = moment([year, month ? month - 1 : null].filter(i => i !== null));

            return <section className="card card-content">
                <h3 className="timeline-period">{time.format(month === null ? 'YYYY年' : 'YYYY年 MM月')}</h3>
                <div className="timeline">
                    {posts.map(({ link, path, title, date: created, categories, thumbnail }) => <ArticleMedia
                        url={url_for(link || path)}
                        title={title}
                        date={date(created)}
                        dateXml={date_xml(created)}
                        categories={categories.map(({ name }) => name)}
                        thumbnail={thumbnail ? url_for(thumbnail) : null} />
                    )}
                </div>
            </section>;
        };

        let articleList;
        if (!year) {
            const years = {};
            posts.each(({ date }) => {
                years[date.year()] = null;
            });
            articleList = Object.keys(years)
                .sort((a, b) => b - a)
                .map(year => renderArticleList(
                    posts.filter(({ date }) => date.year() === parseInt(year, 10)),
                    year,
                    null
                ));
        } else {
            articleList = renderArticleList(posts, year, month);
        }

        return <Fragment>
            <section className="card card-content">
                <h2>{_p('common.archive', Infinity)} ({current} / {_p('common.page', total)})</h2>
            </section>
            {articleList}
            {total > 1 && <Paginator
                current={current}
                total={total}
                baseUrl={base}
                path={pagination_dir}
                urlFor={url_for}
                prevTitle={__('common.prev')}
                nextTitle={__('common.next')}
            />}
        </Fragment>;
    }
};
