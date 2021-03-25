/** Add Host option script to the MOODLE website */
function AddToWebSite(script) {
    let innerScript = document.createElement('script');
    innerScript.innerHTML = script;
    document.head.appendChild(innerScript);
    innerScript.remove();
}

/** Returns Questions type of the exercise */
function FindOutExamType() {
    const buttons = document.querySelectorAll('.FuncButton');//'button'

    let ExamTypes = [],
        ContentSelectAnswers;

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

                const SelectContent = document.querySelector('#Questions').outerHTML;

                if (!ContentSelectAnswers) ContentSelectAnswers = SelectContent;
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

    chrome.storage.local.set({'ContentSelectAnswers': ContentSelectAnswers});
//todo ExamTypes can now be an array
    return ExamTypes;
}

/** Gets Host Options from local storage */
async function CheckHostOptions(re) {
    const Storage = await new Promise(res => chrome.storage.local.get('HostOptions', res));

    if (typeof Storage['HostOptions'] === 'undefined')
        return re ? SetDefaultHostOptions() : null;
    return re ? Storage['HostOptions'] : null;
}

/** Sets default Host Options */
function SetDefaultHostOptions() {
    let HostOptions = {
        'ShuffleQuestions': true
    };

    chrome.storage.local.set({'HostOptions': HostOptions});
    return HostOptions;
}

/** Calls host option script */
async function ModifyWebsite() {
    let Scripts = {
        'ShuffleQuestions': ShuffleQuestions.toString() + `ShuffleQuestions();`
    };

    const HostOptions = await CheckHostOptions(true);

    for (const [key, value] of Object.entries(HostOptions)) {

        if (value === false)
            AddToWebSite(Scripts[key]);
    }
}

/** Sets Website Options to local storage */
function SetStaticVariables(ExamType) {
    let WebsiteOptions = {
        'FillAll': true,
        'FillOne': true,
        'SolveAll': true,
        'SolveOne': true,
        'Reset': true,
        'Send': true
    };

    switch (ExamType) {
        case 'SelectAnswers':
            WebsiteOptions.Reset = false;
    }

    chrome.storage.local.set({'ExamType': ExamType});
    chrome.storage.local.set({'StaticOptions': WebsiteOptions});
}

/** Calls everything */
async function init() {
    const ExamType = FindOutExamType();

    SetStaticVariables(ExamType);
    await CheckHostOptions();

    await ModifyWebsite();
}

init()
    .catch(e => console.log(e));

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
