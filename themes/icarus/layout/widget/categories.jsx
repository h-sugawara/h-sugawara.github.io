const { Component } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Categories extends Component {
    renderList(categories, showCount) {
        return categories.map(category => {
            return <li>
                <a className={`level is-mobile${category.isCurrent ? ' is-active' : ''}`} href={category.url}>
                    {category.name}
                    {showCount && <span className="tag">{category.count}</span>}
                </a>
                {category.children.length > 0 && <ul>{this.renderList(category.children, showCount)}</ul>}
            </li>;
        });
    }

    render() {
        const { showCount, categories, title, main } = this.props;

        return <section className="card widget card-content menu" datatype="categories">
            {main ? <h2 className="menu-label">{title}</h2> : <h3 className="menu-label">{title}</h3>}
            <ul className="menu-list">{this.renderList(categories, showCount)}</ul>
        </section>;
    }
}

Categories.Cacheable = cacheComponent(Categories, 'widget.categories', props => {
    const { page, helper, widget = {}, site, main = false } = props;
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

    const prepareQuery = parent => {
        return categories.find({ parent: parent || { $exists: false } }).sort('name').sort(orderBy, order).filter(cat => cat.length);
    };

    const depth = isNaN(props.depth) ? 0 : parseInt(props.depth, 10);
    const hierarchicalList = (level, parent) => {
        return prepareQuery(parent).map(cat => {
            const children = !depth || level + 1 < depth ? hierarchicalList(level + 1, cat._id) : [];

            let isCurrent = false;
            if (showCurrent && page) {
                for (let j = 0; j < cat.length; j++) {
                    const post = cat.posts.data[j];
                    if (post && post._id === page._id) {
                        isCurrent = true;
                        break;
                    }
                }
                // special case: category page
                isCurrent = isCurrent || (page.base && page.base.startsWith(cat.path));
            }

            return {
                children: children,
                isCurrent: isCurrent,
                name: cat.name,
                count: cat.length,
                url: url_for(cat.path),
            };
        });
    };

    return {
        showCount: showCount,
        categories: hierarchicalList(0),
        title: _p('common.category', Infinity),
        main,
    };
});

module.exports = Categories;
