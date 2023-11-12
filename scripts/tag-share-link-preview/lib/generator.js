'use strict';

const util = require('hexo-util');
const escapeHTML = require('escape-html');
const ogs = require('open-graph-scraper');

module.exports = async function (options, config) {
    return ogs(options)
        .then(function (data) {
            const ogp = data.result;

            const isTitleValid = (ogp.hasOwnProperty('ogTitle') && ogp.ogTitle !== '');
            const isDescriptionValid = (ogp.hasOwnProperty('ogDescription') && ogp.ogDescription !== '');

            if (isTitleValid && isDescriptionValid) {
                const title = util.htmlTag('div', {class: 'og-title'}, escapeHTML(ogp.ogTitle), false);

                const escapedDescription = escapeHTML(ogp.ogDescription)
                const descriptionText = (escapedDescription && escapedDescription > config.descriptionLength) ?
                    escapedDescription.slice(0, config.descriptionLength) + '...' : escapedDescription;
                const description = util.htmlTag('div', {class: 'og-description'}, descriptionText, false);

                const descriptions = util.htmlTag('div', {class: 'descriptions'}, title + description, false);

                let image = '';
                if (ogp.hasOwnProperty('ogImage') && ogp.ogImage.length > 0) {
                    const imageUrl = ogp.ogImage[0].url;
                    image = util.htmlTag('div', {class: 'og-image'}, util.htmlTag('img', {src: imageUrl}, ''), false);
                }

                const link = util.htmlTag('a', {
                    href: options.url,
                    class: config.className,
                    target: config.target,
                    rel: config.rel
                }, image + descriptions, false);

                return util.htmlTag('div', {class: 'link-area'}, link, false);
            }

            return util.htmlTag('a', {
                href: options.url,
                target: config.target,
                rel: config.rel
            }, config.fallbackTitle)
        })
        .catch(function (error) {
            console.log('error:', error);
            return '';
        });
}
