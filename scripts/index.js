'use strict';

const {config} = hexo;
const {shareLinkPreview, getOptionsFrom} = require('./tag-share-link-preview');

hexo.config.link_preview = Object.assign(getOptionsFrom(config), config.link_preview);
hexo.extend.tag.register('link_preview', shareLinkPreview(config.link_preview), {async: true});
