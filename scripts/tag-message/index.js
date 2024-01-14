'use strict';

const {htmlTag} = require('hexo-util');

function parse(args) {
    let title = '';
    let classes = '';
    for (const arg of args) {
        const [key, value] = arg.split(':');
        switch (key) {
            case 'size':
                classes += ` is-${value}`;
                break;
            case 'color':
                classes += ` is-${value}`;
                break;
            case 'title':
                title = value;
                break;
        }
    }
    return {title, classes}
}

function newHtmlAsideElement(classNames, content) {
    return htmlTag('aside', {class: classNames}, content, false);
}

function newHtmlDivElement(classNames, content) {
    return htmlTag('div', {class: classNames}, content, false);
}

function message(hexo) {
    const {render} = hexo;

    return (args, content) => {
        const {title, classes} = parse(args);
        const header = title ? newHtmlDivElement('message-header', render.renderSync({text: title, engine: 'markdown'})) : '';

        return newHtmlAsideElement(
            `message${classes}`,
            header + newHtmlDivElement('message-body', render.renderSync({text: content, engine: 'markdown'})),
        );
    };
}

module.exports = {
    message,
};
