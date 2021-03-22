function AddToWebSite(script) {
    let innerScript = document.createElement('script');
    innerScript.innerHTML = script;
    document.head.appendChild(innerScript);
    innerScript.remove();
}

function GetExamType() {
    const buttons = document.querySelectorAll('.FuncButton');//'button'

    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i].outerHTML;

        if (button.includes('CheckAnswers()')) {
            const SelectElements = document.querySelectorAll('select');
            const FillElements = document.querySelectorAll('input[type=text]');

            return SelectElements.length > FillElements.length ? 'SelectAnswers' : 'TypingAnswers';
        } else if (button.includes('CheckAnswer(0)')) {
            return 'MakeASentence';
        } else if (button.includes('CheckMultiSelAnswer(')) {
            return 'MultiAnswers';
        } else if (button.includes('CheckMCAnswer(')) {
            return 'ClickAnswers';
        }
    }
    return null;
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
        'EnableFillAll': true,
        'EnableFillOne': true,
        'EnableSolveAll': true,
        'EnableSolveOne': true,
        'EnableReset': true,
        'EnableSend': true
    };

    switch (ExamType) {
        case 'SelectAnswers':
            WebsiteOptions.EnableReset = false;
    }

    chrome.storage.local.set({'ExamType': ExamType});
    chrome.storage.local.set({'StaticOptions': WebsiteOptions});
}

/** Calls everything */
async function init() {
    const ExamType = GetExamType();

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
