const { Component } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Tags extends Component {
    render() {
        const { showCount, title, tags, main } = this.props;

        return <section className="card widget card-content menu" datatype="tags">
            {main ? <h2 className="menu-label">{title}</h2> : <h3 className="menu-label">{title}</h3>}
            <div className="field is-grouped is-grouped-multiline">
                {tags.map(({ url, name, count }) => <a className="control tags has-addons" href={url}>
                    <span className="tag">{name}</span>
                    {showCount && <span className="tag">{count}</span>}
                </a>)}
            </div>
        </section>;
    }
}

Tags.Cacheable = cacheComponent(Tags, 'widget.tags', props => {
    const { helper, widget = {}, site, main = false } = props;
    const { url_for, _p } = helper;
    const { order_by = 'name', amount, show_count: showCount = true } = widget;

    let tags = props.tags || site.tags;
    if (!tags || !tags.length) {
        return null;
    }

    tags = tags.sort('name').sort(order_by).filter(({ length }) => length);
    if (amount) {
        tags = tags.limit(amount);
    }
    tags = tags.map(({ name, length: count, path }) => ({ name, count, url: url_for(path) }));

    return {
        showCount,
        title: _p('common.tag', amount ? 0 : Infinity),
        tags,
        main,
    };
});

module.exports = Tags;
