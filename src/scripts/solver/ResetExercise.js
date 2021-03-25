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
        'TypingAnswers': SolverTypingAnswers.toString() + `SolverTypingAnswers();`,
        'MakeASentence': SolverMakeASentence.toString() + `SolverMakeASentence();`,
        'MultiAnswers': SolverMultiAnswers.toString() + `SolverMultiAnswers();`,
        'ClickAnswers': SolverClickAnswers.toString() + `SolverClickAnswers();`,
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

function SolverTypingAnswers() {
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

function SolverMultiAnswers() {
    QuestionArray = QArray.length;

    window.StartedUp = false;
    StartUp();

    QArray = QArray.slice(0, QuestionArray);
    ChangeQ(1);
    ChangeQ(-1);
}

function SolverClickAnswers() {
    Score = 0;
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
