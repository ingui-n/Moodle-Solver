function AddToWebSite(script) {
    let innerScript = document.createElement('script');
    innerScript.innerHTML = script;
    document.head.appendChild(innerScript);
    //innerScript.remove();
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    document.querySelector('.ExerciseTitle').textContent = 'dfsfddsf';
    if (req.getContentScript) {
        console.log('delivered: ' + req.getContentScript);
    }
    sendResponse({popupContent: 'success'})

    AddToWebSite('console.log(req)');
    AddToWebSite(console.log(sender));
    AddToWebSite(console.log(sendResponse));
});

async function GetSolverScript(type) {
    let script,
        QuestionType = await GetQuestionType();

    if (!QuestionType) return;

    let fun = {
        'fill-all': SolverFillAll.toString() + `SolverFillAll('${QuestionType}');`,
        'fill-one': SolverFillOne.toString() + `SolverFillOne('${QuestionType}');`,
        'solve-all': SolverSolveAll.toString() + `SolverSolveAll('${QuestionType}');`,
        'solve-one': SolverSolveOne.toString() + `SolverSolveOne('${QuestionType}');`,
        'reset': SolverReset.toString() + `SolverReset('${QuestionType}');`
    };

    script = fun[type] || null;

    if (script === null) return;

    AddToWebSite(script);
}

async function GetQuestionType() {
    const Storage = await new Promise(res => chrome.storage.local.get('ExamType', res));
    console.log(Storage['ExamType']);
    return Storage['ExamType'];

    /*
        let QuestionType = null;

        await new Promise(res => chrome.storage.local.get(['ExamType'], res))
            .then(e => QuestionType = e['ExamType']);

        return QuestionType;*/
}

function SolverFillAll(QuestionType) {
    function SelectAnswers() {
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

    function TypingAnswers() {
        I.forEach((value, index) => {
            const segment = document.querySelector(`#Gap${index}`);

            if (segment.value === '') segment.value = I[index][1][0];
        });
    }

    function MakeASentence() {
        let Ans = Answers[0];

        if (typeof GuessSequence !== 'undefined' || GuessSequence !== [])
            Ans = Answers[0].slice(GuessSequence.length);

        Ans.forEach((value, key) => {
            AddSegment(Ans[key]);
        });
    }

    function MultiAnswers() {
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

    let fun = {
        'SelectAnswers': SelectAnswers,
        'TypingAnswers': TypingAnswers,
        'MakeASentence': MakeASentence,
        'MultiAnswers': MultiAnswers
    }

    return fun[QuestionType] ? fun[QuestionType]() : null;
}

function SolverFillOne(QuestionType) {
    function SelectAnswers() {
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

    function TypingAnswers() {
        for (let i = 0; i < I.length; i++) {
            const segment = document.querySelector(`#Gap${i}`);

            if (segment.value === '') {
                segment.value = I[i][1][0][0];
                break;
            }
        }
    }

    function MakeASentence() {
        let AnsIndex = Answers[0][0];

        if (typeof GuessSequence !== 'undefined' || GuessSequence !== [])
            AnsIndex = Answers[0][GuessSequence.length];

        AddSegment(AnsIndex);
    }

    function MultiAnswers() {
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

    let fun = {
        'SelectAnswers': SelectAnswers,
        'TypingAnswers': TypingAnswers,
        'MakeASentence': MakeASentence,
        'MultiAnswers': MultiAnswers
    }

    return fun[QuestionType] ? fun[QuestionType]() : null;
}

function SolverSolveAll(QuestionType) {
    function SelectAnswers() {
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

    function TypingAnswers() {
        for (let i = 0; i < I.length; i++) {
            const segment = document.querySelector(`#Gap${i}`);
            segment.value = I[i][1][0][0];
        }
    }

    function MakeASentence() {
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

    function MultiAnswers() {
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

    function ClickAnswers() {
        for (let a = 0; a < I.length; a++) {
            for (let i = 0; i < I[a][3].length; i++) {
                if (I[a][3][i][3] === 100 && State[a][0] === -1) {
                    const button = document.querySelector(`#Q_${a}_${i}_Btn`);

                    CheckMCAnswer(a, i, button);
                }
            }
        }
    }

    let fun = {
        'SelectAnswers': SelectAnswers,
        'TypingAnswers': TypingAnswers,
        'MakeASentence': MakeASentence,
        'MultiAnswers': MultiAnswers,
        'ClickAnswers': ClickAnswers
    }

    return fun[QuestionType] ? fun[QuestionType]() : null;
}

function SolverSolveOne(QuestionType) {
    function SelectAnswers() {
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

    function TypingAnswers() {
        for (let i = 0; i < I.length; i++) {
            const segment = document.querySelector(`#Gap${i}`);

            if (segment.value !== I[i][1][0][0]) {
                segment.value = I[i][1][0][0];
                return;
            }
        }
    }

    function MakeASentence() {
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

    function MultiAnswers() {
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

    function ClickAnswers() {
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

    let fun = {
        'SelectAnswers': SelectAnswers,
        'TypingAnswers': TypingAnswers,
        'MakeASentence': MakeASentence,
        'MultiAnswers': MultiAnswers,
        'ClickAnswers': ClickAnswers
    }

    return fun[QuestionType] ? fun[QuestionType]() : null;
}

function SolverReset(QuestionType) { //todo TEST reset
    function SelectAnswers() {
        /** version 2 */
    }

    function TypingAnswers() {
        window.StartedUp = false;
        StartUp();
    }

    function MakeASentence() {
        let GSequence = GuessSequence.length;

        window.StartedUp = false;
        StartUp();

        [...Array(GSequence).keys()].forEach(() => {
            Undo();
        });
    }

    function MultiAnswers() {
        QuestionArray = QArray.length;

        window.StartedUp = false;
        StartUp();

        QArray = QArray.slice(0, QuestionArray);
        ChangeQ(1);
        ChangeQ(-1);
    }

    function ClickAnswers() {
        const buttons = document.querySelectorAll('.FuncButton');

        buttons.forEach(value => {
            if (value.id !== 'NextQButton' && value.id !== 'PrevQButton')
                value.innerText = '?';
        });
        let QuestionArray = QArray.length;

        window.StartedUp = false;
        StartUp();

        QArray = QArray.slice(0, QuestionArray);
        ChangeQ(1);
        ChangeQ(-1);
    }

    let fun = {
        'SelectAnswers': SelectAnswers,
        'TypingAnswers': TypingAnswers,
        'MakeASentence': MakeASentence,
        'MultiAnswers': MultiAnswers,
        'ClickAnswers': ClickAnswers
    }

    return fun[QuestionType] ? fun[QuestionType]() : null;
}

//todo add 'MultiAnswers'
