!function () {
    "use strict";

    const query = {active: true, currentWindow: true};

    document.addEventListener('readystatechange', e => {
        if (e.target.readyState === 'complete') {

            chrome.tabs.query(query, tabs => {
                const url = tabs[0].url.toString();

                CheckURL(url) ? GetScript() : PrintBadWebSite();
            });
        }
    });

    async function GetScript() {
        const bFillAll = document.querySelector('.btn__fill-all');
        const bFillOne = document.querySelector('.btn__fill-one');
        const bSolveAll = document.querySelector('.btn__solve-all');
        const bSolveOne = document.querySelector('.btn__solve-one');
        const bReset = document.querySelector('.btn__reset');
        const cShuffle = document.querySelector('.chk__shuffle-questions');
        const bSend = document.querySelector('.btn__send');

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

        /** Gets Static Options from local storage */
        async function GetStaticOptions() {
            const Storage = await new Promise(res => chrome.storage.local.get('StaticOptions', res));
            return Storage['StaticOptions'];
        }

        async function SetupStaticListener(element, value, fileName) {
            const StaticOptions = await GetStaticOptions();

            if (StaticOptions[value] === true) {
                element.addEventListener('click', () => {
                    chrome.tabs.executeScript(null, {file: `/src/scripts/solver/${fileName}.js`});
                });
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

    function PrintBadWebSite() {
        //todo page width style
        document.querySelector('body').innerHTML = 'You must be on the moodle website!';
    }

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
