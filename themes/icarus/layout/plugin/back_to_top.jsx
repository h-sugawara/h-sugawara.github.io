const { Component } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');
const FontAwesomeIcon = require('../misc/font_awesome_icon');

class BackToTop extends Component {
    render() {
        const { head, title, jsUrl } = this.props;

        if (head) {
            return <script src={jsUrl} defer></script>;
        }

        return <a id="back-to-top" title={title} href="javascript:;">
            <FontAwesomeIcon type="fa-chevron-up" />
        </a>;
    }
}

BackToTop.Cacheable = cacheComponent(BackToTop, 'plugin.backtotop', props => {
    const { helper, head } = props;

    return {
        head: head,
        title: helper.__('plugin.backtotop'),
        jsUrl: helper.url_for('/js/back_to_top.js')
    };
});

module.exports = BackToTop;
