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
        'SelectAnswers': SolverSelectQuestions.toString() + `SolverSelectQuestions();`,
        'TypingAnswers': SolverTypingQuestions.toString() + `SolverTypingQuestions();`,
        'MakeASentence': SolverMakeASentence.toString() + `SolverMakeASentence();`,
        'MultiAnswers': SolverMultiQuestions.toString() + `SolverMultiAnswers();`,
        'CardsAnswers': SolverCardsQuestions.toString() + `SolverCardsQuestions();`
    };

    let script = '';

    QuestionType.forEach(value => {
        let ScriptFun = fun[value] || null;

        if (ScriptFun !== null) script += ScriptFun;
    });

    if (script !== '') AddToWebSite(script);
}

init()
    .catch(e => console.log(e));

/** Solvers */

function SolverSelectQuestions() {
    I.forEach((value, index) => {
        const segment = document.querySelector(`#Gap${index}`);

        if (segment.value === '') segment.value = I[index][1][0];
    });
}

function SolverTypingQuestions() {
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

function SolverMultiQuestions() {
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

function SolverCardsQuestions() {
    D.forEach((value, index) => {
        if (value[2] === 0 || DC[index].tag < 1) {
            value[2] = value[1];
            DC[index].DockToR(FC[F[D[index][1] - 1][1] - 1]);
            DC[index].tag = F[D[index][1] - 1][1];
        }
    });


    /*DC[CurrDrag].DockToR(FC[DropTarget]);
    D[CurrDrag][2] = F[DropTarget][1];
    DC[CurrDrag].tag = DropTarget + 1;*/
}