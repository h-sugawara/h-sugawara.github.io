/* eslint-disable node/no-unsupported-features/node-builtins */
(function($, ClipboardJS, config) {
    function toggleFold(codeBlock, isFolded) {
        const $toggle = $(codeBlock).find('.fold i');
        !isFolded ? $(codeBlock).removeClass('folded') : $(codeBlock).addClass('folded');
        !isFolded ? $toggle.removeClass('svg-angle-right') : $toggle.removeClass('svg-angle-down');
        !isFolded ? $toggle.addClass('svg-angle-down') : $toggle.addClass('svg-angle-right');
    }

    function createFoldButton(fold) {
        const icon = fold === 'unfolded' ? '<i class="svg-angle-down"></i>' : '<i class="svg-angle-right"></i>';
        return '<span class="fold" type="button">' + icon + '</span>';
    }

    if (typeof config !== 'undefined'
        && typeof config.article !== 'undefined'
        && typeof config.article.highlight !== 'undefined') {

        const clipboard = config.article.highlight.clipboard;
        const fold = config.article.highlight.fold.trim();

        const captions = $('pre div.caption');
        captions.closest('pre').addClass('highlight-body').wrap('<div class="highlight hljs">');
        captions.each(function() {
            $(this).closest('div.highlight').prepend($(this));
            $(this).addClass('level is-mobile');
            $(this).append('<div class="level-left">');
            $(this).append('<div class="level-right">');
            $(this).find('div.level-left').append($(this).find('span'));
            $(this).find('div.level-right').append($(this).find('button'));
        });

        if (typeof ClipboardJS !== 'undefined' && clipboard) {
            $('div.highlight div.caption').each(function() {
                const id = 'code-' + Date.now() + (Math.random() * 1000 | 0);
                const button = '<button type="button" class="copy" title="Copy" data-clipboard-target="#' + id + ' code"><i class="svg-copy"></i></button>';
                $(this).closest('div.highlight').attr('id', id);
                $(this).find('div.level-right').append(button);
            });
            new ClipboardJS('.highlight .copy'); // eslint-disable-line no-new
        }

        if (fold) {
            $('div.highlight').each(function() {
                $(this).addClass('foldable'); // add 'foldable' class as long as fold is enabled

                if ($(this).find('div.caption').find('span').length > 0) {
                    const span = $(this).find('div.caption').find('span');
                    if (span[0].innerText.indexOf('>folded') > -1) {
                        span[0].innerText = span[0].innerText.replace('>folded', '');
                        $(this).find('figcaption div.level-left').prepend(createFoldButton('folded'));
                        toggleFold(this, true);
                        return;
                    }
                }
                $(this).find('div.caption div.level-left').prepend(createFoldButton(fold));
                toggleFold(this, fold === 'folded');
            });

            $('div.highlight div.caption .level-left').click(function() {
                const $code = $(this).closest('div.highlight');
                toggleFold($code.eq(0), !$code.hasClass('folded'));
            });
        }
    }
}(jQuery, window.ClipboardJS, window.IcarusThemeSettings));
