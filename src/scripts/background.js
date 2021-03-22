!function () {
    "use strict";

    //todo add new listener on change window
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'loading' && TestUrl(tab.url)) {
            chrome.tabs.executeScript(null, {file: '/src/scripts/BackgroundContent.js'});
        }
    });

    /** Check URL if is MOODLE */
    function TestUrl(url) {
        const match = url.match(/^https?:\/\/www\.([\w-]+)?\.?([\w-]+)?\.?([\w-]+)?\.?\.\w+\//);

        if (match) {
            for (let i = 1; i < 4; i++) {
                if (typeof match[i] !== 'undefined' && match[i] === 'moodle') {
                    return true;
                }
            }
        }
        return false;
    }
}();
