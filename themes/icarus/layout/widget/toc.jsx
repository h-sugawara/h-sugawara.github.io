const { Component } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');
const { tocObj: getTocObj, unescapeHTML } = require('hexo-util');

function getToc(content, maxDepth) {
    const toc = {};
    const tocObj = getTocObj(content, { min_depth: 1, max_depth: 6 });
    const minLevels = Array.from(new Set(tocObj.map(item => item.level))).sort((a, b) => a - b).slice(0, maxDepth);
    const levels = new Array(minLevels.length).fill(0);

    tocObj.forEach(item => {
        if (!minLevels.includes(item.level)) {
            return;
        }

        const { text, id } = item;
        const level = item.level - minLevels[0];
        for (let i = 0; i < levels.length; i++) {
            if (i > level) {
                levels[i] = 0;
            } else if (i < level) {
                if (levels[i] === 0) {
                    // if headings start with a lower level heading, set the former heading index to 1
                    // e.g. h3, h2, h1, h2, h3 => 1.1.1, 1.2, 2, 2.1, 2.1.1
                    levels[i] = 1;
                }
            } else {
                levels[i] += 1;
            }
        }

        let node = toc;
        for (const value of levels.slice(0, level + 1)) {
            if (!(value in node)) {
                node[value] = {};
            }
            node = node[value];
        }
        node.id = id;
        node.text = text;
        node.index = levels.slice(0, level + 1).join('.');
    });
    return toc;
}

class Toc extends Component {
    renderToc(toc, collapsed, showIndex = true) {
        const keys = Object.keys(toc)
            .filter(key => !['id', 'index', 'text'].includes(key))
            .map(key => parseInt(key, 10))
            .sort((a, b) => a - b);
        let result;

        if (keys.length > 0) {
            result = <ul className="menu-list">
                {keys.map(i => this.renderToc(toc[i], collapsed, showIndex))}
            </ul>;
        }

        if ('id' in toc && 'index' in toc && 'text' in toc) {
            result = <li>
                <a className={`level is-mobile${collapsed ? ' collapsed' + (toc.index === '1' ? ' is-active' : '') : ''}`} href={`#${toc.id}`}>
                    <span className="level-left">
                        {showIndex && <span className="level-item">{toc.index}</span>}
                        <span className="level-item">{unescapeHTML(toc.text)}</span>
                    </span>
                </a>
                {result}
            </li>;
        }
        return result;
    }

    render() {
        const { title, collapsed, maxDepth, showIndex, content } = this.props;

        const toc = getToc(content, maxDepth);
        if (!Object.keys(toc).length) {
            return null;
        }

        return <section id="toc" className="card widget card-content menu" datatype="toc">
            <h3 className="menu-label">{title}</h3>
            {this.renderToc(toc, collapsed, showIndex)}
        </section>;
    }
}

Toc.Cacheable = cacheComponent(Toc, 'widget.toc', props => {
    const { config, page, widget, helper } = props;
    const { layout, content, encrypt, origin } = page;
    const { index, collapsed = true, depth = 3 } = widget;

    if (!config.toc || !['page', 'post'].includes(layout)) {
        return null;
    }

    return {
        title: helper._p('widget.catalogue', Infinity),
        collapsed: collapsed,
        maxDepth: depth,
        showIndex: index,
        content: encrypt ? origin : content,
    };
});

module.exports = Toc;
