//*********************** VARIABLES ***********************//

var allLinksArray = [];
var bbtt;

var url = '';
var re;

var numTabs = 0;
var where2copy;
var what2copy;

///**** SETTING VARIABLES *****///
var OPTwhere2copy;
var OPTwhat2copy;
var ARRfilterlist;
var ARRregexlist;
var CBall;
var CBtorrent;
var CBlisted;
var CBtorrentlisted;
var CBregex;
var CBcurrent;
var CBalltabs;
var CBalltabsallwindows;
var CBaddsite;
var CBaddlinksite;
var CBexcludepinned;
var CBdupli;
var CBnoti;
var EOL;
///**** END SETTINGS*****///

const dList = ['vk.com/doc', 'free.fr', 'katfile.com', 'nitroflare.com', '1fichier.com', 'clicknupload.org', 'dailyuploads.net', 'bdupload.in', 'dindishare.in', 'jheberg.net', 'filerio.in', 'go4up.com', 'hil.to', 'letsupload.co', 'mega.nz', 'megaup.net', 'mirrorace.com', 'multiup.org', 'openload.co', 'qfiles.io', 'rapidgator.net', 'sendit.cloud', 'turbo.to', 'tusfiles.com', 'uploadhaven.com', 'uptobox.com', 'userscloud.com', 'filesupload.org', 'zippyshare.com'];
const rList = ["^(http|https)\\:\\/\\/[a-zA-Z0-9\\-\\.]+\\.(it)(\\/\\S*)?/"];

const getSetting = async() => {
    const dsetting = await browser.storage.local.get({
        // Default Settings
        OPTwhere2copy: 'current',
        OPTwhat2copy: 'all',
        ARRfilterlist: dList,
        ARRregexlist: rList,
        CBall: true,
        CBtorrent: true,
        CBlisted: true,
        CBtorrentlisted: false,
        CBregex: false,
        CBcurrent: true,
        CBalltabs: true,
        CBalltabsallwindows: false,
        CBaddsite: true,
        CBaddlinksite: true,
        CBdupli: true,
        CBexcludepinned: true,
        CBnoti: true,
        EOL: '\n'
    });
    return dsetting;
}

const setVar = async() => {
    const setting = await getSetting();
    OPTwhere2copy = setting.OPTwhere2copy;
    OPTwhat2copy = setting.OPTwhat2copy;
    ARRfilterlist = setting.ARRfilterlist;
    ARRregexlist = setting.ARRregexlist;
    CBall = setting.CBall;
    CBtorrent = setting.CBtorrent;
    CBlisted = setting.CBlisted;
    CBtorrentlisted = setting.CBtorrentlisted;
    CBregex = setting.CBregex;
    CBcurrent = setting.CBcurrent;
    CBalltabs = setting.CBalltabs;
    CBalltabsallwindows = setting.CBalltabsallwindows;
    CBaddsite = setting.CBaddsite;
    CBaddlinksite = setting.CBaddlinksite;
    CBdupli = setting.CBdupli;
    CBexcludepinned = setting.CBexcludepinned;
    CBnoti = setting.CBnoti;
    EOL = setting.EOL;
}

const getEol = async() => {
    const info = await browser.runtime.getPlatformInfo();
    var os = info.os;
    var platformEol;
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
    return platformEol;
}

const inidef = async() => {
    const setting = await getSetting();
    const myVar = await setVar();
    const osEol = await getEol();
    browser.storage.local.set({
        OPTwhere2copy: setting.OPTwhere2copy,
        OPTwhat2copy: setting.OPTwhat2copy,
        CBall: setting.CBall,
        CBtorrent: setting.CBtorrent,
        CBlisted: setting.CBlisted,
        CBtorrentlisted: setting.CBtorrentlisted,
        CBregex: setting.CBregex,
        CBcurrent: setting.CBcurrent,
        CBalltabs: setting.CBalltabs,
        CBalltabsallwindows: setting.CBalltabsallwindows,
        CBaddsite: setting.CBaddsite,
        CBaddlinksite: setting.CBaddlinksite,
        CBexcludepinned: setting.CBexcludepinned,
        CBdupli: setting.CBdupli,
        CBnoti: setting.CBnoti,
        ARRfilterlist: setting.ARRfilterlist,
        ARRregexlist: setting.ARRregexlist,
        EOL: osEol
    }, () => {
        /* console.log('inisaved' + platformEol +'!!!'); */
    });
};

// match regex

var addUrls = (url, re) => {
    if (!url.match(re))
        return false;
    return true;
};

// Localization
var localization = () => {
    document.querySelectorAll('[data-i18n]')
    .forEach((node) => {
        node.textContent = browser.i18n.getMessage(node.dataset.i18n);
    });
}
