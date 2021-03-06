!function () {

    function ListenerHandler(message) {
        if (typeof message === 'object') {
            if (message.SolverMessage) {
                chrome.runtime.onMessage.removeListener(ListenerHandler);
                init(message.SolverMessage);
            }
        }
    }

    chrome.runtime.onMessage.addListener(ListenerHandler);

    function AddToWebSite(script) {
        let innerScript = document.createElement('script');
        innerScript.innerHTML = script;
        document.head.appendChild(innerScript);
        innerScript.remove();
    }

    function init(message) {
        const QuestionType = message.FillOne;

        let fun = {
            'SelectAnswers': SolverSelectQuestions.toString() + `SolverSelectQuestions();`,
            'TypingAnswers': SolverTypingQuestions.toString() + `SolverTypingQuestions();`,
            'MakeASentence': SolverMakeASentence.toString() + `SolverMakeASentence();`,
            'MultiAnswers': SolverMultiQuestions.toString() + `SolverMultiQuestions();`,
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

    function SolverTypingQuestions() {
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

    function SolverMultiQuestions() {
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
}();
