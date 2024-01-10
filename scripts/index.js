'use strict';

hexo.extend.tag.register(
    'ruby',
    require('./tag-ruby-annotation').getInlineRuby(hexo),
    {async: false, ends: false}
);

hexo.extend.tag.register(
    'multi_ruby_in_lines',
    require('./tag-ruby-annotation').getBlockRuby(hexo),
    {async: false, ends: true}
);

hexo.extend.tag.register(
    'gallery_img',
    require('./tag-gallery-image').galleryImage(hexo),
    {async: false, ends: true}
);

// hexo-component-inferno による header end injection を削除
hexo.extend.injector.store.head_end = {};
