const { Component, Fragment } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Insight extends Component {
    render() {
        const { translation, contentUrl } = this.props;

        const js = 'var InsightSettings={config:'
            .concat(JSON.stringify({ contentUrl: contentUrl }), ', translation:')
            .concat(JSON.stringify(translation), '};');

        return <Fragment>
            <div className="searchbox">
                <div className="searchbox-container">
                    <div className="searchbox-header">
                        <div className="searchbox-header-container">
                            <label className="searchbox-label" htmlFor="search">{translation.title}</label>
                            <button className="searchbox-close" type="button">&#xD7;</button>
                        </div>
                        <input className="searchbox-input" type="text" id="search" placeholder={translation.hint} />
                    </div>
                    <div className="searchbox-body"></div>
                </div>
            </div>
            <script dangerouslySetInnerHTML={{ __html: js }}></script>
        </Fragment>;
    }
}

Insight.Cacheable = cacheComponent(Insight, 'search.insight', props => {
    const { helper } = props;
    const { url_for, __, _p } = helper;

    return {
        translation: {
            title: __('search.search'),
            hint: __('search.hint'),
            untitled: __('search.untitled'),
            posts: _p('common.post', Infinity),
            pages: _p('common.page', Infinity),
            categories: _p('common.category', Infinity),
            tags: _p('common.tag', Infinity),
        },
        contentUrl: url_for('/content.json'),
    };
});

module.exports = Insight;
