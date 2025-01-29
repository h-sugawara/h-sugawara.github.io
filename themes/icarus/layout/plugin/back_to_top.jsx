const { Component } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');
const FontAwesomeIcon = require('../misc/font_awesome_icon');
const { tocObj: getTocObj } = require('hexo-util');

class BackToTop extends Component {
    render() {
        const { head, title, jsUrl, showToc, tocTitle } = this.props;

        if (head) {
            return <script src={jsUrl} defer></script>;
        }

        return <div id="back-to-top">
            {showToc && <button type="button" title={tocTitle} className="button catalogue">
                <FontAwesomeIcon type="fa-list-ul" className="nav-toc-icon" />
            </button>}
            <button type="button" title={title} className="button back-to-top">
                <FontAwesomeIcon type="fa-chevron-up" />
            </button>
        </div>;
    }
}

BackToTop.Cacheable = cacheComponent(BackToTop, 'plugin.backtotop', props => {
    const { config, helper, head, page } = props;
    const { widgets, toc: useToc = false } = config;
    const { tocEnabled = false, layout = '', content = '' } = page;

    const hasTocWidget = Array.isArray(widgets) && widgets.find(widget => widget.type === 'toc');
    const showToc = (useToc === true || tocEnabled) && hasTocWidget && ['page', 'post'].includes(layout) && getTocObj(content).length > 0;

    return {
        head,
        title: helper.__('plugin.backtotop'),
        jsUrl: helper.url_for('/js/back_to_top.js'),
        showToc,
        tocTitle: helper._p('widget.catalogue', Infinity),
    };
});

module.exports = BackToTop;
