const { Component, Fragment } = require('inferno');
const Paginator = require('./misc/paginator');
const Article = require('./common/article');

module.exports = class extends Component {
    render() {
        const { config, page, helper } = this.props;
        const { __, url_for } = helper;
        const { posts, total, current, base } = page;
        const { pagination_dir } = config;

        return <Fragment>
            {posts.map(post => <Article config={config} page={post} helper={helper} index={true} />)}
            {total > 1 && <Paginator
                current={current}
                total={total}
                baseUrl={base}
                path={pagination_dir}
                urlFor={url_for}
                prevTitle={__('common.prev')}
                nextTitle={__('common.next')} />}
        </Fragment>;
    }
};
