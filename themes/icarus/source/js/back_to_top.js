(function() {
    const $backToTop = document.querySelector('#back-to-top');

    function update() {
        if (window.scrollY <= 0) {
            $backToTop.classList.remove('fade-in');
        } else if (window.scrollY >= window.innerHeight * 0.5) {
            $backToTop.classList.add('fade-in');
        } else if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
            $backToTop.classList.add('fade-in');
        }
    }

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update);

    $backToTop.querySelector('.back-to-top').addEventListener('click', event => {
        event.preventDefault();
        window.scroll({ top: 0, behavior: 'smooth' });
    });
}());
