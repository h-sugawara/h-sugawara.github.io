const { Component } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');
const ArticleMedia = require('../common/article_media');

class RecentPosts extends Component {
    render() {
        const { title, posts } = this.props;
        return <div class="card widget" data-type="recent-posts">
            <div class="card-content">
                <h3 class="menu-label">{title}</h3>
                {posts.map(post => {
                    return <ArticleMedia
                        url={post.url}
                        title={post.title}
                        date={post.date}
                        dateXml={post.dateXml}
                        categories={post.categories}
                        thumbnail={post.thumbnail}/>;
                })}
            </div>
        </div>
    }
}

RecentPosts.Cacheable = cacheComponent(RecentPosts, 'widget.recent_posts', props => {
    const { site, helper, widget } = props;
    const limit = widget.limit || 5;
    const { url_for, __, date_xml, date } = helper;

    if (!site.posts.length) {
        return null;
    }

    const posts = site.posts.sort('date', -1).limit(limit).map(post => {
        return {
            url: url_for(post.link || post.path),
            title: post.title,
            date: date(post.date),
            dateXml: date_xml(post.date),
            thumbnail: post.thumbnail ? url_for(post.thumbnail) : null,
            categories: post.categories.map(category => category.name),
        };
    });

    return {
        title: __('widget.recents'),
        posts: posts,
    };
});

module.exports = RecentPosts;
