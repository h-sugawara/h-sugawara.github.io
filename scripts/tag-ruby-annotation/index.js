'use strict';

const util = require('hexo-util');

function getRubyText(args) {
    return args.map(arg => {
        const result = [...arg.matchAll(/(?<base>[^|]+)[|｜](?<text>.*)/g)]
            .filter(value => value.hasOwnProperty('groups') && typeof value.groups === 'object')
            .map(value => {
                const rubyContent = value.groups.base + util.htmlTag('rt', {}, value.groups.text, false);
                return util.htmlTag('ruby', {}, rubyContent, false);
            })
            .join()
        return result || arg;
    }).join(' ');
}

function getInlineRuby(hexo) {
    return (args) => getRubyText(args);
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
