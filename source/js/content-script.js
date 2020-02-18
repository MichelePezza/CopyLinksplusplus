//*********************** CONTENT SCRIPT **********************//

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
