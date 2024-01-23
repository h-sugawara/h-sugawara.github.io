const { Component } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Insight extends Component {
    render() {
        const { translation, contentUrl } = this.props;

        const js = 'document.addEventListener(\'DOMContentLoaded\', function () {loadInsight('
            .concat(JSON.stringify({ contentUrl: contentUrl }), ', ')
            .concat(JSON.stringify(translation), ');});');

        return <div className="searchbox">
            <div className="searchbox-container">
                <div className="searchbox-header">
                    <div className="searchbox-header-container">
                        <label className="searchbox-label" htmlFor="search">{translation.title}</label>
                        <a className="searchbox-close" href="javascript:;">&#xD7;</a>
                    </div>
                    <input className="searchbox-input" type="text" id="search" placeholder={translation.hint} />
                </div>
                <div className="searchbox-body"></div>
                <script dangerouslySetInnerHTML={{ __html: js }}></script>
            </div>
        </div>;
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
