!async function () {
    "use strict";

    /** Gets Tab, process until Tab status is complete */
    async function GetTab() {
        const query = {active: true, currentWindow: true};

        let Tab = await new Promise((resolve, reject) => {

            try {
                chrome.tabs.query(query, async tabs => {
                    resolve(tabs[0]);
                });
            } catch (e) {
                reject(e);
            }
        });

        if (Tab.status !== 'complete')
            Tab = await GetTab();

        return Tab;
    }

    function GetSolverContent() {
        return document.querySelector('.content').cloneNode(true);
    }

    const SolverContent = GetSolverContent();

    PrintToPopup(false,'Initializing...', 1);

    const Tab = await GetTab();

    if (CheckURL(Tab.url)) {
        PrintToPopup(true, SolverContent);
        await GetScript(Tab);
    } else {
        PrintToPopup(false, 'You must be on the MOODLE website!', 2);
    }

    /** Calls JS for popup.html content */
    async function GetScript(tab) {

        function ShowMoreOptions() {
            const bShowOptions = document.querySelector('.btn__show-more');
            const html = document.documentElement;
            let i = 0;

            bShowOptions.addEventListener('click', () => {

                if (i % 2 === 0) {
                    bShowOptions.textContent = 'Show less';
                    html.style.setProperty('--html-height', '405px');
                } else {
                    bShowOptions.textContent = 'Show more';
                    html.style.setProperty('--html-height', '246px');
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
            PrintToPopup(false, 'No supported exam found!', 2);
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

    /** Prints website message */
    function PrintToPopup(PrintSolver, Message, MessageLen) {
        const html = document.querySelector('html');
        const body = document.querySelector('body');
        const dContent = document.querySelector('.content');
        const pMessage = document.querySelector('.message');

        pMessage.classList.forEach(value => {
            if (value !== 'message')
                pMessage.classList.remove(value);
        });

        if (PrintSolver) {
            html.style.setProperty('--html-height', '246px');
            body.appendChild(SolverContent);
            pMessage.textContent = '';
        } else {
            if (dContent) {
                body.removeChild(dContent);
            }

            pMessage.classList.add(`message-${MessageLen}-line`);
            pMessage.textContent = Message;
        }
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
