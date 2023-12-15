const { Component } = require('inferno');
const Categories = require('hexo-component-inferno/lib/view/widget/categories');

module.exports = class extends Component {
    render() {
        const { site, page, config, helper } = this.props;

        const widget = (config.widgets || []).filter(widget => widget.type === 'categories')
            .map(widget => { return { orderBy: widget.orderBy, order: widget.order }; })
            .shift() || {};

        return <Categories.Cacheable site={site} page={page} helper={helper} widget={widget} />;
    }
};
