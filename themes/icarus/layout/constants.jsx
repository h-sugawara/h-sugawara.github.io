const PAGE_TYPE_HOME = 'home';
const PAGE_TYPE_ARCHIVE = 'archive';
const PAGE_TYPE_CATEGORIES = 'categories';
const PAGE_TYPE_CATEGORY = 'category';
const PAGE_TYPE_TAGS = 'tags';
const PAGE_TYPE_TAG = 'tag';
const PAGE_TYPE_PAGE = 'page';
const PAGE_TYPE_POST = 'post';
const PAGE_TYPE_OTHERS = 'others';

function getPageType(helper) {
    if (helper.is_home()) {
        return PAGE_TYPE_HOME;
    }
    if (helper.is_archive()) {
        return PAGE_TYPE_ARCHIVE;
    }
    if (helper.is_categories()) {
        return PAGE_TYPE_CATEGORIES;
    }
    if (helper.is_category()) {
        return PAGE_TYPE_CATEGORY;
    }
    if (helper.is_tags()) {
        return PAGE_TYPE_TAGS;
    }
    if (helper.is_tag()) {
        return PAGE_TYPE_TAG;
    }
    if (helper.is_page()) {
        return PAGE_TYPE_PAGE;
    }
    if (helper.is_post()) {
        return PAGE_TYPE_POST;
    }
    return PAGE_TYPE_OTHERS;
}

module.exports = {
    PAGE_TYPE_HOME,
    PAGE_TYPE_ARCHIVE,
    PAGE_TYPE_CATEGORIES,
    PAGE_TYPE_CATEGORY,
    PAGE_TYPE_TAGS,
    PAGE_TYPE_TAG,
    PAGE_TYPE_PAGE,
    PAGE_TYPE_POST,
    PAGE_TYPE_OTHERS,
    getPageType,
};
