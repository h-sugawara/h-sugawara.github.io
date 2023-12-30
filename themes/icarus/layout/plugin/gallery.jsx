const { Component, Fragment } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Gallery extends Component {
    render() {
        const { head, lightGallery, justifiedGallery } = this.props;

        if (head) {
            return <Fragment>
                <link rel="preload" href={lightGallery.cssUrl} as="style" onLoad="this.onload=null;this.rel='stylesheet'" />
                <link rel="preload" href={justifiedGallery.cssUrl} as="style" onLoad="this.onload=null;this.rel='stylesheet'" />
                <noscript>
                    <link rel="stylesheet" href={lightGallery.cssUrl} />
                    <link rel="stylesheet" href={justifiedGallery.cssUrl} />
                </noscript>
                <script src={lightGallery.jsUrl} defer />
                <script src={justifiedGallery.jsUrl} defer />
            </Fragment>;
        }

        const js = 'window.addEventListener("load",()=>{if(typeof $.fn.lightGallery===\'function\'){$(\'.article\').lightGallery({selector:\'.gallery-item\'});} if(typeof $.fn.justifiedGallery===\'function\'){if($(\'.justified-gallery>p>.gallery-item\').length){$(\'.justified-gallery > p > .gallery-item\').unwrap();}$(\'.justified-gallery\').justifiedGallery();}});';
        return <script dangerouslySetInnerHTML={{__html: js}} />;
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
        justifiedGallery: {
            jsUrl: helper.cdn('justifiedGallery', '3.8.1', 'dist/js/jquery.justifiedGallery.min.js'),
            cssUrl: helper.cdn('justifiedGallery', '3.8.1', 'dist/css/justifiedGallery.min.css'),
        },
    };
});

module.exports = Gallery;
