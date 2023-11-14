'use strict';

const getConfig = require('./lib/configure');
const createHtmlTag = require('./lib/generator');
const getUserAgent = require('./lib/crawler');

module.exports = hexo => (args, content) => {
    const config = getConfig(hexo.config);

    const params = {
        scrape: {
            url: args[0],
            fetchOptions: config.disguise_crawler ? {headers: getUserAgent()} : {},
        },
        generate: {
            target: args[1] || '_blank',
            rel: args[2] || 'nofollow',
            descriptionLength: config.description_length,
            className: config.class_name,
            fallbackTitle: content,
        }
    };

    return createHtmlTag(params)
        .then(tag => tag)
        .catch(error => {
            console.log('error:', error);
            return '';
        });
};
