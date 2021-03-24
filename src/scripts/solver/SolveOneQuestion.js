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
        'MultiAnswers': SolverMultiAnswers.toString() + `SolverMultiAnswers('${QuestionType}');`,
        'ClickAnswers': SolverClickAnswers.toString() + `SolverClickAnswers('${QuestionType}');`
    };

    let script = fun[QuestionType] || null;

    if (script !== null) AddToWebSite(script);
}

init()
    .catch(e => console.log(e));

/** Solvers */

function SolverSelectAnswers() {
    let isFilled = false;
    for (let a = 0; a < Status.length; a++) {
        const Question = document.querySelector(`#${Status[a][2]}`);

        if (Question) {
            const AnswerIndex = GetKeyFromSelect(Question);

            for (let i = 0; i < Question.options.length; i++) {
                if (parseInt(Question.options[i].value) === AnswerIndex) {
                    if (Question.selectedIndex !== i) {
                        Question.selectedIndex = i;
                        isFilled = true;
                        return;
                    }
                }
            }
        }
        if (isFilled) return;
    }
}

function SolverTypingAnswers() {
    for (let i = 0; i < I.length; i++) {
        const segment = document.querySelector(`#Gap${i}`);

        if (segment.value !== I[i][1][0][0]) {
            segment.value = I[i][1][0][0];
            return;
        }
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

    AddSegment(Ans[0]);
}

function SolverMultiAnswers() {
    const buttons = document.querySelectorAll('button');
    let isChanged = false;

    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i].outerHTML;

        let AnsIndex = button.match(/CheckMultiSelAnswer\((\d)\)/);

        if (AnsIndex) {
            AnsIndex = AnsIndex[1];

            for (let AIndex = 0; AIndex < I[AnsIndex][3].length; AIndex++) {
                const element = document.querySelector(`#Q_${AnsIndex}_${AIndex}_Chk`);

                if (element.checked && I[AnsIndex][3][AIndex][3] !== 100) {
                    element.checked = false;
                    isChanged = true;
                    return;
                } else if (!element.checked && I[AnsIndex][3][AIndex][3] === 100) {
                    element.checked = true;
                    isChanged = true;
                    return;
                }
            }
        }
        if (isChanged) return;
    }
}

function SolverClickAnswers() {
    let isFilled = false;

    for (let a = 0; a < I.length; a++) {
        for (let i = 0; i < I[a][3].length; i++) {
            if (I[a][3][i][3] === 100 && State[a][0] === -1) {
                const button = document.querySelector(`#Q_${a}_${i}_Btn`);

                CheckMCAnswer(a, i, button);
                isFilled = true;
                return;
            }
        }
        if (isFilled) return;
    }
}
