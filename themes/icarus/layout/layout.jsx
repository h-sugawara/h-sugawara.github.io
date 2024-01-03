const { Component } = require('inferno');
const classname = require('hexo-component-inferno/lib/util/classname');
const Head = require('./common/head');
const Navbar = require('./common/navbar');
const Widgets = require('./common/widgets');
const Footer = require('./common/footer');
const Assets = require('./common/assets');
const Search = require('./common/search');

module.exports = class extends Component {
    render() {
        const { site, config, page, helper, body } = this.props;

        const language = page.lang || page.language || config.language;
        const columnCount = Widgets.getColumnCount(config.widgets, config, page);

        return <html lang={language ? language.substr(0, 2) : ''}>
            <Head site={site} config={config} helper={helper} page={page} />
            <body className={`is-${columnCount}-column`}>
                <Navbar config={config} helper={helper} page={page} />
                <section className="section">
                    <div className="container">
                        <div className="columns">
                            <div className={classname({
                                'column': true,
                                'column-main': true,
                                'column-solo': columnCount === 1,
                                'column-duo-main': columnCount === 2,
                                'column-trio-main': columnCount === 3,
                            })} dangerouslySetInnerHTML={{ __html: body }}></div>
                            <Widgets site={site} config={config} helper={helper} page={page} position={'left'} />
                            <Widgets site={site} config={config} helper={helper} page={page} position={'right'} />
                        </div>
                    </div>
                </section>
                <Footer config={config} helper={helper} />
                <Assets site={site} config={config} helper={helper} page={page} head={false} />
                <Search config={config} helper={helper} />
            </body>
        </html>;
    }
};
