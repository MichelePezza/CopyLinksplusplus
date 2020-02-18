//**********************************************************//
//***********************   START   ************************//
//**********************************************************//
var allLinksArray;
//**********************************************************//
//***********************Current tab************************//
//**********************************************************//
var copyAllLinksOnCurrentTab = () => {
    var querying = browser.tabs.query({
            currentWindow: true,
            active: true
        });
    querying.then((tabs) => {
        var tab = tabs[0];
        allLinksArray = [];
        // Getting all links on current tab
        getAllLinksOnTab(tab.id).then(
            copyLinksArrayToClipboard);
    })
};

var getAllLinksOnTab = (tabId) => {
    return new Promise(
        (resolve, reject) => {
        browser.tabs.executeScript(tabId, {
            code: 'getLinksArray();'
        }).then(result => {
            var linksFromTabArray = result[0];
            allLinksArray = allLinksArray.concat(linksFromTabArray);
            resolve();
        }).catch(error => {
            resolve(); // The promise has to resolve even if executeScript is rejected because Promise.all fails if any promise is rejected!
        });
    });
};
//**********************************************************//
//***********************All tabs***************************//
//**********************************************************//
var copyAllLinksOnAllTabs = tabs => {
    // Creating promises array
    var promises = [];
    for (var i = 0; i < tabs.length; i++) {
        promises.push(getAllLinksOnTab(tabs[i].id));
    }
    // Running all the promises at the same time (not in sequential order)
    Promise.all(promises).then(
        copyLinksArrayToClipboard);
};

var copyAllLinksOnAllTabsCurrentWindow = () => {
    allLinksArray = [];
    // Getting all links on current window
    browser.tabs.query({
        currentWindow: true
    }).then(copyAllLinksOnAllTabs);
};

var copyAllLinksOnAllTabsAllWindows = () => {
    allLinksArray = [];
    // Getting all links on all windows
    browser.tabs.query({}).then(copyAllLinksOnAllTabs);
};

var copyAllLink = () => {
    var loadSettings = browser.storage.local.get();
    loadSettings.then((setting) => {
        ARRfilterlist = setting.ARRfilterlist;
        EOL = setting.EOL;
        if (action) {
            OPTwhere2copy = setting.OPTwhere2copy;
            OPTwhat2copy = setting.OPTwhat2copy;
        }
        switch (OPTwhere2copy) {
        case 'current':
            copyAllLinksOnCurrentTab();
            break;
        case 'alltabs':
            copyAllLinksOnAllTabsCurrentWindow();
            break;
        case 'alltabsallwindows':
            copyAllLinksOnAllTabsAllWindows();
            break;
        }
    });
};

//****************************************************//
//********************* WHAT TO COPY *****************//
//****************************************************//


//****************************************************//
//******************** APPLY FILTERS *****************//
//****************************************************//
var applyfilters = (allLinks, what) => {
    var linksToListed = [];

    var filterlistJoined = ARRfilterlist.join('|').replace(/\./g, '\\.').replace(/(\r\n|\n|\r)/gm, '');
    //***** include only listed domain ******/
    var patternBase = '^((?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:\w+\.)?(?:' + filterlistJoined + ')(?::\\d{2,5})?).*';
    //***** include only magnet ******/
    var patternMag = '^magnet:\\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40}&dn=.+&tr=.+$'
        //***** remove javascript: ******/
        var patternAll = '^(?!javascript:.*$).*'
        switch (OPTwhat2copy) {
        case 'all':
            var pattern = patternAll;
            var regex = new RegExp(pattern, 'i');
            break;
        case 'torrent':
            var pattern = patternMag;
            var regex = new RegExp(pattern, 'i');
            break;
        case 'listed':
            var pattern = patternBase;
            var regex = new RegExp(pattern, 'i');
            break;
        case 'torrentlisted':
            var pattern = '(?:' + patternMag + '|' + patternBase + ')';
            var regex = new RegExp(pattern, 'gim');
            break;
        }

        linksToListed = allLinks.filter(linkx => addNodes(linkx, regex));
    return linksToListed;
};

// Concatenate with Platform Eol, apply filters and Copy it to clipboard
var copyLinksArrayToClipboard = () => {
    // Apply filters
    var LinksArray = applyfilters(allLinksArray, OPTwhat2copy);
    // Remove duplicate, sorting of links.
    const items = [...(new Set(LinksArray))].sort();

    var linksText = items.join(EOL);

    var num = items.length;
    var notTitle = browser.i18n.getMessage("notificationTitle") + ' - ' + browser.i18n.getMessage("Numb") + ': ' + num;
    var notMessage = browser.i18n.getMessage(OPTwhere2copy) + '\n' + browser.i18n.getMessage(OPTwhat2copy);

    navigator.clipboard.writeText(linksText).then(copiedNotification(notTitle, notMessage));
};

// Notification
var copiedNotification = (tit, msg) => {
    browser.notifications.create('onCopiedNotification', {
        "type": "list",
        "iconUrl": browser.extension.getURL("img/copylinks.svg"),
        "title": tit,
        "message": msg
    });
    setTimeout(function () {
        browser.notifications.clear('onCopiedNotification');
    }, 3000);
}

// ADD DOMAIN

var add2list = () => {

    var loadSettings = browser.storage.local.get();

    loadSettings.then((setting) => {
        ARRfilterlist = setting.ARRfilterlist;
        let querying = browser.tabs.query({
                currentWindow: true,
                active: true
            });

        querying.then((tabs) => {
            let tab = tabs[0];
            let matches = tab.url.match(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/i);

            let domain = matches && matches[1];

            let newlist = ARRfilterlist.push(domain);

            var patternZ = '[^\s*$]+';
            var regexZ = new RegExp(patternZ, 'g');
            var itemslist = [...(new Set(ARRfilterlist))].sort();
            var filtered = itemslist.filter(linkz => addNodes(linkz, regexZ));

            var notTitle = browser.i18n.getMessage("addsite");
            var notMessage = domain;

            browser.storage.local.set({
                ARRfilterlist: filtered
            }, () => {
                copiedNotification(notTitle, notMessage);
            });
        });
    });
};

var addlink2list = (dlink) => {

    var loadSettings = browser.storage.local.get();
    loadSettings.then((setting) => {
        ARRfilterlist = setting.ARRfilterlist;

        let matches = dlink.match(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/i);

        let domain = matches && matches[1];

        let newlist = ARRfilterlist.push(domain);

        var patternZ = '[^\s*$]+';
        var regexZ = new RegExp(patternZ, 'g');
        var itemslist = [...(new Set(ARRfilterlist))].sort();
        var filtered = itemslist.filter(linkz => addNodes(linkz, regexZ));

        var notTitle = browser.i18n.getMessage("addlinksite");
        var notMessage = domain;

        browser.storage.local.set({
            ARRfilterlist: filtered
        }, () => {
            copiedNotification(notTitle, notMessage);
        });
    });
};

//****************************************************//
//*****Create Contextual Menu & Button Desc***********//
//****************************************************//


var reContextMenu = () => {
    /*console.log("recontext");*/
    browser.contextMenus.removeAll(createItems);
};

var createItems = () => {

    var loadSettings = browser.storage.local.get();

    loadSettings.then((setting) => {
        OPTwhere2copy = setting.OPTwhere2copy;
        OPTwhat2copy = setting.OPTwhat2copy;
        ARRfilterlist = setting.ARRfilterlist;
        CBall = setting.CBall;
        CBtorrent = setting.CBtorrent;
        CBlisted = setting.CBlisted;
        CBtorrentlisted = setting.CBtorrentlisted;
        CBcurrent = setting.CBcurrent;
        CBalltabs = setting.CBalltabs;
        CBalltabsallwindows = setting.CBalltabsallwindows;
        CBaddsite = setting.CBaddsite;
        CBaddlinksite = setting.CBaddlinksite;
        EOL = setting.EOL;

        /* Button Description */
        var buttonName = browser.i18n.getMessage('appButtonDesc') + '\n' + browser.i18n.getMessage(OPTwhere2copy) + '\n' + browser.i18n.getMessage(OPTwhat2copy);
        browser.browserAction.setTitle({
            title: buttonName
        });

        /* Current Tab */
        /* console.log('creation'); */
        if (CBcurrent) {
            if (CBall) {
                var msgName = browser.i18n.getMessage('current') + ' - ' + browser.i18n.getMessage('all');
                browser.contextMenus.create({
                    id: 'clpp-current-all-links',
                    title: msgName,
                    contexts: ['page']
                });
            };
            if (CBtorrent) {
                var msgName = browser.i18n.getMessage('current') + ' - ' + browser.i18n.getMessage('torrent');
                browser.contextMenus.create({
                    id: 'clpp-current-torrent',
                    title: msgName,
                    contexts: ['page']
                });
            };
            if (CBlisted) {
                var msgName = browser.i18n.getMessage('current') + ' - ' + browser.i18n.getMessage('listed');
                browser.contextMenus.create({
                    id: 'clpp-current-listed',
                    title: msgName,
                    contexts: ['page']
                });
            };
            if (CBtorrentlisted) {
                var msgName = browser.i18n.getMessage('current') + ' - ' + browser.i18n.getMessage('torrentlisted');
                browser.contextMenus.create({
                    id: 'clpp-current-torrentlisted',
                    title: msgName,
                    contexts: ['page']
                });
            };
        };
        /* Current Window */
        if (CBalltabs) {
            if (CBall) {
                var msgName = browser.i18n.getMessage('alltabs') + ' - ' + browser.i18n.getMessage('all');
                browser.contextMenus.create({
                    id: 'clpp-alltabs-all-links',
                    title: msgName,
                    contexts: ['page']
                });
            };
            if (CBtorrent) {
                var msgName = browser.i18n.getMessage('alltabs') + ' - ' + browser.i18n.getMessage('torrent');
                browser.contextMenus.create({
                    id: 'clpp-alltabs-torrent',
                    title: msgName,
                    contexts: ['page']
                });
            };
            if (CBlisted) {
                var msgName = browser.i18n.getMessage('alltabs') + ' - ' + browser.i18n.getMessage('listed');
                browser.contextMenus.create({
                    id: 'clpp-alltabs-listed',
                    title: msgName,
                    contexts: ['page']
                });
            };
            if (CBtorrentlisted) {
                var msgName = browser.i18n.getMessage('alltabs') + ' - ' + browser.i18n.getMessage('torrentlisted');
                browser.contextMenus.create({
                    id: 'clpp-alltabs-torrentlisted',
                    title: msgName,
                    contexts: ['page']
                });
            };
        };
        /* All Windows */
        if (CBalltabsallwindows) {
            if (CBall) {
                var msgName = browser.i18n.getMessage('alltabsallwindows') + ' - ' + browser.i18n.getMessage('all');
                browser.contextMenus.create({
                    id: 'clpp-alltabsallwindows-all-links',
                    title: msgName,
                    contexts: ['page']
                });
            };
            if (CBtorrent) {
                var msgName = browser.i18n.getMessage('alltabsallwindows') + ' - ' + browser.i18n.getMessage('torrent');
                browser.contextMenus.create({
                    id: 'clpp-alltabsallwindows-torrent',
                    title: msgName,
                    contexts: ['page']
                });
            };
            if (CBlisted) {
                var msgName = browser.i18n.getMessage('alltabsallwindows') + ' - ' + browser.i18n.getMessage('listed');
                browser.contextMenus.create({
                    id: 'clpp-alltabsallwindows-listed',
                    title: msgName,
                    contexts: ['page']
                });
            };
            if (CBtorrentlisted) {
                var msgName = browser.i18n.getMessage('alltabsallwindows') + ' - ' + browser.i18n.getMessage('torrentlisted');
                browser.contextMenus.create({
                    id: 'clpp-alltabsallwindows-torrentlisted',
                    title: msgName,
                    contexts: ['page']
                });
            };
        };
        /* Add current domain to list */
        if (CBaddsite) {
            var msgName = browser.i18n.getMessage('addsite');
            browser.contextMenus.create({
                id: 'clpp-addsite',
                title: msgName,
                contexts: ['page']
            });
        };
        /* Add link domain to list */
        if (CBaddlinksite) {
            var msgName = browser.i18n.getMessage('addlinksite');
            browser.contextMenus.create({
                id: 'clpp-addlinksite',
                title: msgName,
                contexts: ['link']
            });
        };
        /* Option */
        var msgName = browser.i18n.getMessage('options');
        browser.contextMenus.create({
            id: 'clpp-options',
            title: msgName,
            contexts: ["page_action", "browser_action"]
        });

    });
};

/* Context menu onClicked event listener */
browser.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
    case 'clpp-current-all-links':
        OPTwhere2copy = 'current';
        OPTwhat2copy = 'all';
        action = false;
        copyAllLink();
        break;
    case 'clpp-current-torrent':
        OPTwhere2copy = 'current';
        OPTwhat2copy = 'torrent';
        action = false;
        copyAllLink();
        break;
    case 'clpp-current-listed':
        OPTwhere2copy = 'current';
        OPTwhat2copy = 'listed';
        action = false;
        copyAllLink();
        break;
    case 'clpp-current-torrentlisted':
        OPTwhere2copy = 'current';
        OPTwhat2copy = 'torrentlisted';
        action = false;
        copyAllLink();
        break;
    case 'clpp-alltabs-all-links':
        OPTwhere2copy = 'alltabs';
        OPTwhat2copy = 'all';
        action = false;
        copyAllLink();
        break;
    case 'clpp-alltabs-torrent':
        OPTwhere2copy = 'alltabs';
        OPTwhat2copy = 'torrent';
        action = false;
        copyAllLink();
        break;
    case 'clpp-alltabs-listed':
        OPTwhere2copy = 'alltabs';
        OPTwhat2copy = 'listed';
        action = false;
        copyAllLink();
        break;
    case 'clpp-alltabs-torrentlisted':
        OPTwhere2copy = 'alltabs';
        OPTwhat2copy = 'torrentlisted';
        action = false;
        copyAllLink();
        break;
    case 'clpp-alltabsallwindows-all-links':
        OPTwhere2copy = 'alltabsallwindows';
        OPTwhat2copy = 'all';
        action = false;
        copyAllLink();
        break;
    case 'clpp-alltabsallwindows-torrent':
        OPTwhere2copy = 'alltabsallwindows';
        OPTwhat2copy = 'torrent';
        action = false;
        copyAllLink();
        break;
    case 'clpp-alltabsallwindows-listed':
        OPTwhere2copy = 'alltabsallwindows';
        OPTwhat2copy = 'listed';
        action = false;
        copyAllLink();
        break;
    case 'clpp-alltabsallwindows-torrentlisted':
        OPTwhere2copy = 'alltabsallwindows';
        OPTwhat2copy = 'torrentlisted';
        action = false;
        copyAllLink();
        break;
    case 'clpp-addsite':
        add2list();
        break;
    case 'clpp-addlinksite':
        addlink2list(info.linkUrl);
        break;
    case 'clpp-options':
        browser.runtime.openOptionsPage();
        break;
    }
});

//****************************************************//
//*************** Button Action **********************//
//****************************************************//


var actionStart = () => {
    action = true;
    copyAllLink();
};

var initializeAddon = () => {

    inidef();
    reContextMenu();
    browser.storage.onChanged.addListener(reContextMenu);
    browser.browserAction.onClicked.addListener(actionStart);
    browser.commands.onCommand.addListener(function (command) {
        if (command == "quickAction") {
            actionStart();
        }
    });
};

initializeAddon();
