/* eslint-disable node/no-unsupported-features/node-builtins */
(function ($, moment) {
    if (typeof moment === 'function') {
        $('.article-meta time').each(function () {
            $(this).text(moment($(this).attr('datetime')).fromNow());
        });
    }
}(jQuery, window.moment));
