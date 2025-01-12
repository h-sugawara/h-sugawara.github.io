/* eslint-disable node/no-unsupported-features/node-builtins */
(function($) {
    if (typeof $.fn.lightGallery === 'function') {
        $('.article').lightGallery({ selector: '.gallery-item' });
    }
}(jQuery));
