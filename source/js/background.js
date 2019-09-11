//*********************** VARIABLES ***********************//

var OPTwhere2copy;
var OPTwhat2copy;
var ARRfilterlist;
var CBall;
var CBtorrent;
var CBlisted;
var CBtorrentlisted;
var CBcurrent;
var CBalltabs;
var CBalltabsallwindows;
const dList = ['vk.com/doc', 'free.fr', 'katfile.com', 'nitroflare.com', '1fichier.com', 'clicknupload.org', 'dailyuploads.net', 'bdupload.in', 'dindishare.in', 'jheberg.net', 'filerio.in', 'go4up.com', 'hil.to', 'letsupload.co', 'mega.nz', 'megaup.net', 'mirrorace.com', 'multiup.org', 'openload.co', 'qfiles.io', 'rapidgator.net', 'sendit.cloud', 'turbo.to', 'tusfiles.com', 'uploadhaven.com', 'uptobox.com', 'userscloud.com', 'filesupload.org', 'zippyshare.com'];

//**********************************************************//
//********************WHERE TO COPY LINKS*******************//
//**********************************************************//

var allLinksArray;

//***********************Current tab***********************//

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

//***********************All tabs***************************//
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
};

//****************************************************//
//********************* WHAT TO COPY *****************//
//****************************************************//

// Get Platform Eol


var platformEol;
var getPlatformEol = () => {
    var os;
    var gotPlatformInfo = info => {
        os = info.os;
        switch (os) {
        case 'mac':
            platformEol = '\r';
            break;
        case 'win':
            platformEol = '\r\n';
            break;
        case 'android':
        case 'cros':
        case 'linux':
        case 'openbsd':
            platformEol = '\n';
            break;
        };
    };

    var gettingInfo = browser.runtime.getPlatformInfo();
    gettingInfo.then(gotPlatformInfo);
};

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

        linksToListed = allLinks.filter(link => addNodes(link, regex));
    return linksToListed;
};

var addNodes = (url, re) => {
    if (!url.match(re))
        return false;
    return true;
};

// Concatenate with Platform Eol, apply filters and Copy it to clipboard
var copyLinksArrayToClipboard = () => {
    // Apply filters
    var LinksArray = applyfilters(allLinksArray, OPTwhat2copy);
    // Remove duplicate, sorting of links.
    const items = [...(new Set(LinksArray))].sort();

    var linksText = items.join(platformEol);

    var num = items.length;
    var notTitle = browser.i18n.getMessage("notificationTitle") + ' - ' + browser.i18n.getMessage("Numb") + ': ' + num;
    var notMessage = browser.i18n.getMessage(OPTwhere2copy) + '\n' + browser.i18n.getMessage(OPTwhat2copy)

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

//****************************************************//
//*****Create Contextual Menu & Button Desc***********//
//****************************************************//


var reContextMenu = () => {
    browser.contextMenus.removeAll();
    createContextMenuItems();
};

var createContextMenuItems = () => {
    browser.storage.local.get({
        // Default Settings
        ARRfilterlist: dList,
        OPTwhere2copy: 'current',
        OPTwhat2copy: 'all',
        CBall: true,
        CBtorrent: true,
        CBlisted: true,
        CBtorrentlisted: false,
        CBcurrent: true,
        CBalltabs: true,
        CBalltabsallwindows: false
    },
        function (data) {
        OPTwhere2copy = data.OPTwhere2copy;
        OPTwhat2copy = data.OPTwhat2copy;
        ARRfilterlist = [];
        ARRfilterlist = data.ARRfilterlist;
        CBall = data.CBall;
        CBtorrent = data.CBtorrent;
        CBlisted = data.CBlisted;
        CBtorrentlisted = data.CBtorrentlisted;
        CBcurrent = data.CBcurrent;
        CBalltabs = data.CBalltabs;
        CBalltabsallwindows = data.CBalltabsallwindows;
        /* Button Description */

        var buttonName = browser.i18n.getMessage('appButtonDesc') + '\n' + browser.i18n.getMessage(OPTwhere2copy) + '\n' + browser.i18n.getMessage(OPTwhat2copy);
        browser.browserAction.setTitle({
            title: buttonName
        });

        var NoTab = (!CBcurrent && !CBalltabs && !CBalltabsallwindows);
        var NoLink = (!CBall && !CBtorrent && !CBlisted && !CBtorrentlisted);
        var MenuCreate = (!(NoLink || NoTab));
        if (MenuCreate) {
            /* Parent */
            browser.contextMenus.create({
                id: 'clpp-copy-all-links',
                title: browser.i18n.getMessage('appName'),
                contexts: ['all'],
            });
            /* Current Tab */
            if (CBcurrent) {
                if (CBall) {
                    var msgName = browser.i18n.getMessage('current') + ' - ' + browser.i18n.getMessage('all');
                    browser.contextMenus.create({
                        id: 'clpp-current-all-links',
                        parentId: 'clpp-copy-all-links',
                        title: msgName,
                        contexts: ['all']
                    });
                };
                if (CBtorrent) {
                    var msgName = browser.i18n.getMessage('current') + ' - ' + browser.i18n.getMessage('torrent');
                    browser.contextMenus.create({
                        id: 'clpp-current-torrent',
                        parentId: 'clpp-copy-all-links',
                        title: msgName,
                        contexts: ['all']
                    });
                };
                if (CBlisted) {
                    var msgName = browser.i18n.getMessage('current') + ' - ' + browser.i18n.getMessage('listed');
                    browser.contextMenus.create({
                        id: 'clpp-current-listed',
                        parentId: 'clpp-copy-all-links',
                        title: msgName,
                        contexts: ['all']
                    });
                };
                if (CBtorrentlisted) {
                    var msgName = browser.i18n.getMessage('current') + ' - ' + browser.i18n.getMessage('torrentlisted');
                    browser.contextMenus.create({
                        id: 'clpp-current-torrentlisted',
                        parentId: 'clpp-copy-all-links',
                        title: msgName,
                        contexts: ['all']
                    });
                };
            };
            /* Current Window */
            if (CBalltabs) {

                if (CBall) {
                    var msgName = browser.i18n.getMessage('alltabs') + ' - ' + browser.i18n.getMessage('all');
                    browser.contextMenus.create({
                        id: 'clpp-alltabs-all-links',
                        parentId: 'clpp-copy-all-links',
                        title: msgName,
                        contexts: ['all']
                    });
                };
                if (CBtorrent) {
                    var msgName = browser.i18n.getMessage('alltabs') + ' - ' + browser.i18n.getMessage('torrent');
                    browser.contextMenus.create({
                        id: 'clpp-alltabs-torrent',
                        parentId: 'clpp-copy-all-links',
                        title: msgName,
                        contexts: ['all']
                    });
                };
                if (CBlisted) {
                    var msgName = browser.i18n.getMessage('alltabs') + ' - ' + browser.i18n.getMessage('listed');
                    browser.contextMenus.create({
                        id: 'clpp-alltabs-listed',
                        parentId: 'clpp-copy-all-links',
                        title: msgName,
                        contexts: ['all']
                    });
                };
                if (CBtorrentlisted) {
                    var msgName = browser.i18n.getMessage('alltabs') + ' - ' + browser.i18n.getMessage('torrentlisted');
                    browser.contextMenus.create({
                        id: 'clpp-alltabs-torrentlisted',
                        parentId: 'clpp-copy-all-links',
                        title: msgName,
                        contexts: ['all']
                    });
                };
            };

            /* All Windows */
            if (CBalltabsallwindows) {

                if (CBall) {
                    var msgName = browser.i18n.getMessage('alltabsallwindows') + ' - ' + browser.i18n.getMessage('all');
                    browser.contextMenus.create({
                        id: 'clpp-alltabsallwindows-all-links',
                        parentId: 'clpp-copy-all-links',
                        title: msgName,
                        contexts: ['all']
                    });
                };
                if (CBtorrent) {
                    var msgName = browser.i18n.getMessage('alltabsallwindows') + ' - ' + browser.i18n.getMessage('torrent');
                    browser.contextMenus.create({
                        id: 'clpp-alltabsallwindows-torrent',
                        parentId: 'clpp-copy-all-links',
                        title: msgName,
                        contexts: ['all']
                    });
                };
                if (CBlisted) {
                    var msgName = browser.i18n.getMessage('alltabsallwindows') + ' - ' + browser.i18n.getMessage('listed');
                    browser.contextMenus.create({
                        id: 'clpp-alltabsallwindows-listed',
                        parentId: 'clpp-copy-all-links',
                        title: msgName,
                        contexts: ['all']
                    });
                };
                if (CBtorrentlisted) {
                    var msgName = browser.i18n.getMessage('alltabsallwindows') + ' - ' + browser.i18n.getMessage('torrentlisted');
                    browser.contextMenus.create({
                        id: 'clpp-alltabsallwindows-torrentlisted',
                        parentId: 'clpp-copy-all-links',
                        title: msgName,
                        contexts: ['all']
                    });
                };
            };
        };
    });

};

/* Context menu onClicked event listener */
browser.contextMenus.onClicked.addListener((info) => {
    switch (info.menuItemId) {
    case 'clpp-current-all-links':
        OPTwhere2copy = 'current';
        OPTwhat2copy = 'all';
        copyAllLink();
        break;
    case 'clpp-current-torrent':
        OPTwhere2copy = 'current';
        OPTwhat2copy = 'torrent';
        copyAllLink();
        break;
    case 'clpp-current-listed':
        OPTwhere2copy = 'current';
        OPTwhat2copy = 'listed';
        copyAllLink();
        break;
    case 'clpp-current-torrentlisted':
        OPTwhere2copy = 'current';
        OPTwhat2copy = 'torrentlisted';
        copyAllLink();
        break;
    case 'clpp-alltabs-all-links':
        OPTwhere2copy = 'alltabs';
        OPTwhat2copy = 'all';
        copyAllLink();
        break;
    case 'clpp-alltabs-torrent':
        OPTwhere2copy = 'alltabs';
        OPTwhat2copy = 'torrent';
        copyAllLink();
        break;
    case 'clpp-alltabs-listed':
        OPTwhere2copy = 'alltabs';
        OPTwhat2copy = 'listed';
        copyAllLink();
        break;
    case 'clpp-alltabs-torrentlisted':
        OPTwhere2copy = 'alltabs';
        OPTwhat2copy = 'torrentlisted';
        copyAllLink();
        break;
    case 'clpp-alltabsallwindows-all-links':
        OPTwhere2copy = 'alltabsallwindows';
        OPTwhat2copy = 'all';
        copyAllLink();
        break;
    case 'clpp-alltabsallwindows-torrent':
        OPTwhere2copy = 'alltabsallwindows';
        OPTwhat2copy = 'torrent';
        copyAllLink();
        break;
    case 'clpp-alltabsallwindows-listed':
        OPTwhere2copy = 'alltabsallwindows';
        OPTwhat2copy = 'listed';
        copyAllLink();
        break;
    case 'clpp-alltabsallwindows-torrentlisted':
        OPTwhere2copy = 'alltabsallwindows';
        OPTwhat2copy = 'torrentlisted';
        copyAllLink();
        break;

    }
});

//****************************************************//
//*************** Button Action **********************//
//****************************************************//


var actionStart = () => {
    browser.storage.local.get({
        // Default Settings
        ARRfilterlist: dList,
        OPTwhere2copy: 'current',
        OPTwhat2copy: 'all',
        CBall: true,
        CBtorrent: true,
        CBlisted: true,
        CBtorrentlisted: false,
        CBcurrent: true,
        CBalltabs: true,
        CBalltabsallwindows: false
    },
        function (data) {
        OPTwhere2copy = data.OPTwhere2copy;
        OPTwhat2copy = data.OPTwhat2copy;
        ARRfilterlist = [];
        ARRfilterlist = data.ARRfilterlist;
        CBall = data.CBall;
        CBtorrent = data.CBtorrent;
        CBlisted = data.CBlisted;
        CBtorrentlisted = data.CBtorrentlisted;
        CBcurrent = data.CBcurrent;
        CBalltabs = data.CBalltabs;
        CBalltabsallwindows = data.CBalltabsallwindows;
        copyAllLink();
    });
};


var initializeAddon = () => {
    getPlatformEol();
    reContextMenu();
    browser.storage.onChanged.addListener(reContextMenu);
	browser.browserAction.onClicked.addListener(actionStart);
    browser.commands.onCommand.addListener(function (command) {
        if (command == "quickAction") {
			console.log("ciao");
            actionStart();
        }
    });
};

initializeAddon();
