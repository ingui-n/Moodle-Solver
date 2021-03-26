!async function () {

    chrome.runtime.onMessage.addListener(message => {
        if (typeof message === 'object') {
            if (message.SolveAll) {
                init(message.SolveAll);
            }
        }
    });

    function AddToWebSite(script) {
        let innerScript = document.createElement('script');
        innerScript.innerHTML = script;
        document.head.appendChild(innerScript);
        innerScript.remove();
    }

    function init(QuestionType) {
        let fun = {
            'SelectAnswers': SolverSelectQuestions.toString() + `SolverSelectQuestions();`,
            'TypingAnswers': SolverTypingQuestions.toString() + `SolverTypingQuestions();`,
            'MakeASentence': SolverMakeASentence.toString() + `SolverMakeASentence();`,
            'MultiAnswers': SolverMultiQuestions.toString() + `SolverMultiQuestions();`,
            'ClickAnswers': SolverClickQuestions.toString() + `SolverClickQuestions();`,
            'CardsAnswers': SolverCardsQuestions.toString() + `SolverCardsQuestions();`
        };

        let script = '';

        if (typeof QuestionType === 'object') {
            QuestionType.forEach(value => {
                let ScriptFun = fun[value] || null;

                if (ScriptFun !== null) script += ScriptFun;
            });
        } else {
            script = fun[QuestionType] || '';
        }

        if (script !== '') AddToWebSite(script);
    }

    /** Solvers */

    function SolverSelectQuestions() {
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

    function SolverTypingQuestions() {
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

    function SolverMultiQuestions() {
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

    function SolverClickQuestions() {
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
}();
