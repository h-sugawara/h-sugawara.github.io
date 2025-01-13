/**
 * Insight search plugin
 * @author PPOffice { @link https://github.com/ppoffice }
 */
// eslint-disable-next-line no-unused-vars
function loadInsight(config, translation) {
    const $main = document.querySelector('.searchbox');
    const $input = $main.querySelector('.searchbox-input');
    const $container = $main.querySelector('.searchbox-body');

    function merge(ranges) {
        let last;
        const result = [];

        ranges.forEach(r => {
            if (!last || r[0] > last[1]) {
                result.push(last = r);
            } else if (r[1] > last[1]) {
                last[1] = r[1];
            }
        });

        return result;
    }

    function findAndHighlight(text, matches, maxlen) {
        if (!Array.isArray(matches) || !matches.length || !text) {
            return maxlen ? text.slice(0, maxlen) : text;
        }
        const testText = text.toLowerCase();
        const indices = matches
            .map(match => {
                const index = testText.indexOf(match.toLowerCase());
                if (!match || index === -1) {
                    return null;
                }
                return [index, index + match.length];
            })
            .filter(match => {
                return match !== null;
            })
            .sort((a, b) => {
                return a[0] - b[0] || a[1] - b[1];
            });

        if (!indices.length) {
            return text;
        }

        let result = '';
        let last = 0;
        const ranges = merge(indices);
        const sumRange = [ranges[0][0], ranges[ranges.length - 1][1]];
        if (maxlen && maxlen < sumRange[1]) {
            last = sumRange[0];
        }

        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            result += text.slice(last, Math.min(range[0], sumRange[0] + maxlen));
            if (maxlen && range[0] >= sumRange[0] + maxlen) {
                break;
            }
            result += '<em>' + text.slice(range[0], range[1]) + '</em>';
            last = range[1];
            if (i === ranges.length - 1) {
                if (maxlen) {
                    result += text.slice(range[1], Math.min(text.length, sumRange[0] + maxlen + 1));
                } else {
                    result += text.slice(range[1]);
                }
            }
        }

        return result;
    }

    function searchItem(icon, title, slug, preview, url) {
        title = title != null && title !== '' ? title : translation.untitled;

        const resultIcon = [];
        switch (icon) {
            case 'file':
                resultIcon.push('<svg xmlns="http://www.w3.org/2000/svg" height="16" width="12" viewBox="0 0 384 512">',
                    '<path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm160-14.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z"/>',
                    '</svg>');
                break;
            case 'folder':
                resultIcon.push('<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512">',
                    '<path d="M464 128H272l-64-64H48C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V176c0-26.5-21.5-48-48-48z" />',
                    '</svg>');
                break;
            case 'tag':
                resultIcon.push('<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 512 512">',
                    '<path d="M0 252.1V48C0 21.5 21.5 0 48 0h204.1a48 48 0 0 1 33.9 14.1l211.9 211.9c18.7 18.7 18.7 49.1 0 67.9L293.8 497.9c-18.7 18.7-49.1 18.7-67.9 0L14.1 286.1A48 48 0 0 1 0 252.1zM112 64c-26.5 0-48 21.5-48 48s21.5 48 48 48 48-21.5 48-48-21.5-48-48-48z"/>',
                    '</svg>');
                break;
        }

        const resultItem = [
            `<a class="searchbox-result-item" href="${url}">`,
            `${resultIcon.length > 0 ? '<span class="searchbox-result-icon">' + resultIcon.join('') + '</span>' : ''}`,
            '<span class="searchbox-result-content">',
            `<span class="searchbox-result-title">${title}</span>`,
            `${preview ? '<span class="searchbox-result-preview">' + preview + '</span>' : ''}`,
            '</span>',
            '</a>',
        ];
        return resultItem.join('');
    }

    function getSearchItems(keywords, type, array) {
        if (array.length === 0) {
            return null;
        }
        switch (type) {
            case 'POSTS':
            case 'PAGES':
                return array.map(item => {
                    const title = findAndHighlight(item.title, keywords);
                    const text = findAndHighlight(item.text, keywords, 100);
                    return searchItem('file', title, null, text, item.link);
                });
            case 'CATEGORIES':
            case 'TAGS':
                return array.map(item => {
                    const name = findAndHighlight(item.name, keywords);
                    const slug = findAndHighlight(item.slug, keywords);
                    return searchItem(type === 'CATEGORIES' ? 'folder' : 'tag', name, slug, null, item.link);
                });
        }
        return null;
    }

    function parseKeywords(keywords) {
        return keywords.split(' ').filter(keyword => {
            return !!keyword;
        }).map(keyword => {
            return keyword.toLowerCase();
        });
    }

    /**
     * Judge if a given post/page/category/tag contains all of the keywords.
     * @param Object            obj     Object to be weighted
     * @param Array<String>     fields  Object's fields to find matches
     */
    function filter(keywords, obj, fields) {
        const keywordArray = parseKeywords(keywords);
        const containKeywords = keywordArray.filter(keyword => {
            const containFields = fields.filter(field => {
                if (!Object.prototype.hasOwnProperty.call(obj, field)) {
                    return false;
                }
                if (obj[field].toLowerCase().indexOf(keyword) > -1) {
                    return true;
                }
                return false;
            });
            if (containFields.length > 0) {
                return true;
            }
            return false;
        });
        return containKeywords.length === keywordArray.length;
    }

    function filterFactory(keywords) {
        return {
            post: function(obj) {
                return filter(keywords, obj, ['title', 'text']);
            },
            page: function(obj) {
                return filter(keywords, obj, ['title', 'text']);
            },
            category: function(obj) {
                return filter(keywords, obj, ['name', 'slug']);
            },
            tag: function(obj) {
                return filter(keywords, obj, ['name', 'slug']);
            },
        };
    }

    /**
     * Calculate the weight of a matched post/page/category/tag.
     * @param Object            obj     Object to be weighted
     * @param Array<String>     fields  Object's fields to find matches
     * @param Array<Integer>    weights Weight of every field
     */
    function weight(keywords, obj, fields, weights) {
        let value = 0;
        parseKeywords(keywords).forEach(keyword => {
            const pattern = new RegExp(keyword, 'img'); // Global, Multi-line, Case-insensitive
            fields.forEach((field, index) => {
                if (Object.prototype.hasOwnProperty.call(obj, field)) {
                    const matches = obj[field].match(pattern);
                    value += matches ? matches.length * weights[index] : 0;
                }
            });
        });
        return value;
    }

    function weightFactory(keywords) {
        return {
            post: function(obj) {
                return weight(keywords, obj, ['title', 'text'], [3, 1]);
            },
            page: function(obj) {
                return weight(keywords, obj, ['title', 'text'], [3, 1]);
            },
            category: function(obj) {
                return weight(keywords, obj, ['name', 'slug'], [1, 1]);
            },
            tag: function(obj) {
                return weight(keywords, obj, ['name', 'slug'], [1, 1]);
            },
        };
    }

    function search(json, keywords) {
        const weights = weightFactory(keywords);
        const filters = filterFactory(keywords);
        const posts = json.posts;
        const pages = json.pages;
        const tags = json.tags;
        const categories = json.categories;
        return {
            posts: posts.filter(filters.post).sort((a, b) => {
                return weights.post(b) - weights.post(a);
            }).slice(0, 5),
            pages: pages.filter(filters.page).sort((a, b) => {
                return weights.page(b) - weights.page(a);
            }).slice(0, 5),
            categories: categories.filter(filters.category).sort((a, b) => {
                return weights.category(b) - weights.category(a);
            }).slice(0, 5),
            tags: tags.filter(filters.tag).sort((a, b) => {
                return weights.tag(b) - weights.tag(a);
            }).slice(0, 5),
        };
    }

    function searchResultToDOM(keywords, searchResult) {
        $container.innerHTML = '';
        const parsedKeywords = parseKeywords(keywords);
        for (const key in searchResult) {
            const type = key.toUpperCase();
            const $searchItems = getSearchItems(parsedKeywords, type, searchResult[key]);

            if ($searchItems == null) {
                continue;
            }
            const $section = document.createElement('section');
            $section.classList.add('searchbox-result-section');
            $section.innerHTML = `<header>${translation[type.toLowerCase()]}</header>${$searchItems.join('')}`;
            $container.appendChild($section);
        }
    }

    function selectItemByDiff(value) {
        const $items = $container.querySelectorAll('.searchbox-result-item');
        let prevPosition = -1;
        $items.forEach(($item, index) => {
            if ($item.classList.contains('active')) {
                prevPosition = index;
            }
        });
        if (prevPosition > -1) {
            $items.item(prevPosition).classList.remove('active');
        }
        const nextPosition = ($items.length + prevPosition + value) % $items.length;
        $items.item(nextPosition).classList.add('active');
        $items.item(nextPosition).scrollIntoView(false);
    }

    const getJson = new XMLHttpRequest();
    getJson.onreadystatechange = () => {
        if (getJson.readyState !== 4 || getJson.status !== 200) {
            return;
        }
        if (location.hash.trim() === '#insight-search') {
            $main.classList.add('show');
        }
        const data = JSON.parse(getJson.responseText);
        $input.addEventListener('input', event => {
            const keywords = event.target.value;
            searchResultToDOM(keywords, search(data, keywords));
        });
        $input.dispatchEvent(new InputEvent('input'));
    };
    getJson.open('GET', config.contentUrl, true);
    getJson.send(null);

    let touch = false;

    document.querySelector('.navbar-main .search').addEventListener('click', () => {
        $main.classList.add('show');
        $main.querySelector('.searchbox-input').focus();
    });
    document.querySelectorAll('.searchbox-result-item').forEach($item => {
        const gotoAction = $item => {
            location.href = $item.getAttribute('href');
        };
        $item.addEventListener('click', () => {
            gotoAction($item);
            touch = false;
        });
        $item.addEventListener('touchend', () => {
            if (!touch) {
                return;
            }
            gotoAction($item);
            touch = false;
        });
    });
    document.querySelectorAll('.searchbox-close').forEach($close => {
        const $navbarMain = document.querySelectorAll('.navbar-main');
        const closeAction = () => {
            $navbarMain.forEach($element => {
                $element.style.pointerEvents = 'none';
                setTimeout(() => {
                    $element.style.pointerEvents = 'auto';
                }, 400);
            });
            $main.classList.remove('show');
            touch = false;
        };
        $close.addEventListener('click', () => {
            closeAction();
        });
        $close.addEventListener('touchend', () => {
            if (!touch) {
                return;
            }
            closeAction();
        });
    });
    document.addEventListener('keydown', event => {
        if (!$main.classList.contains('show')) {
            return;
        }
        switch (event.code) {
            case 'Escape':
                $main.classList.remove('show');
                break;
            case 'ArrowUp':
                selectItemByDiff(-1);
                break;
            case 'ArrowDown':
                selectItemByDiff(1);
                break;
            case 'Enter':
                $container.querySelectorAll('.searchbox-result-item.active').forEach($activated => {
                    location.href = $activated.getAttribute('href');
                });
                break;
        }
    });
    document.addEventListener('touchstart', () => {
        touch = true;
    });
    document.addEventListener('touchmove', () => {
        touch = false;
    });
}
