!async function () {

    chrome.runtime.onMessage.addListener(async message => {
        if (typeof message === 'object') {
            if (message.tabName && message.tabUrl) {
                const isSetTab = await IsSetTabInStorage(message.tabName, message.tabUrl);

                await CheckTabsExpiration();
                SetEasterEgg();

                if (!isSetTab) {
                    await SetTabInfo(message.tabName, message.tabUrl);
                }

                await ModifyWebsite();
            }
        }
    });

    /** Checks if is set current tab to storage */
    async function IsSetTabInStorage(tabName, tabUrl) {
        const tabs = await GetTabsCache();

        if (typeof tabs === 'object') {
            for (const [key, value] of Object.entries(tabs)) {

                if (key === tabName && value.url === tabUrl)
                    return true;
            }
        } else {
            SetTabStorageVariable();
        }
        return false;
    }

    /** Returns TabsCache */
    async function GetTabsCache() {
        const target = await new Promise(res => chrome.storage.local.get('TabsCache', res));
        return target['TabsCache'];
    }

    /** Sets default storage variable "TabsCache" */
    function SetTabStorageVariable() {
        chrome.storage.local.set({'TabsCache': {}});
    }

    /** Sets new tab to local storage */
    async function SetTabInfo(tabName, tabUrl) {
        const ExamType = await FindOutExamType();

        if (ExamType === []) return;

        const StaticVariables = GetStaticVariables(ExamType);
        const TabExamContent = GetTabExamContent(ExamType);

        let tab = {
            'url': tabUrl,
            'ExamType': ExamType,
            'StaticVariables': StaticVariables,
            'TabExamContent': TabExamContent,
            'BuildDate': Date.now()
        }

        const TabsCache = await GetTabsCache();

        TabsCache[tabName] = tab;

        chrome.storage.local.set({'TabsCache': TabsCache});
    }

    /** Add Host option script to the MOODLE website */
    function AddToWebSite(script) {
        let innerScript = document.createElement('script');
        innerScript.innerHTML = script;
        document.head.appendChild(innerScript);
        innerScript.remove();
    }

    /** Returns Questions type of the exercise */
    async function FindOutExamType() {
        const buttons = document.querySelectorAll('.FuncButton');//'button'

        let ExamTypes = [];

        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i].outerHTML;

            if (button.includes('CheckAnswers()')) {
                const SelectElements = document.querySelectorAll('select').length;
                const FillElements = document.querySelectorAll('input[type=text]').length;
                const CardElements = document.querySelectorAll('.CardStyle').length;

                if (CardElements > 0) {
                    ExamTypes.push('CardsAnswers');
                } else if (SelectElements > FillElements) {
                    ExamTypes.push('SelectAnswers');
                } else {
                    ExamTypes.push('TypingAnswers');
                }
            } else if (button.includes('CheckAnswer(0)')) {
                ExamTypes.push('MakeASentence');
            } else if (button.includes('CheckMultiSelAnswer(')) {
                ExamTypes.push('MultiAnswers');
            } else if (button.includes('CheckMCAnswer(')) {
                ExamTypes.push('ClickAnswers');
            }
        }

        if (!ExamTypes.includes('MultiAnswers') && !ExamTypes.includes('ClickAnswers')) {
            ExamTypes = ExamTypes[0];
        } else {
            ExamTypes = [...new Set(ExamTypes)];
        }

        return ExamTypes;
    }

    /** Returns exam content from the tab */
    function GetTabExamContent(ExamType) {
        if (ExamType === 'SelectAnswers') {
            const SelectContent = document.querySelector('#Questions').outerHTML;

            return [SelectContent, '#Questions'];
        }
        return [];
    }

    /** Gets Host Options from local storage */
    async function CheckHostOptions() {
        const Storage = await new Promise(res => chrome.storage.local.get('HostOptions', res));

        if (typeof Storage['HostOptions'] === 'undefined')
            return SetDefaultHostOptions();
        return Storage['HostOptions'];
    }

    /** Sets default Host Options */
    function SetDefaultHostOptions() {
        let HostOptions = {
            'ShuffleQuestions': true
        };

        chrome.storage.local.set({'HostOptions': HostOptions});
        return HostOptions;
    }

    /** Sets easter egg to the tab */
    function SetEasterEgg() {
        const div = document.querySelector('.logininfo');

        if (div) div.innerText = 'Máš 100 jednotek pozornosti';
    }

    /** Calls host option script */
    async function ModifyWebsite() {
        let Scripts = {
            'ShuffleQuestions': ShuffleQuestions.toString() + `ShuffleQuestions();`
        };

        const HostOptions = await CheckHostOptions();

        for (const [key, value] of Object.entries(HostOptions)) {

            if (value === false)
                AddToWebSite(Scripts[key]);
        }
    }

    /** Sets Website Options to local storage */
    function GetStaticVariables(ExamType) {
        let WebsiteOptions = {
            'FillAll': true,
            'FillOne': true,
            'SolveAll': true,
            'SolveOne': true,
            'Reset': true,
            'Send': true
        };

        switch (ExamType) {
            default:
                break;
        }

        return WebsiteOptions;
    }

    /** Checks if tab expired and if expired it will be removed */
    async function CheckTabsExpiration() {
        const tabs = await GetTabsCache();
        const CurrentDate = Date.now();

        if (typeof tabs === 'object') {
            for (const [key, value] of Object.entries(tabs)) {

                if (CurrentDate - value.BuildDate > 172800000) // todo test if it works 22:24 36.03. 2021
                    tabs[key] = undefined;
            }
        }
        chrome.storage.local.set({'TabsCache': tabs});
    }

    /** Modifying script */
    function ShuffleQuestions() {
        if (typeof ShuffleQs !== 'undefined')
            ShuffleQs = false;
        if (typeof Shuffle === 'function') {
            Shuffle = Segments => {
                return Segments;
            }
        }
    }
}();
