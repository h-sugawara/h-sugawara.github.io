const { Component, Fragment } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Categories extends Component {
    renderList(categories, showCount) {
        return categories.map(({ isCurrent, url, name, count, children = [] }) => {
            return <Fragment>
                <a className={`level is-mobile${isCurrent ? ' is-active' : ''}`} href={url}>
                    {name}
                    {showCount && <span className="tag">{count}</span>}
                </a>
                {children.length > 0 && <div>{this.renderList(children, showCount)}</div>}
            </Fragment>;
        });
    }

    render() {
        const { showCount, categories, title, main } = this.props;

        return <section className="card widget card-content menu" datatype="categories">
            {main ? <h2 className="menu-label">{title}</h2> : <h3 className="menu-label">{title}</h3>}
            <div className="menu-list">{this.renderList(categories, showCount)}</div>
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
        return prepareQuery(parent).map(({ _id, length, posts, base, path, name }) => {
            const children = !depth || level + 1 < depth ? hierarchicalList(level + 1, _id) : [];

            let isCurrent = false;
            if (showCurrent && page) {
                for (let j = 0; j < length; j++) {
                    const post = posts.data[j];
                    if (post && post._id === _id) {
                        isCurrent = true;
                        break;
                    }
                }
                // special case: category page
                isCurrent = isCurrent || (base && base.startsWith(path));
            }

            return { children, isCurrent, name, count: length, url: url_for(path) };
        });
    };

    return {
        showCount,
        categories: hierarchicalList(0),
        title: _p('common.category', Infinity),
        main,
    };
});

module.exports = Categories;
