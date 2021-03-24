async function GetQuestionType() {
    const Storage = await new Promise(res => chrome.storage.local.get('ExamType', res));
    return Storage['ExamType'];
}

function AddToWebSite(script) {
    let innerScript = document.createElement('script');
    innerScript.innerHTML = script;
    document.head.appendChild(innerScript);
    innerScript.remove();
}

async function init() {
    let QuestionType = await GetQuestionType();

    let fun = {
        'SelectAnswers': SolverSelectAnswers.toString() + `SolverSelectAnswers('${QuestionType}');`,
        'TypingAnswers': SolverTypingAnswers.toString() + `SolverTypingAnswers('${QuestionType}');`,
        'MakeASentence': SolverMakeASentence.toString() + `SolverMakeASentence('${QuestionType}');`,
        'MultiAnswers': SolverMultiAnswers.toString() + `SolverMultiAnswers('${QuestionType}');`
    };

    let script = fun[QuestionType] || null;

    if (script !== null) AddToWebSite(script);
}

init()
    .catch(e => console.log(e));

/** Solvers */

function SolverSelectAnswers() {
    I.forEach((value, index) => {
        const segment = document.querySelector(`#Gap${index}`);

        if (segment.value === '') segment.value = I[index][1][0];
    });
}

function SolverTypingAnswers() {
    Status.forEach((value, index) => {
        const Question = document.querySelector(`#${Status[index][2]}`);

        if (Question && Question.selectedIndex <= 0) {
            const AnswerIndex = GetKeyFromSelect(Question);

            for (let i = 0; i < Question.options.length; i++) {
                if (parseInt(Question.options[i].value) === AnswerIndex) {
                    Question.selectedIndex = i;
                    return;
                }
            }
        }
    });
}

function SolverMakeASentence() {
    let Ans = Answers[0];

    if (typeof GuessSequence !== 'undefined' || GuessSequence !== [])
        Ans = Answers[0].slice(GuessSequence.length);

    Ans.forEach((value, key) => {
        AddSegment(Ans[key]);
    });
}

function SolverMultiAnswers() {
    const buttons = document.querySelectorAll('button');

    buttons.forEach(value => {
        const button = value.outerHTML;
        let AnsIndex;

        AnsIndex = button.match(/CheckMultiSelAnswer\((\d)\)/);

        if (AnsIndex) {
            AnsIndex = AnsIndex[1];

            I[AnsIndex][3].forEach((_, index) => {
                if (I[AnsIndex][3][index][3] === 100)
                    document.querySelector(`#Q_${AnsIndex}_${index}_Chk`).checked = true;
            });
        }
    });
}
