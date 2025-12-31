const url = require('node:url');

function parse_url(req){
    const parsed_url = url.parse(req.url, true);
    const pathname = parsed_url.pathname;
    const id = pathname.split('/')[2];
    return {pathname, id};
}

module.exports = parse_url;