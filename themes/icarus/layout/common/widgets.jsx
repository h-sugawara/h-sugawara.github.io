const createLogger = require('hexo-log');
const { Component } = require('inferno');
const view = require('hexo-component-inferno/lib/core/view');
const classname = require('hexo-component-inferno/lib/util/classname');
const Constants = require('../constants');

const logger = createLogger.default();

function formatWidgets(widgets) {
    const result = {};

    if (Array.isArray(widgets)) {
        widgets.filter(widget => typeof widget === 'object').forEach(widget => {
            if ('position' in widget && (widget.position === 'left' || widget.position === 'right')) {
                if (!(widget.position in result)) {
                    result[widget.position] = [ widget ];
                } else {
                    result[widget.position].push(widget);
                }
            }
        });
    }

    return result;
}

function hasColumn(widgets, position, config, page) {
    const showToc = (config.toc === true) && ['page', 'post'].includes(page.layout);
    if (Array.isArray(widgets)) {
        return typeof widgets.find(widget => {
            return widget.type === 'toc' && !showToc ? false : widget.position === position;
        }) !== 'undefined';
    }

    return false;
}

function getColumnCount(widgets, config, page) {
    return [hasColumn(widgets, 'left', config, page), hasColumn(widgets, 'right', config, page)].filter(v => !!v).length + 1;
}

function getColumnSizeClass(columnCount) {
    switch (columnCount) {
        case 2:
            return 'column-duo-widgets';
        case 3:
            return 'column-trio-widgets';
    }
    return '';
}

function getColumnVisibilityClass(columnCount, position) {
    return columnCount === 3 && position === 'right' ? 'is-hidden-touch is-hidden-desktop-only' : '';
}

function isColumnSticky(config, position) {
    const { sidebar } = config;

    return typeof sidebar === 'object' && position in sidebar && sidebar[position].sticky === true;
}

class Widgets extends Component {
    render() {
        const { site, config, helper, page, position } = this.props;
        const widgets = formatWidgets(config.widgets)[position] || [];
        const columnCount = getColumnCount(config.widgets, config, page);

        if (!widgets.length) {
            return null;
        }

        const pageType = Constants.getPageType(helper);
        const skipWidgetMap = {
            'categories': [Constants.PAGE_TYPE_CATEGORIES, Constants.PAGE_TYPE_POST, Constants.PAGE_TYPE_PAGE],
            'tags': [Constants.PAGE_TYPE_TAGS, Constants.PAGE_TYPE_POST, Constants.PAGE_TYPE_PAGE],
        };

        const columnSize = getColumnSizeClass(columnCount);
        const columnVisibility = getColumnVisibilityClass(columnCount, position);

        return <div className={classname({
            'column': true,
            ['column-' + position]: true,
            [columnSize]: columnSize !== '',
            [columnVisibility]: columnVisibility !== '',
            'is-sticky': isColumnSticky(config, position),
        })}>
            {widgets.map(widget => {
                // widget type is not defined
                if (!widget.type) {
                    return null;
                }
                if ((skipWidgetMap[widget.type] || []).includes(pageType)) {
                    return null;
                }
                try {
                    let Widget = view.require('widget/' + widget.type);
                    Widget = Widget.Cacheable ? Widget.Cacheable : Widget;
                    return <Widget site={site} helper={helper} config={config} page={page} widget={widget} />;
                } catch (e) {
                    logger.w(`Icarus cannot load widget "${widget.type}"`);
                }
                return null;
            })}
            {position === 'left' && hasColumn(config.widgets, 'right', config, page) ? <div className={classname({
                'column-right-shadow': true,
                'is-hidden-widescreen': true,
                'is-sticky': isColumnSticky(config, 'right'),
            })}></div> : null}
        </div>;
    }
}

Widgets.getColumnCount = getColumnCount;

module.exports = Widgets;
