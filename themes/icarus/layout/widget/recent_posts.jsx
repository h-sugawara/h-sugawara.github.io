const { Component } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');
const ArticleMedia = require('../common/article_media');

class RecentPosts extends Component {
    render() {
        const { title, posts } = this.props;

        return <div className="card widget card-content" datatype="recent-posts">
            <h3 className="menu-label">{title}</h3>
            {posts.map(post => <ArticleMedia
                url={post.url}
                title={post.title}
                date={post.date}
                dateXml={post.dateXml}
                categories={post.categories}
                thumbnail={post.thumbnail} />)}
        </div>;
    }
}

RecentPosts.Cacheable = cacheComponent(RecentPosts, 'widget.recent_posts', props => {
    const { site, helper, widget } = props;
    const { limit = 5 } = widget;
    const { url_for, __, date_xml, date } = helper;

    if (!site.posts.length) {
        return null;
    }

    const posts = site.posts.sort('date', -1).limit(limit)
        .map(({ link, path, title, date: postDate, thumbnail, categories = [] }) => {
            return {
                url: url_for(link || path),
                title: title,
                date: date(postDate),
                dateXml: date_xml(postDate),
                thumbnail: thumbnail ? url_for(thumbnail) : null,
                categories: categories.map(category => category.name),
            };
        });

    return {
        title: __('widget.recents'),
        posts: posts,
    };
});

module.exports = RecentPosts;
