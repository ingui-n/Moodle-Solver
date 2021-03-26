!async function () {

    chrome.runtime.onMessage.addListener(message => {
        if (typeof message === 'object') {
            if (message.FillAll) {
                init(message.FillAll);
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

    function SolverTypingQuestions() {
        I.forEach((value, index) => {
            const segment = document.querySelector(`#Gap${index}`);

            if (segment.value === '') segment.value = I[index][1][0];
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
    }
}();
