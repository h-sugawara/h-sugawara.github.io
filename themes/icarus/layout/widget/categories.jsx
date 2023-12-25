const { Component } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Categories extends Component {
    renderList(categories, showCount) {
        return categories.map(category => {
            return <li>
                <a className={`level is-mobile${(category.isCurrent ? ' is-active' : '')}`} href={category.url}>
                    <span className="level-start">
                        <span className="level-item">{category.name}</span>
                    </span>
                    {showCount ? <span className="level-end">
                        <span className="level-item tag">{category.count}</span>
                    </span> : null}
                </a>
                {!category.children.length && <ul>{this.renderList(category.children, showCount)}</ul>}
            </li>;
        });
    }

    render() {
        const { showCount, categories, title } = this.props;

        return <div className="card widget" datatype="categories">
            <div className="card-content">
                <div className="menu">
                    <h3 className="menu-label">{title}</h3>
                    <ul className="menu-list">{this.renderList(categories, showCount)}</ul>
                </div>
            </div>
        </div>;
    }
}

Categories.Cacheable = cacheComponent(Categories, 'widget.categories', props => {
    const { page, helper, widget = {}, site } = props;
    const { url_for, _p } = helper;
    const {
        categories = site.categories,
        orderBy = 'name',
        order = 1,
        showCurrent = false,
        showCount = true,
    } = widget;

    if (!categories || !categories.length) {
        return null;
    }

    const prepareQuery = function (parent) {
        return categories.find({ parent: parent || { $exists: false } }).sort('name').sort(orderBy, order).filter(cat => cat.length);
    };

    const depth = isNaN(props.depth) ? 0 : parseInt(props.depth, 10);
    const hierarchicalList = function (level, parent) {
        return prepareQuery(parent).map((cat, i) => {
            const children =(!depth || level + 1 < depth) ? hierarchicalList(level + 1, cat._id) : [];

            let isCurrent = false;
            if (showCurrent && page) {
                for (let j = 0; j < cat.length; j++) {
                    let post = cat.posts.data[j];
                    if (post && post._id === page._id) {
                        isCurrent = true;
                        break;
                    }
                }
                // special case: category page
                isCurrent = isCurrent || page.base && page.base.startsWith(cat.path);
            }

            return {
                children: children,
                isCurrent: isCurrent,
                name: cat.name,
                count: cat.length,
                url: url_for(cat.path)
            };
        });
    };

    return {
        showCount: showCount,
        categories: hierarchicalList(0),
        title: _p('common.category', Infinity),
    };
});

module.exports = Categories;
