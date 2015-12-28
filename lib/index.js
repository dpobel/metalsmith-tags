/**
 * Expose `plugin`.
 */

module.exports = plugin;


/**
 * A metalsmith plugin to create dedicated pages for tags in posts or pages.
 *
 * @return {Function}
 */
function plugin(opts) {
    var tagList = {};

    opts = opts || {};
    opts.path = opts.path || "tags";
    opts.template = opts.template || "partials/tag.hbt";
    opts.layout = opts.layout || "partials/tag.hbt";
    opts.handle = opts.handle || 'tags';
    opts.sortBy = opts.sortBy || 'title';
    opts.reverse = opts.reverse || false;


    return function(files, metalsmith, done){
        var trimTag = function (tag) {
            return tag.trim();
        };
        var safeTag = function (tag) {
            return tag.replace(/ /g, "-");
        };
        var metadata = metalsmith.metadata();

        var sortBy = function (a, b) {
            a = a[opts.sortBy];
            b = b[opts.sortBy];
            if (!a && !b) return 0;
            if (!a) return -1;
            if (!b) return 1;
            if (b > a) return -1;
            if (a > b) return 1;
            return 0;
        };

        metadata.tagsList = {};
        for (var file in files) {
            if (files[file][opts.handle]) {
                files[file][opts.handle] = files[file][opts.handle].split(",").map(trimTag);
            }
            for (var tagIndex in files[file][opts.handle]) {
                var localTag = files[file][opts.handle][tagIndex];

                if (!tagList[localTag]) {
                    tagList[localTag] = [];
                }
                tagList[localTag].push(files[file]);
            }
        }

        for (var tag in tagList) {
            var posts = tagList[tag].sort(sortBy);
            var path = opts.path + '/' + safeTag(tag) + '.md';

            if ( opts.reverse ) {
                posts.reverse();
            }
            files[path] = metadata.tagsList[tag] = {
                template: opts.template,
                layout: opts.layout,
                mode: '0644',
                contents: '',
                tag: tag,
                path: path,
                posts: posts
            };
        }
        done();
    };
}
