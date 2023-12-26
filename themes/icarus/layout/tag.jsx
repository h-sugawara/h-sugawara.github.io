const { Component, Fragment } = require('inferno');
const Index = require('./index');

module.exports = class extends Component {
    render() {
        const { config, page, helper } = this.props;
        const { url_for, _p } = helper;

        return <Fragment>
            <div className="card">
                <div className="card-content">
                    <nav className="breadcrumb" aria-label="breadcrumbs">
                        <ul>
                            <li><a href={url_for('/tags')}>{_p('common.tag', Infinity)}</a></li>
                            <li className="is-active"><a href="#" aria-current="page">{page.tag}</a></li>
                        </ul>
                    </nav>
                </div>
            </div>
            <Index config={config} page={page} helper={helper} />
        </Fragment>;
    }
};
