'use strict';

const hljs = require('highlight.js');

function highlighting(md, highlighter, ignoreIllegals, code, lang) {
    try {
        const language = lang !== '' ? lang : 'plaintext';
        return highlighter.highlight(code, {language, ignoreIllegals}).value;
    } catch (e) {
        return md.utils.escapeHtml(code);
    }
}

function renderFence(md) {
    const {unescapeAll, escapeHtml} = md.utils;

    const getContent = (token, opts, langName) => {
        if (opts.highlight) {
            return opts.highlight(token.content, langName) || escapeHtml(token.content)
        }
        return escapeHtml(token.content);
    }

    const getCodeAttrs = (token, info, opts, langName) => {
        if (!info) {
            return token;
        }
        const i = token.attrIndex('class');
        const tokenAttrs = token.attrs ? token.attrs.slice() : [];
        if (i < 0) {
            tokenAttrs.push(['class', `hljs ${opts.langPrefix + langName}`]);
        } else {
            tokenAttrs[i] = tokenAttrs[i].slice()
            tokenAttrs[i][1] += ' hljs ' + opts.langPrefix + langName
        }
        return {attrs: tokenAttrs};
    }

    const createHeaderElements = (attrs) => {
        const caption = attrs.filter(v => v.trim()).join(' ');
        if (caption === '') {
            return '';
        }
        return `<div class="caption level is-mobile"><div class="level-left"><span class="level-item">${caption}</span></div><div class="level-right"></div></div>`;
    }

    return (tokens, idx, opts, env, slf) => {
        const token = tokens[idx];
        const info = token.info ? unescapeAll(token.info).trim() : '';
        const [name = '', ...attrs] = info ? info.split(/(\s+)/g) : [];
        const content = getContent(token, opts, name);

        if (content.indexOf('<pre') === 0) {
            return content + '\n';
        }

        const bodyElements = `<pre class="highlight-body"><code${slf.renderAttrs(getCodeAttrs(token, info, opts, name))}>${content}</code></pre>`;

        return `<div class="highlight hljs">${createHeaderElements(attrs)}${bodyElements}</div>\n`;
    }
}

module.exports = function plugin(md, options) {
    const {highlighter} = options || {highlighter: hljs};
    md.options.highlight = highlighting.bind(null, md, highlighter, true);
    md.renderer.rules.fence = renderFence(md);
};
