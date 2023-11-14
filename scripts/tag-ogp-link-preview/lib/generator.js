'use strict';

const util = require('hexo-util');
const ogs = require('open-graph-scraper');

function getOgTitle(ogp) {
    let valid = false;
    let title = ''

    if (ogp.hasOwnProperty('ogTitle')) {
        const escapedTitle = util.escapeHTML(ogp.ogTitle);

        if (typeof escapedTitle === 'string' && escapedTitle !== '') {
            valid = true;
            title = escapedTitle;
        }
    }

    return {valid, title};
}

function getOgDescription(ogp, config) {
    let valid = false;
    let description = ''

    if (ogp.hasOwnProperty('ogDescription')) {
        const escapedDescription = util.escapeHTML(ogp.ogDescription);
        const descriptionText = (escapedDescription && escapedDescription > config.descriptionLength) ?
            escapedDescription.slice(0, config.descriptionLength) + '...' : escapedDescription;

        if (typeof descriptionText === 'string' && descriptionText !== '') {
            valid = true;
            description = descriptionText;
        }
    }

    return {valid, description};
}

function createHtmlDivTag(className, content) {
    return util.htmlTag('div', {class: className}, content, false);
}

function createHtmlAnchorTag(url, config, content) {
    let tagAttrs = {href: url, target: config.target, rel: config.rel};
    let tagContent = content;
    let escape = true;

    if (typeof content === 'string' && content !== '') {
        tagAttrs.class = config.className;
        escape = false;
    } else if (config.hasOwnProperty('fallbackTitle') && typeof config.fallbackTitle === 'string' && config.fallbackTitle !== '') {
        tagContent = config.fallbackTitle;
    }
    return util.htmlTag('a', tagAttrs, tagContent, escape);
}

function createHtmlImgTag(url) {
    return util.htmlTag('img', {src: url, class: 'not-gallery-item'}, '');
}

module.exports = params => {
    return ogs(params.scrape)
        .then((data) => {
            const ogp = data.result;

            const {valid: isTitleValid, title: escapedTitle} = getOgTitle(ogp);
            const {valid: isDescriptionValid, description: escapedDescription} = getOgDescription(ogp, params.generate);

            let content = '';

            if (isTitleValid && isDescriptionValid) {
                const title = createHtmlDivTag('og-title', escapedTitle);
                const description = createHtmlDivTag('og-description', escapedDescription);
                const descriptions = createHtmlDivTag('descriptions', title + description);

                let image = '';
                if (ogp.hasOwnProperty('ogImage') && ogp.ogImage.length > 0) {
                    image = createHtmlDivTag('og-image', createHtmlImgTag(ogp.ogImage[0].url));
                }

                content = image + descriptions;
            }

            return createHtmlAnchorTag(params.scrape.url, params.generate, content);
        })
        .catch(error => {
            console.log('error:', error);
            return '';
        });
}
