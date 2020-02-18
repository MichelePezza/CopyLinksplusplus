//*********************** VARIABLES ***********************//

var action = false;
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
var CBaddsite;
var CBaddlinksite;
var EOL;

const dList = ['vk.com/doc', 'free.fr', 'katfile.com', 'nitroflare.com', '1fichier.com', 'clicknupload.org', 'dailyuploads.net', 'bdupload.in', 'dindishare.in', 'jheberg.net', 'filerio.in', 'go4up.com', 'hil.to', 'letsupload.co', 'mega.nz', 'megaup.net', 'mirrorace.com', 'multiup.org', 'openload.co', 'qfiles.io', 'rapidgator.net', 'sendit.cloud', 'turbo.to', 'tusfiles.com', 'uploadhaven.com', 'uptobox.com', 'userscloud.com', 'filesupload.org', 'zippyshare.com'];

async function inidef() {
    var setting = await browser.storage.local.get({
            // Default Settings
            OPTwhere2copy: 'current',
            OPTwhat2copy: 'all',
            ARRfilterlist: dList,
            CBall: true,
            CBtorrent: true,
            CBlisted: true,
            CBtorrentlisted: false,
            CBcurrent: true,
            CBalltabs: true,
            CBalltabsallwindows: false,
            CBaddsite: true,
            CBaddlinksite: true,
            EOL: '\n'
        });
    var info = await browser.runtime.getPlatformInfo();
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
    browser.storage.local.set({
        OPTwhere2copy: setting.OPTwhere2copy,
        OPTwhat2copy: setting.OPTwhat2copy,
        CBall: setting.CBall,
        CBtorrent: setting.CBtorrent,
        CBlisted: setting.CBlisted,
        CBtorrentlisted: setting.CBtorrentlisted,
        CBcurrent: setting.CBcurrent,
        CBalltabs: setting.CBalltabs,
        CBalltabsallwindows: setting.CBalltabsallwindows,
        CBaddsite: setting.CBaddsite,
        CBaddlinksite: setting.CBaddlinksite,
        ARRfilterlist: setting.ARRfilterlist,
        EOL: platformEol
    }, () => {
        /* console.log('inisaved' + platformEol +'!!!'); */
    });
};

// matche regex

var addNodes = (url, re) => {
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
