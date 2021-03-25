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
    let isFilled = false;
    for (let a = 0; a < Status.length; a++) {
        const Question = document.querySelector(`#${Status[a][2]}`);

        if (Question && Question.selectedIndex <= 0) {
            const AnswerIndex = GetKeyFromSelect(Question);

            for (let i = 0; i < Question.options.length; i++) {
                if (parseInt(Question.options[i].value) === AnswerIndex) {
                    Question.selectedIndex = i;
                    isFilled = true;
                    return;
                }
            }
        }
        if (isFilled) return;
    }
}

function SolverTypingAnswers() {
    for (let i = 0; i < I.length; i++) {
        const segment = document.querySelector(`#Gap${i}`);

        if (segment.value === '') {
            segment.value = I[i][1][0][0];
            break;
        }
    }
}

function SolverMakeASentence() {
    let AnsIndex = Answers[0][0];

    if (typeof GuessSequence !== 'undefined' || GuessSequence !== [])
        AnsIndex = Answers[0][GuessSequence.length];

    AddSegment(AnsIndex);
}

function SolverMultiAnswers() {
    const buttons = document.querySelectorAll('button');

    for (let a = 0; a < buttons.length; a++) {
        const button = buttons[a].outerHTML;

        let AnsIndex, AnsFilled = false;

        AnsIndex = button.match(/CheckMultiSelAnswer\((\d)\)/);

        if (AnsIndex) {
            AnsIndex = AnsIndex[1];

            for (let AIndex = 0; AIndex < I[AnsIndex][3].length; AIndex++) {
                const element = document.querySelector(`#Q_${AnsIndex}_${AIndex}_Chk`);

                if (element.checked === false) {
                    if (I[AnsIndex][3][AIndex][3] === 100) {
                        element.checked = true;
                        AnsFilled = true;
                        break;
                    }
                }
            }
        }
        if (AnsFilled) break;
    }
}

function SolverCardsQuestions() {
    for (let i = 0; i < D.length; i++) {
        if (D[i][2] === 0 || DC[i].tag < 1) {
            D[i][2] = D[i][1];
            DC[i].DockToR(FC[F[D[i][1] - 1][1] - 1]);
            DC[i].tag = F[D[i][1] - 1][1];
            return;
        }
    }
}