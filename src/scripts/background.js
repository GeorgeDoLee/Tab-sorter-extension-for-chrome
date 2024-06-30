const sortTabs = () => {
    chrome.storage.local.get(['preferredOrder'], (result) => {
        const preferredOrder = result.preferredOrder || {};

        chrome.tabs.query({}, (tabs) => {
            tabs.sort((a, b) => {
                const domainA = extractDomain(a.url);
                const domainB = extractDomain(b.url);

                if (preferredOrder[domainA] && preferredOrder[domainB]) {
                    return preferredOrder[domainA] - preferredOrder[domainB];
                } else if (preferredOrder[domainA]) {
                    return -1;
                } else if (preferredOrder[domainB]) {
                    return 1;
                }

                const titleA = a.title.toLowerCase();
                const titleB = b.title.toLowerCase();
                if (titleA < titleB) return -1;
                if (titleA > titleB) return 1;
                return 0;
            });

            tabs.forEach((tab, index) => {
                if (tab.url !== 'chrome://newtab/') {
                    chrome.tabs.move(tab.id, { index });
                }
            });

            const newTab = tabs.find(tab => tab.url === 'chrome://newtab/');
            if (newTab) {
                chrome.tabs.move(newTab.id, { index: tabs.length - 1 });
            }
        });
    });
};

const extractDomain = (url) => {
    const match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im);
    return match && match[1];
};

chrome.runtime.onInstalled.addListener(() => {
    sortTabs();
});

chrome.runtime.onStartup.addListener(() => {
    sortTabs();
});

chrome.tabs.onUpdated.addListener(() => {
    sortTabs();
});

chrome.tabs.onCreated.addListener(() => {
    sortTabs();
});
