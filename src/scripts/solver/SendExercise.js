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
        const QuestionType = message.Send;

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

    /** Senders */
    function SolverSelectQuestions() {
        CheckAnswers();
    }

    function SolverTypingQuestions() {
        CheckAnswers();
    }

    function SolverMakeASentence() {
        CheckAnswer(0);
    }

    function SolverMultiQuestions() {
        for (let i = 0; i < I.length; i++) {
            try {
                CheckMultiSelAnswer(i);
            } catch (e) {}
        }
    }

    function SolverCardsQuestions() {
        CheckAnswers();
    }
}();
