!function () {
    "use strict";

    // todo call after host website loading is completed
    document.addEventListener('readystatechange', e => {
        if (e.target.readyState === 'complete') {

            const query = {active: true, currentWindow: true};

            chrome.tabs.query(query, tabs => {
                const url = tabs[0].url.toString();

                CheckURL(url) ? GetScript(tabs[0]) : PrintBadWebSite('You must be on the MOODLE website!');
            });
        }
    });

    /** Calls JS for popup.html content */
    async function GetScript(tab) {

        function ShowMoreOptions() {
            const bShowOptions = document.querySelector('.btn__show-more-options');
            const dContent = document.querySelector('.content');
            const html = document.documentElement;
            const body = document.body;
            let i = 0;

            bShowOptions.addEventListener('click', () => {

                body.classList.toggle('body__show-more');
                html.classList.toggle('body__show-more');
                dContent.classList.toggle('content-more-options');
                bShowOptions.classList.toggle('btn__show-less');
                bShowOptions.classList.toggle('btn__show-more');

                if (i % 2 === 0) {
                    bShowOptions.textContent = 'Show less';
                } else {
                    bShowOptions.textContent = 'Show more';
                }
                i++;
            });
        }

        const bFillAll = document.querySelector('.btn__fill-all');
        const bFillOne = document.querySelector('.btn__fill-one');
        const bSolveAll = document.querySelector('.btn__solve-all');
        const bSolveOne = document.querySelector('.btn__solve-one');
        const bReset = document.querySelector('.btn__reset');
        const cShuffle = document.querySelector('.chk__shuffle-questions');
        const bSend = document.querySelector('.btn__send');

        const TabsCache = await new Promise(res => chrome.storage.local.get('TabsCache', res));

        const CurrentTab = TabsCache['TabsCache'][`${tab.windowId}-${tab.id}`];

        if (!IsSetExamType(CurrentTab)) {
            PrintBadWebSite('No supported exam found!');
            return;
        }

        ShowMoreOptions();

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

                element.addEventListener('click', () => {
                    chrome.tabs.executeScript(null, {file: `/src/scripts/solver/${fileName}.js`}, () => {

                        let message = {
                            [value]: CurrentTab.ExamType,
                            'TabExamContent': CurrentTab.TabExamContent
                        };

                        chrome.tabs.sendMessage(tab.id, {'SolverMessage': message});
                    });
                });
            } else {
                element.disabled = true;
                // todo add styles for the button
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
    function PrintBadWebSite(ErrorMessage) {
        const dContent = document.querySelector('.content');
        const html = document.documentElement;
        const body = document.body;
        let paragraph = document.createElement('p');

        html.classList.add('html__bad-website');
        body.classList.add('body__bad-website');

        paragraph.textContent = ErrorMessage;
        paragraph.classList.add('p__bad-website');
        dContent.parentElement.replaceChild(paragraph, dContent);
    }

    /** Checks if is set ExamType */
    function IsSetExamType(CurrentTab) {
        return typeof CurrentTab.ExamType === 'string';
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
}();
