//**********************************************************//
//***********************   START   ************************//
//**********************************************************//

//***********************Get Links**************************//

var getAllLinksOnTab = async(tabId) => {
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

var getAllLinksOnAllTabs = async(tabs) => {
    // Creating promises array
    var promises = [];
    var patternMoz = '^(?!(about:|moz-extension:)).*';
    var regexMoz = new RegExp(patternMoz, 'u');
    numTabs = 0;

    for (var i = 0; i < tabs.length; i++) {
        console.log("cbpinned");
		console.log(CBexcludepinned);
		console.log("tabpinned");
		console.log(tabs[i].pinned);
		console.log("testpinned");
        console.log(!(CBexcludepinned== true && tabs[i].pinned == true));
        console.log("match");
        console.log(addUrls(tabs[i].url, regexMoz));
        if (addUrls(tabs[i].url, regexMoz)) {
            if (!(CBexcludepinned== true && tabs[i].pinned == true)) {
                console.log("inside pinned");

                console.log("inside match");
                let prom = await getAllLinksOnTab(tabs[i].id);
                promises.push(prom);
                numTabs = numTabs + 1;
            }
        }
    }
    let p = await Promise.all(promises);
};

//***********************Get tab(S)************************//

const getActiveTab = async() => {
    const tab = await browser.tabs.query({
        active: true,
        currentWindow: true
    });
    return tab;
}

const getTabsActiveWindow = async() => {
    const tabs = await browser.tabs.query({
        currentWindow: true
    });
    return tabs;
};

const getTabsAllWindows = async() => {
    const atabs = await browser.tabs.query({});
    return atabs;
};

//****************** Where 2 Copy links ********************//

const copyAllLinks = async(where2, what2) => {
    allLinksArray = [];
    var xtabs = [];
    switch (where2) {
    case 'current':
        xtabs = await getActiveTab();
        break;

    case 'alltabs':
        xtabs = await getTabsActiveWindow();

        break;

    case 'alltabsallwindows':
        xtabs = await getTabsAllWindows();
        break;

    }

    const tabslinks = await getAllLinksOnAllTabs(xtabs);
    copyLinksArrayToClipboard(where2, what2);
    console.log(xtabs);
};

//******************** APPLY FILTERS *****************//

var applyfilters = (allLinks, what2) => {
    var linksToListed = [];

    //***** include only listed domain ******/
    var filterlistJoined = ARRfilterlist.join('|').replace(/\./g, '\\.').replace(/(\r\n|\n|\r)/gm, '');
    var patternBase = '^((?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:\w+\.)?(?:' + filterlistJoined + ')(?:\/.*)?)';

    //***** include only magnet ******/
    var patternMag = '^magnet:(?:.+)?(?:\\?xt=urn:[a-z0-9]+:[a-z0-9]{32,40})(?:.+)?'
        var patternReg = ARRregexlist.join('|').replace(/(\r\n|\n|\r)/gm, '');

    //***** remove javascript: ******/
    var patternAll = '^(?!javascript:.*$).*'
        switch (what2) {
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
        case 'regex':
            var pattern = patternReg;
            var regex = new RegExp(pattern, 'gim');
            break;
        }

        linksToListed = allLinks.filter(linkx => addUrls(linkx, regex));
    return linksToListed;
};

// Concatenate with Platform Eol, apply filters and Copy it to clipboard
var copyLinksArrayToClipboard = (where2, what2) => {
    // Apply filters
    var LinksArray = applyfilters(allLinksArray, what2);
    // Remove duplicate, sorting of links
    var items = LinksArray;

    if (CBdupli) {
        items = [...(new Set(LinksArray))].sort();
    }
    var linksText = items.join(EOL);

    var num = items.length;
    var notiTitle = browser.i18n.getMessage("notificationTitle") + ' - ' + browser.i18n.getMessage("Numb") + ': ' + num + browser.i18n.getMessage("fromTab") + numTabs + browser.i18n.getMessage("tabs");
    var notiMessage = browser.i18n.getMessage(where2) + '\n' + browser.i18n.getMessage(what2);

    navigator.clipboard.writeText(linksText).then(copiedNotification(notiTitle, notiMessage));
};

// Notification
var copiedNotification = (tit, msg) => {

    if (CBnoti) {
        browser.notifications.create('onCopiedNotification', {
            "type": "list",
            "iconUrl": browser.runtime.getURL("img/copylinks.svg"),
            "title": tit,
            "message": msg
        });
        setTimeout(function () {
            browser.notifications.clear('onCopiedNotification');
        }, 3000);
    }
}

// ADD DOMAIN

var add2list = async() => {

    const tab = await getActiveTab() || {};

    let matches = tab.url.match(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/i);

    let domain = m
        s && matches[1];

    let newlist = ARRfilterlist.push(domain);

    var patternZ = '[^\s*$]+';
    var regexZ = new RegExp(patternZ, 'g');
    var itemslist = [...(new Set(ARRfilterlist))].sort();
    var filtered = itemslist.filter(linkz => addUrls(linkz, regexZ));

    var notiTitle = browser.i18n.getMessage("addsite");
    var notiMessage = domain;

    browser.storage.local.set({
        ARRfilterlist: filtered
    }, () => {
        copiedNotification(notiTitle, notiMessage);
    });

};

var addlink2list = async(dlink) => {

    let matches = dlink.match(/^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/\n]+)/i);

    let domain = matches && matches[1];

    let newlist = ARRfilterlist.push(domain);

    var patternZ = '[^\s*$]+';
    var regexZ = new RegExp(patternZ, 'g');
    var itemslist = [...(new Set(ARRfilterlist))].sort();
    var filtered = itemslist.filter(linkz => addUrls(linkz, regexZ));

    var notiTitle = browser.i18n.getMessage("addlinksite");
    var notiMessage = domain;

    browser.storage.local.set({
        ARRfilterlist: filtered
    }, () => {
        copiedNotification(notiTitle, notiMessage);
    });
};

//****************************************************//
//*****Create Conptabs Menu & Button Desc***********//
//****************************************************//


var reContextMenu = async() => {
    let variables = await setVar();
    /*console.log("recontext");*/
    browser.contextMenus.removeAll(createItems);
};

var createItems = async() => {

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
        if (CBregex) {
            var msgName = browser.i18n.getMessage('current') + ' - ' + browser.i18n.getMessage('regex');
            browser.contextMenus.create({
                id: 'clpp-current-regex',
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
        if (CBregex) {
            var msgName = browser.i18n.getMessage('alltabs') + ' - ' + browser.i18n.getMessage('regex');
            browser.contextMenus.create({
                id: 'clpp-alltabs-regex',
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
        if (CBregex) {
            var msgName = browser.i18n.getMessage('alltabsallwindows') + ' - ' + browser.i18n.getMessage('regex');
            browser.contextMenus.create({
                id: 'clpp-alltabsallwindows-regex',
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
        icons: {
            16: "img/copylinks.svg",
            32: "img/copylinks.svg"
        },
        contexts: ["page_action", "browser_action"]
    });

};

/* Context menu onClicked event listener */
browser.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
    case 'clpp-current-all-links':
        copyAllLinks('current', 'all');
        break;
    case 'clpp-current-torrent':
        copyAllLinks('current', 'torrent');
        break;
    case 'clpp-current-listed':
        copyAllLinks('current', 'listed');
        break;
    case 'clpp-current-torrentlisted':
        copyAllLinks('current', 'torrentlisted');
        break;
    case 'clpp-current-regex':
        copyAllLinks('current', 'regex');
        break;
    case 'clpp-alltabs-all-links':
        copyAllLinks('alltabs', 'all');
        break;
    case 'clpp-alltabs-torrent':
        copyAllLinks('alltabs', 'torrent');
        break;
    case 'clpp-alltabs-listed':
        copyAllLinks('alltabs', 'listed');
        break;
    case 'clpp-alltabs-torrentlisted':
        copyAllLinks('alltabs', 'torrentlisted');
        break;
    case 'clpp-alltabs-regex':
        copyAllLinks('alltabs', 'regex');
        break;
    case 'clpp-alltabsallwindows-all-links':
        copyAllLinks('alltabsallwindows', 'all');
        break;
    case 'clpp-alltabsallwindows-torrent':
        copyAllLinks('alltabsallwindows', 'torrent');
        break;
    case 'clpp-alltabsallwindows-listed':
        copyAllLinks('alltabsallwindows', 'listed');
        break;
    case 'clpp-alltabsallwindows-torrentlisted':
        copyAllLinks('alltabsallwindows', 'torrentlisted');
        break;
    case 'clpp-alltabsallwindows-regex':
        copyAllLinks('alltabsallwindows', 'regex');
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
    copyAllLinks(OPTwhere2copy, OPTwhat2copy);
};

var initializeAddon = async() => {

    let init = await inidef();
    let reContext = await reContextMenu();
    browser.storage.onChanged.addListener(reContextMenu);
    browser.browserAction.onClicked.addListener(actionStart);
    browser.commands.onCommand.addListener(function (command) {
        if (command == "quickAction") {
            actionStart();
        }
    });
};

initializeAddon();
