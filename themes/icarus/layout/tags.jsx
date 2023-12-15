const { Component } = require('inferno');
const Tags = require('hexo-component-inferno/lib/view/widget/tags');

module.exports = class extends Component {
    render() {
        const { site, config, helper } = this.props;

        const widget = (config.widgets || []).filter(widget => widget.type === 'tags')
            .map(widget => { return { order_by: widget.order_by, show_count: widget.show_count }; })
            .shift() || {};

        return <Tags.Cacheable site={site} helper={helper} widget={widget} />;
    }
};
