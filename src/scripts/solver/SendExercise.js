!async function () {

    chrome.runtime.onMessage.addListener(message => {
        if (typeof message === 'object') {
            if (message.Send) {
                init(message.Send);
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

    // todo create send file
}();
