/* eslint-disable node/no-unsupported-features/node-builtins */
(function(ClipboardJS, config) {
    function toggleFold($codeBlock, isFolded) {
        const $toggle = $codeBlock.querySelector('.fold i');
        isFolded ? $codeBlock.classList.add('folded') : $codeBlock.classList.remove('folded');
        $toggle.classList.remove(isFolded ? 'svg-angle-down' : 'svg-angle-right');
        $toggle.classList.add(isFolded ? 'svg-angle-right' : 'svg-angle-down');
    }

    function createFoldButton(fold) {
        const icon = document.createElement('i');
        icon.classList.add(fold === 'unfolded' ? 'svg-angle-down' : 'svg-angle-right');
        const button = document.createElement('span');
        button.classList.add('fold');
        button.appendChild(icon);
        return button;
    }

    if (typeof config !== 'undefined'
        && typeof config.article !== 'undefined'
        && typeof config.article.highlight !== 'undefined') {

        const clipboard = config.article.highlight.clipboard;
        const fold = config.article.highlight.fold.trim();
        const clipboardEnabled = typeof ClipboardJS !== 'undefined' && clipboard;

        document.querySelectorAll('div.highlight div.caption').forEach($caption => {
            if (clipboardEnabled) {
                const copyIcon = document.createElement('i');
                copyIcon.classList.add('svg-copy');
                const button = document.createElement('button');
                const id = 'code-' + Date.now() + (Math.random() * 1000 | 0);
                button.classList.add('copy');
                button.setAttribute('type', 'button');
                button.setAttribute('title', 'Copy');
                button.setAttribute('data-clipboard-target', '#' + id + ' code');
                button.appendChild(copyIcon);
                $caption.querySelector('div.level-right').appendChild(button);
                $caption.closest('div.highlight').setAttribute('id', id);
                new ClipboardJS('.highlight .copy'); // eslint-disable-line no-new
            }

            if (fold) {
                $caption.parentElement.classList.add('foldable');
                $caption.querySelectorAll('div.level-left').forEach($element => {
                    $element.insertBefore(createFoldButton(fold), $element.firstElementChild);
                    $element.addEventListener('click', $event => {
                        const $code = $event.target.closest('div.highlight');
                        toggleFold($code, !$code.classList.contains('folded'));
                    });
                });
                toggleFold($caption.parentElement, fold === 'folded');
            }
        });
    }
}(window.ClipboardJS, window.IcarusThemeSettings));
