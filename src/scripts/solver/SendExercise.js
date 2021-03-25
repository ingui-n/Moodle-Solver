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
        'SelectAnswers': SolverSelectQuestions.toString() + `SolverSelectAnswers();`,
        'TypingAnswers': SolverTypingAnswers.toString() + `SolverTypingAnswers();`,
        'MakeASentence': SolverMakeASentence.toString() + `SolverMakeASentence();`,
        'MultiAnswers': SolverMultiQuestions.toString() + `SolverMultiAnswers();`,
        'ClickAnswers': SolverClickAnswers.toString() + `SolverClickAnswers();`
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


