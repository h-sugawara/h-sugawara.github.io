/* eslint-disable node/no-unsupported-features/node-builtins */
(function ($) {
    $('.og-image img').each(function () {
        // 記事のリンクプレビュー画像のイメージエレメントに、遅延ロード属性と代替テキスト属性を付与（プラグインアップデート後に削除）
        $(this).prop('loading', 'lazy');
        $(this).attr('alt', $('.og-title').text());
    });

    /*$('.article img:not(".not-gallery-item")').each(function () {
        // wrap images with link and add caption if possible
        if ($(this).parent('a').length === 0) {
            $(this).wrap('<a class="gallery-item" href="' + $(this).attr('src') + '"></a>');
            if (this.alt) {
                $(this).after('<p class="has-text-centered is-size-6 caption">' + this.alt + '</p>');
            }
            $(this).prop('loading', 'lazy');
        }
    });*/

    $('.article > .content > table').each(function () {
        if ($(this).width() > $(this).parent().width()) {
            $(this).wrap('<div class="table-overflow"></div>');
        }
    });

    function adjustNavbar() {
        const navbarWidth = $('.navbar-main .navbar-start').outerWidth() + $('.navbar-main .navbar-end').outerWidth();
        if ($(document).outerWidth() < navbarWidth) {
            $('.navbar-main .navbar-menu').addClass('justify-content-start');
        } else {
            $('.navbar-main .navbar-menu').removeClass('justify-content-start');
        }
    }

    adjustNavbar();
    $(window).resize(adjustNavbar);
}(jQuery));
