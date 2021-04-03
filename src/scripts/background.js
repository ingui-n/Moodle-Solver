!function () {
    "use strict";

    chrome.tabs.onActivated.addListener(tab => {
        chrome.tabs.get(tab.tabId, currentTabInfo => {
            CallBackgroundScript(currentTabInfo, tab.tabId, currentTabInfo.url);
        });
    })

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === 'loading')
            CallBackgroundScript(tab, tabId, tab.url);
    });

    /** Calls the BackgroundContent script */
    function CallBackgroundScript(tab, id, url) {
        if (TestUrl(url)) {
            chrome.tabs.executeScript(null, {file: '/src/scripts/BackgroundContent.js'}, () => {

                let message = {
                    'tabName': `${tab.windowId}-${tab.id}`,
                    'tabUrl': url
                }
                chrome.tabs.sendMessage(id, message);
            });
        }
    }

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
