const { Component, Fragment } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Gallery extends Component {
    render() {
        const { head, lightGallery } = this.props;

        if (head) {
            return <Fragment>
                <link rel="preload" href={lightGallery.cssUrl} as="style" onLoad="this.onload=null;this.rel='stylesheet'" />
                <noscript>
                    <link rel="stylesheet" href={lightGallery.cssUrl} />
                </noscript>
                <script src={lightGallery.jsUrl} defer />
            </Fragment>;
        }

        return null;
    }
}

Gallery.Cacheable = cacheComponent(Gallery, 'plugin.gallery', props => {
    const { page, helper, head } = props;
    const { has_gallery = false } = page;

    if (!has_gallery) {
        return null;
    }

    return {
        head: head,
        lightGallery: {
            jsUrl: helper.cdn('lightgallery', '1.10.0', 'dist/js/lightgallery.min.js'),
            cssUrl: helper.cdn('lightgallery', '1.10.0', 'dist/css/lightgallery.min.css'),
        },
    };
});

module.exports = Gallery;
