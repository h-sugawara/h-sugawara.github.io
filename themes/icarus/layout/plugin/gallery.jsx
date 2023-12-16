const { Component, Fragment } = require('inferno');
const { cacheComponent } = require('hexo-component-inferno/lib/util/cache');

class Gallery extends Component {
    render() {
        const { head, lightGallery, justifiedGallery } = this.props;

        if (head) {
            return <Fragment>
                <link rel="stylesheet" href={lightGallery.cssUrl}/>
                <link rel="stylesheet" href={justifiedGallery.cssUrl}/>
            </Fragment>;
        }

        const js = "window.addEventListener(\"load\",()=>{if(typeof $.fn.lightGallery==='function'){$('.article').lightGallery({selector:'.gallery-item'});} if(typeof $.fn.justifiedGallery==='function'){if($('.justified-gallery>p>.gallery-item').length){$('.justified-gallery > p > .gallery-item').unwrap();}$('.justified-gallery').justifiedGallery();}});";
        return <Fragment>
            <script src={lightGallery.jsUrl} defer />
            <script src={justifiedGallery.jsUrl} defer />
            <script dangerouslySetInnerHTML={{__html: js}} />
        </Fragment>;
    }
}

Gallery.Cacheable = cacheComponent(Gallery, 'plugin.gallery', props => {
    const { page, helper, head } = props;
    const hasGallery = typeof page.has_gallery === 'boolean' ? page.has_gallery : true;

    if (!hasGallery) {
        return null;
    }

    return {
        head: head,
        lightGallery: {
            jsUrl: helper.cdn('lightgallery', '1.10.0', 'dist/js/lightgallery.min.js'),
            cssUrl: helper.cdn('lightgallery', '1.10.0', 'dist/css/lightgallery.min.css')
        },
        justifiedGallery: {
            jsUrl: helper.cdn('justifiedGallery', '3.8.1', 'dist/js/jquery.justifiedGallery.min.js'),
            cssUrl: helper.cdn('justifiedGallery', '3.8.1', 'dist/css/justifiedGallery.min.css')
        }
    };
});

module.exports = Gallery;
