(function() {
    const $button = document.querySelector('#back-to-top');

    function update() {
        if (window.scrollY <= 0) {
            $button.classList.remove('fade-in');
        } else if (window.scrollY >= window.innerHeight * 0.5) {
            $button.classList.add('fade-in');
        } else if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight) {
            $button.classList.add('fade-in');
        }
    }

    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update);

    $button.addEventListener('click', event => {
        event.preventDefault();
        window.scroll({ top: 0, behavior: 'smooth' });
    });
}());
