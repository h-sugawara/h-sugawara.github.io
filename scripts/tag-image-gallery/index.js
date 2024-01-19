'use strict';

const {htmlTag, encodeURL} = require('hexo-util');
const {resolve} = require('url');

function newHtmlFigureCaptionElement(text) {
    return htmlTag('figcaption', {class: 'gallery-caption'}, text);
}

function newHtmlImageElement(src, alt, width, height) {
    const attrs = {src: src, alt: alt, loading: 'lazy'};
    if (width !== '' && height !== '') {
        attrs.width = width;
        attrs.height = height;
    }
    return htmlTag('img', attrs);
}

function newHtmlAnchorElement(href, content) {
    if (typeof content !== 'string' || content === '') {
        throw new Error('failed to generate a new anchor tag.');
    }
    return htmlTag('a', {href: href, class: 'gallery-item'}, content, false);
}

function newHtmlFigureElement(content) {
    if (typeof content !== 'string' || content === '') {
        throw new Error('failed to generate a new figure tag.');
    }
    return htmlTag('figure', {}, content, false);
}

function getImageUrls(Post, PostAsset, inputs) {
    const {postSlug, imageSlugs} = inputs;
    const post = Post.findOne({slug: postSlug});
    if (!post) {
        return {preview: '', gallery: ''};
    }
    const [preview, gallery] = imageSlugs.split(',').map(slug => {
        const image = PostAsset.findOne({post: post._id, slug});
        return image ? encodeURL(resolve('/', image.path)) : '';
    });
    return {preview, gallery: gallery || preview};
}

function getImageSize(inputs) {
    if (typeof inputs !== 'string' || inputs === '') {
        return {width: '', height: ''};
    }
    const size = inputs.split('x');
    return {width: size[0], height: size[1]};
}

function imageGallery(hexo) {
    const {model} = hexo;
    const Post = model.call(hexo, 'Post');
    const PostAsset = model.call(hexo, 'PostAsset');

    return (args, content) => {
        const [postSlug, imageSlugs, alt, size] = args;
        const {gallery, preview} = getImageUrls(Post, PostAsset, {postSlug, imageSlugs});
        const {width, height} = getImageSize(size);

        return newHtmlFigureElement(
            newHtmlAnchorElement(gallery, newHtmlImageElement(preview, alt, width, height))
            + (content ? newHtmlFigureCaptionElement(content) : ''),
        );
    };
}

module.exports = {
    imageGallery
};
