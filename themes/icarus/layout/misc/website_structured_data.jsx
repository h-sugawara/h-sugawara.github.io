const { Component } = require('inferno');
const { encodeURL } = require('hexo-util');

module.exports = class extends Component {
    render() {
        const { name, url } = this.props;

        const data = {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: name,
            url: encodeURL(url),
        };

        return (
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}></script>
        );
    }
};
