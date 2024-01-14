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
    'gallery',
    require('./tag-image-gallery').imageGallery(hexo),
    {async: false, ends: true}
);

hexo.extend.tag.unregister('message');
hexo.extend.tag.register(
    'message',
    require('./tag-message').message(hexo),
    {async: false, ends: true}
);

// hexo-component-inferno による header end injection を削除
hexo.extend.injector.store.head_end = {};
