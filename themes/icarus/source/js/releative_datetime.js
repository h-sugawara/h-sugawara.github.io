/* eslint-disable node/no-unsupported-features/node-builtins */
(function(moment) {
    if (typeof moment === 'function') {
        document.querySelectorAll('.article-meta time').forEach($time => {
            $time.textContent = moment($time.getAttribute('datetime')).fromNow();
        });
    }
}(window.moment));
