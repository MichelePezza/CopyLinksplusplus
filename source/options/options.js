// Run when page loads
window.onload = () => {

    // Eol
    getPlatformEol();
    // Settings
    updateUI();
    // Update Settings
    document.getElementById('OPTwhere2copy').onchange = () => {
        saveSettings();
    };
    document.getElementById('OPTwhat2copy').onchange = () => {
        saveSettings();
    };
    document.getElementById('CBall').onchange = () => {
        saveSettings();
    };
    document.getElementById('CBtorrent').onchange = () => {
        saveSettings();
    };
    document.getElementById('CBlisted').onchange = () => {
        saveSettings();
    };
    document.getElementById('CBtorrentlisted').onchange = () => {
        saveSettings();
    };
    document.getElementById('CBcurrent').onchange = () => {
        saveSettings();
    };
    document.getElementById('CBalltabs').onchange = () => {
        saveSettings();
    };
    document.getElementById('CBalltabsallwindows').onchange = () => {
        saveSettings();
    };
    document.getElementById('TXTfilterlist').onchange = () => {
        saveSettings();
    };

    // Localization
    localization();
}
// Load Settings
var updateUI = () => {
    // Default List
    const dList = ['vk.com/doc', 'free.fr', 'katfile.com', 'nitroflare.com', '1fichier.com', 'clicknupload.org', 'dailyuploads.net', 'bdupload.in', 'dindishare.in', 'jheberg.net', 'filerio.in', 'go4up.com', 'hil.to', 'letsupload.co', 'mega.nz', 'megaup.net', 'mirrorace.com', 'multiup.org', 'openload.co', 'qfiles.io', 'rapidgator.net', 'sendit.cloud', 'turbo.to', 'tusfiles.com', 'uploadhaven.com', 'uptobox.com', 'userscloud.com', 'filesupload.org', 'zippyshare.com'];
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
        (data) => {
        // Update  GUI
        document.getElementById('OPTwhere2copy').value = data.OPTwhere2copy;
        document.getElementById('OPTwhat2copy').value = data.OPTwhat2copy;
        document.getElementById('CBall').checked = data.CBall;
        document.getElementById('CBtorrent').checked = data.CBtorrent;
        document.getElementById('CBlisted').checked = data.CBlisted;
        document.getElementById('CBtorrentlisted').checked = data.CBtorrentlisted;
        document.getElementById('CBcurrent').checked = data.CBcurrent;
        document.getElementById('CBalltabs').checked = data.CBalltabs;
        document.getElementById('CBalltabsallwindows').checked = data.CBalltabsallwindows;

        document.getElementById('TXTfilterlist').value = data.ARRfilterlist.join(platformEol);
    })
};

// Save Settings
var saveSettings = () => {

    var list = document.getElementById('TXTfilterlist').value.replace(/\r\n/g, '\n').split('\n');
    browser.storage.local.set({
        OPTwhere2copy: document.getElementById('OPTwhere2copy').value,
        OPTwhat2copy: document.getElementById('OPTwhat2copy').value,
        CBall: document.getElementById('CBall').checked,
        CBtorrent: document.getElementById('CBtorrent').checked,
        CBlisted: document.getElementById('CBlisted').checked,
        CBtorrentlisted: document.getElementById('CBtorrentlisted').checked,
        CBcurrent: document.getElementById('CBcurrent').checked,
        CBalltabs: document.getElementById('CBalltabs').checked,
        CBalltabsallwindows: document.getElementById('CBalltabsallwindows').checked,
        ARRfilterlist: list
    },() => {
        //console.log('saved');
    });
};

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

// Localization
var localization = () => {
    document.querySelectorAll('[data-i18n]')
    .forEach((node) => {
        node.textContent = browser.i18n.getMessage(node.dataset.i18n);
    });
}
