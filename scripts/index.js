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
