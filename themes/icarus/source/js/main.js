/* eslint-disable node/no-unsupported-features/node-builtins */
(function() {
    document.querySelectorAll('.article > .content > table').forEach($table => {
        if ($table.offsetWidth > $table.parentElement.offsetWidth) {
            $table.outerHTML = '<div class="table-overflow">' + $table.outerHTML + '</div>';
        }
    });

    const $navbarMain = document.querySelector('.navbar-main');
    const $navbarStart = $navbarMain.querySelector('.navbar-start');
    const $navbarEnd = $navbarMain.querySelector('.navbar-end');
    const navbarMenu = $navbarMain.querySelector('.navbar-menu');

    function adjustNavbar() {
        const navbarWidth = $navbarStart.offsetWidth + $navbarEnd.offsetWidth;
        if (window.innerWidth < navbarWidth) {
            navbarMenu.classList.add('justify-content-start');
        } else {
            navbarMenu.classList.remove('justify-content-start');
        }
    }

    adjustNavbar();
    window.addEventListener('resize', adjustNavbar);
}());
