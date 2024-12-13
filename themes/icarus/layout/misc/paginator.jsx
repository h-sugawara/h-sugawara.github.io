const { Component } = require('inferno');

function* range(from, to, step = 1) {
    while (from <= to) {
        yield from;
        from += step;
    }
}

module.exports = class extends Component {
    render() {
        const { current, total, baseUrl, path, urlFor, prevTitle, nextTitle } = this.props;

        const getPageUrl = i => {
            return urlFor(i === 1 ? baseUrl : baseUrl + path + '/' + i + '/');
        };

        const getPaginationList = (current, last) => {
            const delta = 1;
            const left = current - delta - 1;
            const right = current + delta + 1;

            let prev;
            const elements = [];
            Array.from(range(1, last))
                .filter(i => i === 1 || i === last || (i >= left && i <= right))
                .forEach(value => {
                    if (prev && prev !== value - 1) {
                        elements.push(<li><span className="pagination-ellipsis" dangerouslySetInnerHTML={{ __html: '&hellip;' }}></span></li>);
                    }
                    elements.push(<li><a className={`pagination-link${current === value ? ' is-current' : ''}`} href={getPageUrl(value)}>{value}</a></li>);
                    prev = value;
                });
            return elements;
        };

        return <nav className="pagination" aria-label="pagination">
            {current > 1 ? <a className="pagination-previous" href={getPageUrl(current - 1)}>{prevTitle}</a>
                : <div className="pagination-previous is-invisible"></div>}
            {current < total ? <a className="pagination-next" href={getPageUrl(current + 1)}>{nextTitle}</a>
                : <div className="pagination-next is-invisible"></div>}
            <ul className="pagination-list">{getPaginationList(current, total)}</ul>
        </nav>;
    }
};
