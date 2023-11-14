'use strict';

module.exports = hexoCfg => {
    const config = {
        class_name: 'link-preview',
        description_length: 140,
        disguise_crawler: true,
    };

    if (hexoCfg.hasOwnProperty('link_preview')) {
        if (hexoCfg.link_preview.hasOwnProperty('class_name') && typeof hexoCfg.link_preview.class_name === 'string') {
            config.class_name = hexoCfg.link_preview.class_name || config.class_name;
        }

        if (hexoCfg.link_preview.hasOwnProperty('description_length') && typeof hexoCfg.link_preview.description_length === 'number') {
            config.description_length = hexoCfg.link_preview.description_length || config.description_length;
        }

        if (hexoCfg.link_preview.hasOwnProperty('disguise_crawler') && typeof hexoCfg.link_preview.disguise_crawler === 'boolean') {
            config.disguise_crawler = hexoCfg.link_preview.disguise_crawler;
        }
    }

    return config;
};
