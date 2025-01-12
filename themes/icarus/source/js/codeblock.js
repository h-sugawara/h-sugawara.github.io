/* eslint-disable node/no-unsupported-features/node-builtins */
(function(ClipboardJS, config) {
    function toggleFold($codeBlock, isFolded) {
        const $toggle = $codeBlock.querySelector('.fold i');
        !isFolded ? $codeBlock.classList.remove('folded') : $codeBlock.classList.add('folded');
        $toggle.classList.remove(!isFolded ? 'svg-angle-right' : 'svg-angle-down');
        $toggle.classList.add(!isFolded ? 'svg-angle-down' : 'svg-angle-right');
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

        document.querySelectorAll('pre').forEach($element => {
            $element.classList.add('highlight-body');
            $element.outerHTML = '<div class="highlight hljs">' + $element.outerHTML + '</div>';
        });

        document.querySelectorAll('div.highlight').forEach($element => {
            const left = document.createElement('div');
            left.classList.add('level-left');
            const right = document.createElement('div');
            right.classList.add('level-right');
            const $caption = $element.querySelector('.caption');
            $caption.classList.add('level', 'is-mobile');
            $caption.appendChild(left);
            $caption.appendChild(right);
            left.insertBefore($caption.querySelector('span'), left.firstElementChild);
            $element.insertBefore($caption, $element.firstElementChild);
        });

        if (typeof ClipboardJS !== 'undefined' && clipboard) {
            document.querySelectorAll('div.highlight div.caption').forEach($element => {
                const copyIcon = document.createElement('i');
                copyIcon.classList.add('svg-copy');
                const button = document.createElement('button');
                const id = 'code-' + Date.now() + (Math.random() * 1000 | 0);
                button.classList.add('copy');
                button.setAttribute('type', 'button');
                button.setAttribute('title', 'Copy');
                button.setAttribute('data-clipboard-target', '#' + id + ' code');
                button.appendChild(copyIcon);
                $element.querySelector('div.level-right').appendChild(button);
                $element.closest('div.highlight').setAttribute('id', id);
            });
            new ClipboardJS('.highlight .copy'); // eslint-disable-line no-new
        }

        if (fold) {
            document.querySelectorAll('div.highlight').forEach($code => {
                $code.classList.add('foldable');
                const $caption = $code.querySelectorAll('div.caption span');
                if ($caption.length > 0 && $caption[0].textContent.indexOf('>folded') > -1) {
                    $caption[0].textContent = $caption[0].textContent.replace('>folded', '');
                    $code.querySelectorAll('figcaption div.level-left').forEach($element => {
                        $element.insertBefore(createFoldButton('folded'), $element.firstElementChild);
                    });
                    toggleFold($code, true);
                    return;
                }
                $code.querySelectorAll('div.caption div.level-left').forEach($element => {
                    $element.insertBefore(createFoldButton(fold), $element.firstElementChild);
                });
                toggleFold($code, fold === 'folded');
            });

            document.querySelectorAll('div.highlight div.caption .level-left').forEach($element => {
                $element.addEventListener('click', $event => {
                    const $code = $event.target.closest('div.highlight');
                    toggleFold($code, !$code.classList.contains('folded'));
                });
            });
        }
    }
}(window.ClipboardJS, window.IcarusThemeSettings));
