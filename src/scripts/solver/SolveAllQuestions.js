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
        'SelectAnswers': SolverSelectAnswers.toString() + `SolverSelectAnswers();`,
        'TypingAnswers': SolverTypingAnswers.toString() + `SolverTypingAnswers();`,
        'MakeASentence': SolverMakeASentence.toString() + `SolverMakeASentence();`,
        'MultiAnswers': SolverMultiAnswers.toString() + `SolverMultiAnswers();`,
        'ClickAnswers': SolverClickAnswers.toString() + `SolverClickAnswers();`,
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

function SolverSelectAnswers() {
    for (let a = 0; a < Status.length; a++) {
        const Question = document.querySelector(`#${Status[a][2]}`);

        if (Question) {
            const AnswerIndex = GetKeyFromSelect(Question);

            for (let i = 0; i < Question.options.length; i++) {
                if (parseInt(Question.options[i].value) === AnswerIndex) {
                    Question.selectedIndex = i;
                }
            }
        }
    }
}

function SolverTypingAnswers() {
    for (let i = 0; i < I.length; i++) {
        const segment = document.querySelector(`#Gap${i}`);
        segment.value = I[i][1][0][0];
    }
}

function SolverMakeASentence() {
    const AnsMap = Answers[0].map((value, index) => {
        return GuessSequence[index] === value;
    });

    const AnsDifferent = AnsMap.findIndex(el => el === false);

    if (AnsDifferent !== -1 && GuessSequence[AnsDifferent]) {
        const AnsRemove = GuessSequence.slice(AnsDifferent).length;

        [...Array(AnsRemove).keys()].forEach(() => {
            Undo();
        });
    }

    let Ans = Answers[0].slice(GuessSequence.length);

    Ans.forEach((value, key) => {
        AddSegment(Ans[key]);
    });
}

function SolverMultiAnswers() {
    const buttons = document.querySelectorAll('button');

    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i].outerHTML;

        let AnsIndex = button.match(/CheckMultiSelAnswer\((\d)\)/);

        if (AnsIndex) {
            AnsIndex = AnsIndex[1];

            for (let AIndex = 0; AIndex < I[AnsIndex][3].length; AIndex++) {
                const element = document.querySelector(`#Q_${AnsIndex}_${AIndex}_Chk`);

                element.checked = I[AnsIndex][3][AIndex][3] === 100;
            }
        }
    }
}

function SolverClickAnswers() {
    const buttons = document.querySelectorAll('button');

    for (let a = 0; a < buttons.length; a++) {
        const button = buttons[a].outerHTML;

        let AnsIndex = button.match(/CheckMCAnswer\((\d),(\d),this\)/);

        if (AnsIndex) {
            AnsIndex = AnsIndex[1];

            for (let i = 0; i < I[AnsIndex][3].length; i++) {
                if (I[AnsIndex][3][i][3] === 100 && State[AnsIndex][0] === -1) {
                    const button = document.querySelector(`#Q_${AnsIndex}_${i}_Btn`);

                    CheckMCAnswer(AnsIndex, i, button);
                }
            }
        }
    }
}

function SolverCardsQuestions() {
    D.forEach((value, index) => {
        value[2] = value[1];
        DC[index].DockToR(FC[F[D[index][1] - 1][1] - 1]);
        DC[index].tag = F[D[index][1] - 1][1];
    });
}
