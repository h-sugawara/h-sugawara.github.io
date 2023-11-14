'use strict';

hexo.extend.tag.register('link_preview', require('./tag-ogp-link-preview')(hexo), {async: true, ends: true});
