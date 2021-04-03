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
        const QuestionType = message.Reset;
        const TabExamContent = message.TabExamContent;

        let fun = {
            'TypingAnswers': SolverTypingQuestions.toString() + `SolverTypingQuestions();`,
            'MakeASentence': SolverMakeASentence.toString() + `SolverMakeASentence();`,
            'MultiAnswers': SolverMultiQuestions.toString() + `SolverMultiQuestions();`,
            'ClickAnswers': SolverClickQuestions.toString() + `SolverClickQuestions();`,
            'CardsAnswers': SolverCardsQuestions.toString() + `SolverCardsQuestions();`
        };

        let script = '';

        if (typeof QuestionType === 'object') {

            for (const value of QuestionType) {

                if (value === 'SelectAnswers') {
                    SolverSelectQuestions(TabExamContent);
                } else {
                    let ScriptFun = fun[value] || null;

                    if (ScriptFun !== null) script += ScriptFun;
                }
            }
        } else {
            if (QuestionType === 'SelectAnswers') {
                SolverSelectQuestions(TabExamContent);
            } else {
                script = fun[QuestionType] || '';
            }
        }

        if (script !== '') AddToWebSite(script);
    }

    /** Solvers */

    function SolverSelectQuestions(TabExamContent) {
        if (typeof TabExamContent === 'object') {
            document.querySelector(TabExamContent[1]).innerHTML = TabExamContent[0];
        }

        let script = `CreateStatusArrays(); Score = 0; Penalties = 0;`;

        AddToWebSite(script);
    }

    function SolverTypingQuestions() {
        window.StartedUp = false;
        StartUp();
    }

    function SolverMakeASentence() {
        let GSequence = GuessSequence.length;

        window.StartedUp = false;
        StartUp();

        [...Array(GSequence).keys()].forEach(() => {
            Undo();
        });
    }

    function SolverMultiQuestions() {
        QuestionArray = QArray.length;

        window.StartedUp = false;
        StartUp();

        QArray = QArray.slice(0, QuestionArray);
        ChangeQ(1);
        ChangeQ(-1);
    }

    function SolverClickQuestions() {
        Score = 0;
        const buttons = document.querySelectorAll('.FuncButton');

        buttons.forEach(value => {
            if (value.textContent.includes('?'))
                value.innerText = '?';
        });
        let QuestionArray = QArray.length;

        window.StartedUp = false;
        StartUp();

        QArray = QArray.slice(0, QuestionArray);
        ChangeQ(1);
        ChangeQ(-1);
    }

    function SolverCardsQuestions() {
        AnswersTried = '';
        Score = 0;
        Penalties = 0;
        DC.forEach((value, index) => {
            DC[index].GoHome();
            DC[index].tag = -1;
            D[index][2] = 0;
        });
    }
}();
