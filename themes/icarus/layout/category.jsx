const { Component, Fragment } = require('inferno');
const Index = require('./index');

module.exports = class extends Component {
    render() {
        const { config, page, helper } = this.props;
        const { url_for, _p } = helper;
        const { parents, category } = page;

        return <Fragment>
            <div className="card card-content">
                <nav className="breadcrumb" aria-label="breadcrumbs">
                    <ul>
                        <li><a href={url_for('/categories/')}>{_p('common.category', Infinity)}</a></li>
                        {parents.map(({path, name}) => <li><a href={url_for(path)}>{name}</a></li>)}
                        <li className="is-active"><a href="#" aria-current="page">{category}</a></li>
                    </ul>
                </nav>
            </div>
            <Index config={config} page={page} helper={helper} />
        </Fragment>;
    }
};
