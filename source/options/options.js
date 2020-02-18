// Run when page loads
window.onload = () => {

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
    document.getElementById('CBaddsite').onchange = () => {
        saveSettings();
    };
    document.getElementById('CBaddlinksite').onchange = () => {
        saveSettings();
    };
    document.getElementById('TXTfilterlist').onchange = () => {
        saveSettings();
    };
    browser.storage.onChanged.addListener(updateUI);
    // Localization
    localization();
}
// Load Settings
var updateUI = () => {
    var loadSettings = browser.storage.local.get();

    loadSettings.then((setting) => {
        // Eol
        var EOL = setting.EOL;

        // Update  GUI
        document.getElementById('OPTwhere2copy').value = setting.OPTwhere2copy;
        document.getElementById('OPTwhat2copy').value = setting.OPTwhat2copy;
        document.getElementById('CBall').checked = setting.CBall;
        document.getElementById('CBtorrent').checked = setting.CBtorrent;
        document.getElementById('CBlisted').checked = setting.CBlisted;
        document.getElementById('CBtorrentlisted').checked = setting.CBtorrentlisted;
        document.getElementById('CBcurrent').checked = setting.CBcurrent;
        document.getElementById('CBalltabs').checked = setting.CBalltabs;
        document.getElementById('CBalltabsallwindows').checked = setting.CBalltabsallwindows;
        document.getElementById('CBaddsite').checked = setting.CBaddsite;
		document.getElementById('CBaddlinksite').checked = setting.CBaddlinksite;
        document.getElementById('TXTfilterlist').value = setting.ARRfilterlist.join(EOL);
    });
};
// Save Settings
var saveSettings = () => {
    /* console.log("saving");*/
    var list = document.getElementById('TXTfilterlist').value.replace(/\r\n/g, '\n').split('\n');
	
	var patternZ = '[^\s*$]+';
	var regexZ = new RegExp(patternZ, 'g');
	var itemslist = [...(new Set(list))].sort();
    var filtered = itemslist.filter(linkz => addNodes(linkz, regexZ));

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
        CBaddsite: document.getElementById('CBaddsite').checked,
		CBaddlinksite: document.getElementById('CBaddlinksite').checked,
        ARRfilterlist: filtered
    }, () => {
        /*console.log('saved');*/
    });
};
