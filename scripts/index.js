'use strict';

hexo.extend.tag.register(
    'ruby',
    require('./tag-ruby-annotation').getInlineRuby(),
    {async: false, ends: false}
);

hexo.extend.tag.register(
    'rubies',
    require('./tag-ruby-annotation').getBlockRuby(hexo),
    {async: false, ends: true}
);

hexo.extend.tag.register(
    'gallery',
    require('./tag-image-gallery').imageGallery(hexo),
    {async: false, ends: true}
);

hexo.extend.tag.register(
    'message',
    require('./tag-message').message(hexo),
    {async: false, ends: true}
);
