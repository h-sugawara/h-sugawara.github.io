'use strict';

const util = require('hexo-util');

function getInlineRuby(hexo) {
    return (args) => {
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
}

function getBlockRuby(hexo) {
    return (args, content) => {
        console.log(content);
    }
}

module.exports = {
    getInlineRuby,
    getBlockRuby,
};
