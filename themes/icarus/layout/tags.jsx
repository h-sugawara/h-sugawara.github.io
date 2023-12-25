const { Component } = require('inferno');
const Tags = require('./widget/tags');

module.exports = class extends Component {
    render() {
        const { site, config, helper } = this.props;

        // tags widgetの設定からamountのみ除外する
        const widget = (config.widgets || []).filter(widget => widget.type === 'tags')
            .map(({ order_by, show_count }) => { return { order_by, show_count }; })
            .shift() || {};

        return <Tags.Cacheable site={site} helper={helper} widget={widget} />;
    }
};
