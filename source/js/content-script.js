// This function must be called in a visible page, such as a browserAction popup
// or a content script. Calling it in a background page has no effect!
// Source: https://github.com/mdn/webextensions-examples/tree/master/context-menu-copy-link-with-types

var anchorsArrayToTextArray = anchors => {
    var links = [];

    for (var i = 0; i < anchors.length; i++) {
        var anchor = anchors[i];
        if (anchor.href !== undefined && anchor.href !== '') links.push(anchor.href);
    }

    return links;
};

var getLinksArray = () => {
    var anchors = document.getElementsByTagName('a');
    var linksArray = anchorsArrayToTextArray(anchors);
    return linksArray;
};
