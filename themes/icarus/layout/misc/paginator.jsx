const { Component } = require('inferno');

module.exports = class extends Component {
    renderPaginationList(getPageUrl, current, last) {
        const delta = 1;
        const left = current - delta;
        const right = current + delta + 1;

        const range = [];
        for (let i = 1; i <= last; i++) {
            if (i === 1 || i === last || (i >= left && i < right)) {
                range.push(i);
            }
        }

        let l;
        const elements = [];
        range.forEach(value => {
            if (l) {
                if (value - l === 2) {
                    elements.push(<li><a className="pagination-link" href={getPageUrl(l + 1)}>{l + 1}</a></li>);
                } else if (value - l !== 1) {
                    elements.push(<li><span className="pagination-ellipsis" dangerouslySetInnerHTML={{__html: '&hellip;'}}></span></li>);
                }
            }
            elements.push(<li><a className={`pagination-link${current === value ? ' is-current' : ''}`} href={getPageUrl(value)}>{value}</a></li>);
            l = value;
        });

        return elements;
    }

    render() {
        const { current, total, baseUrl, path, urlFor, prevTitle, nextTitle } = this.props;

        const getPageUrl = i => {
            return urlFor(i === 1 ? baseUrl : baseUrl + path + '/' + i + '/');
        };

        return <nav className="pagination">
            <a className={`pagination-previous${current > 1 ? '' : ' is-invisible'}`} href={getPageUrl(current - 1)}>{prevTitle}</a>
            <a className={`pagination-next${current < total ? '' : ' is-invisible'}`} href={getPageUrl(current + 1)}>{nextTitle}</a>
            <ul className="pagination-list" role="navigation" aria-label="pagination">
                {this.renderPaginationList(getPageUrl, current, total)}
            </ul>
        </nav>;
    }
};
