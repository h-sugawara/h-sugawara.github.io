const { Component } = require('inferno');
const Categories = require('./widget/categories');

module.exports = class extends Component {
    render() {
        const { site, page, config, helper } = this.props;

        // categories widgetの設定からorderByとorderのみを抽出する
        const widget = (config.widgets || []).filter(widget => widget.type === 'categories')
            .map(({ orderBy, order }) => {
                return { orderBy, order };
            })
            .shift() || {};

        return <Categories.Cacheable site={site} page={page} helper={helper} widget={widget} main={true} />;
    }
};
