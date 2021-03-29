!function () {
    "use strict";

    /*document.addEventListener('readystatechange', e => {
        if (e.target.readyState === 'complete') {

            const query = {active: true, currentWindow: true};

            chrome.tabs.query(query, tabs => {
                const url = tabs[0].url.toString();

                CheckURL(url) ? GetScript(tabs[0]) : PrintBadWebSite();
            });
        }
    });*/

    /** Calls JS for popup.html content */
    async function GetScript(tab) {
        const bFillAll = document.querySelector('.btn__fill-all');
        const bFillOne = document.querySelector('.btn__fill-one');
        const bSolveAll = document.querySelector('.btn__solve-all');
        const bSolveOne = document.querySelector('.btn__solve-one');
        const bReset = document.querySelector('.btn__reset');
        const cShuffle = document.querySelector('.chk__shuffle-questions');
        const bSend = document.querySelector('.btn__send');

        const TabsCache = await new Promise(res => chrome.storage.local.get('TabsCache', res));

        const CurrentTab = TabsCache['TabsCache'][`${tab.windowId}-${tab.id}`];

        // todo add script there

        /** Gets Host Options from local storage */
        async function GetHostOptions() {
            const Storage = await new Promise(res => chrome.storage.local.get('HostOptions', res));
            return Storage['HostOptions'];
        }

        /** Changes Host Options */
        async function ChangeHostOptions(option, value) {
            const HostOptions = await GetHostOptions();

            if (HostOptions[option] !== value) {
                HostOptions[option] = value;
                chrome.storage.local.set({'HostOptions': HostOptions});
            }
        }

        /** Sets value and listener for an element */
        async function SetupLabelListener(element, variable, type) {
            const HostOptions = await GetHostOptions();

            switch (type) {
                case 'Checkbox':
                    element.checked = HostOptions[variable];
                    break;
                default:
                    return;
            }

            element.addEventListener('click', () => {
                let types = {
                    'Checkbox': 'checked'
                }

                ChangeHostOptions(variable, element[types[type]]);
            });
        }

        /** Setup click listeners for solver */
        async function SetupStaticListener(element, value, fileName) {
            const StaticOptions = CurrentTab.StaticVariables;

            if (StaticOptions[value] === true) {
                chrome.tabs.executeScript(null, {file: `/src/scripts/solver/${fileName}.js`});

                element.addEventListener('click', () => {
                    chrome.tabs.sendMessage(tab.id, {[value]: CurrentTab.ExamType});
                });
            } else {
                element.disabled = true;
            }
        }

        await SetupStaticListener(bFillAll, 'FillAll', 'FillAllAnswers');
        await SetupStaticListener(bFillOne, 'FillOne', 'FillOneAnswer');
        await SetupStaticListener(bSolveAll, 'SolveAll', 'SolveAllQuestions');
        await SetupStaticListener(bSolveOne, 'SolveOne', 'SolveOneQuestion');
        await SetupStaticListener(bReset, 'Reset', 'ResetExercise');
        await SetupStaticListener(bSend, 'Send', 'SendExercise');

        await SetupLabelListener(cShuffle, 'ShuffleQuestions', 'Checkbox');
    }

    /** Prints bad website message */
    function PrintBadWebSite() {
        //todo page width style
        document.querySelector('body').innerHTML = 'You must be on the moodle website!';
    }

    /** Checks URL if is MOODLE */
    function CheckURL(url) {
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

    function ShowMoreOptions() {
        const bShowOptions = document.querySelector('.btn__show-more-options');
        const html = document.documentElement;
        const body = document.body;
        let i = 0;

        bShowOptions.addEventListener('click', () => {

            if (i === 0) {
                body.classList.toggle('body__show-more');
                html.classList.toggle('body__show-more');
            } else {
                body.classList.toggle('body__show-more');
                html.classList.toggle('body__show-more');
                body.classList.toggle('body__show-less');
                html.classList.toggle('body__show-less');
            }

            if (i % 2 === 0) {
                bShowOptions.textContent = 'Show less';
            } else {
                bShowOptions.textContent = 'Show more';
            }
            i++;
        });
    }
    ShowMoreOptions();
}();
