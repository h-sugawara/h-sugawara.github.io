'use strict';
const getTag = require('./lib/generator');

function shareLinkPreview(config) {
    const userAgent = 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/112.0.0.0 Safari/537.36';

    return function (args) {
        return getTag(
            {
                url: args[0],
                fetchOptions: {headers: {'user-agent': userAgent}},
            },
            {
                target: '_blank',
                rel: 'nofollow',
                descriptionLength: config.description_length,
                className: config.class_name,
                fallbackTitle: args[1],
            })
            .then(tag => {
                return tag;
            });
    }
}

function getOptionsFrom(config) {
    const class_name = config.link_preview && config.link_preview.class_name ? config.link_preview.class_name : 'link-preview';
    const description_length = config.link_preview && config.link_preview.description_length ? config.link_preview.description_length : 140;

    return {
        class_name,
        description_length,
    }
}

module.exports = {
    shareLinkPreview,
    getOptionsFrom,
}