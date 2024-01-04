'use strict';

const util = require('hexo-util');

function newHtmlFigureCaptionElement(text) {
    return util.htmlTag('figcaption', {class: 'caption'}, text);
}

function newHtmlImageElement(src, alt, width, height) {
    const attrs = {src: src, alt: alt, loading: 'lazy'};
    if (width !== '' && height !== '') {
        attrs.width = width;
        attrs.height = height;
    }
    return util.htmlTag('img', attrs);
}

function newHtmlAnchorElement(href, content) {
    if (typeof content !== 'string' || content === '') {
        throw new Error('failed to generate a new anchor tag.');
    }
    return util.htmlTag('a', {href: href, class: 'gallery-item'}, content, false);
}

function newHtmlFigureElement(content) {
    if (typeof content !== 'string' || content === '') {
        throw new Error('failed to generate a new figure tag.');
    }
    return util.htmlTag('figure', {}, content, false);
}

function getImageSourcePaths(inputs) {
    const regexp = /^(?<path>[^{]+){?(?<files>[^}]*)}?$/g;
    return [...inputs.matchAll(regexp)]
        .filter(value => value.hasOwnProperty('groups') && typeof value.groups === 'object')
        .map(value => {
            if (value.groups.files === '') {
                return {preview: value.groups.path, gallery: value.groups.path};
            }
            const files = value.groups.files.split(',').map(file => {
                return value.groups.path + file;
            })
            return {preview: files[0], gallery: files[1]};
        })
        .shift();
}

function getImageSize(inputs) {
    if (typeof inputs !== 'string' || inputs === '') {
        return {width: '', height: ''};
    }
    const size = inputs.split('x');
    return {width: size[0], height: size[1]};
}

function galleryImage(hexo) {
    return (args, content) => {
        const {gallery, preview} = getImageSourcePaths(args[0]);
        const alt = args[1];
        const {width, height} = getImageSize(args[2]);

        return newHtmlFigureElement(
            newHtmlAnchorElement(
                gallery,
                newHtmlImageElement(preview, alt, width, height) + newHtmlFigureCaptionElement(content),
            ),
        );
    };
}

module.exports = {
    galleryImage
};
