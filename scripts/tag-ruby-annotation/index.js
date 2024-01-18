'use strict';

const {htmlTag} = require('hexo-util');

function getRubyText(args) {
    return args.map(arg => {
        const result = [...arg.matchAll(/(?<base>[^|]+)[|｜](?<text>.*)/g)]
            .filter(value => 'groups' in value && typeof value.groups === 'object')
            .map(({groups}) => htmlTag('ruby', {}, groups.base + htmlTag('rt', {}, groups.text), false))
            .join()
        return result || arg;
    }).join(' ');
}

function getInlineRuby() {
    return args => getRubyText(args);
}

function getBlockRuby(hexo) {
    const {render} = hexo;

    return (args, content) => render.renderSync({
        text: content.replaceAll(/<!--(.+?)-->/g, (_, p1) => getRubyText(p1.trim().split(' '))),
        engine: 'markdown',
    });
}

module.exports = {
    getInlineRuby,
    getBlockRuby,
};
