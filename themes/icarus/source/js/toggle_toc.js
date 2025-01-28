/* eslint-disable node/no-unsupported-features/node-builtins */
(function() {
    const $toc = document.querySelector('#toc');
    if ($toc == null) {
        return;
    }

    const $mask = document.createElement('div');
    $mask.setAttribute('id', 'toc-mask');
    document.body.appendChild($mask);

    function toggleToc(event) { // eslint-disable-line no-inner-declarations
        event.preventDefault();
        $toc.classList.toggle('is-active');
        $mask.classList.toggle('is-active');
    }

    $toc.addEventListener('click', toggleToc);
    $mask.addEventListener('click', toggleToc);

    document.querySelector('.catalogue').addEventListener('click', toggleToc);
}());
