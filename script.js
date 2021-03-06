let config = {
    FillAllAnswers: false, /** check all valid checkboxes */
    FillActualAnswer: false, /** check actual valid check boxes */
    SolveAllQuestions: false, /** check and valid all checkboxes -- trim bad answers */
    SolveActualQuestion: false, /** check and valid actual checkboxes -- trim bad answers */
    SendItToCheck: false, /** checkbox send result */
    ResetQuest: false /** reset score (State) */
};

/**** CONTENT ****/

let HPStartTime = HP.starttime.toString(); /** const */
let TotalScore = SumTotalScore();
let ChangeStartTime = false;

let GapInput;

function init() {
    if (document.querySelector('#OneByOneReadout') && document.querySelector('#OneByOneReadout').style.display === 'none') {
        config.SolveActualQuestion = false;
        config.FillActualAnswer = false;
        //todo blank buttons
    }
    if (document.querySelector('#Instructions'))
        document.querySelector('#Instructions').textContent = 'Máš 100 jednotek pozornosti.';
}

function Solver() {
    init();
    let ActualPageNum;
    let ActualQuestionNum = 0;
    if (config.SolveActualQuestion || config.FillActualAnswer)
        ActualPageNum = parseInt(document.querySelector('.QNum').textContent.match(/\d+/)[0]);
    let AnswersType;

    document.querySelectorAll('button').forEach(value => {
        const val = value.onclick.toString();
        if (val.includes('CheckAnswers()')) {
            if (typeof Status === undefined) {
                AnswersType = 'SelectAnswers';
                if (config.SolveAllQuestions || config.SolveActualQuestion || config.FillAllAnswers || config.FillActualAnswer || config.ResetQuest)
                    SolveSelect();
            } else {
                AnswersType = 'TypingAnswer';
                if (config.SolveAllQuestions || config.SolveActualQuestion || config.FillAllAnswers || config.FillActualAnswer || config.ResetQuest)
                    SolveTyping();
            }
        } else if (val.includes('CheckAnswer(0)')) {
            AnswersType = 'MakeASentence';
            if (config.SolveAllQuestions || config.SolveActualQuestion || config.FillAllAnswers || config.FillActualAnswer || config.ResetQuest)
                SolveSentence();
        } else if (val.includes('CheckMultiSelAnswer(')) {
            AnswersType = 'CheckAnswers';
            ActualQuestionNum++;
            const AnsNumStartIndex = val.search(/CheckMultiSelAnswer\(\d+\)/) + 20;
            const AnsIndex = val.substr(AnsNumStartIndex, 3).match(/\d+/)[0];

            if (config.SolveAllQuestions || config.FillAllAnswers || config.ResetQuest || ((config.SolveActualQuestion || config.FillActualAnswer) && ActualPageNum === ActualQuestionNum))
                SolveOneOfMultiCheck(AnsIndex);
        }
    });
    if (config.SendItToCheck && AnswersType === 'CheckAnswers')
        CheckFinished();
    else if (config.SendItToCheck && AnswersType === 'MakeASentence')
        CheckAnswer(0);
    else if (config.SendItToCheck && (AnswersType === 'SelectAnswers' || AnswersType === 'TypingAnswer'))
        CheckAnswers();
}

function SolveSelect() {
    if (config.ResetQuest) {
        CreateStatusArrays();
        ResetHP();
    }
    Status.forEach((value, index) => {
        if (document.querySelector(`#${Status[index][2]}`)) {
            const Question = document.querySelector(`#${Status[index][2]}`);
            const AnswerIndex = GetKeyFromSelect(Question);
            config.ResetQuest ? Question.selectedIndex = 0 : Question.selectedIndex = AnswerIndex + 1;
        }
    });
}

function SolveSentence() {
    if (config.ResetQuest) {
        for (let i = 0; i < 50; i++)
            Undo();
        Penalties = 0;
        ResetHP();
    }
    Answers[0].forEach((value, index) => {
        const segments = document.querySelectorAll('.ExSegment');
        let isSelected = false;
        segments.forEach((val) => {
            if (val.onclick.toString().includes(`AddSegment(${Answers[0][index]})`) && !isSelected) {
                val.click();
                isSelected = true;
            }
        });
    });
}

function SolveTyping() { //todo improve fill - if is answer in the box fill next!
    if (GapInput === undefined) {
        for (let i = 1; i < 20; i++) {
            if (document.querySelector(`#Gap${i}`)) {
                GapInput = document.querySelector(`#Gap${i}`);
                break;
            }
        }
    }
    if (config.ResetQuest) {
        Score = 0;
        State = [];
        State.length = 0;
        for (let i = 0; i < I.length; i++) {
            State[i] = new ItemState();
        }
        const GapSpan = document.querySelectorAll('.GapSpan');
        GapSpan.forEach((value, index) => {
            const Gap = GapInput.cloneNode(true);
            Gap.id = `Gap${index}`;
            value.innerHTML = '';
            value.appendChild(Gap);
        });
        ResetHP();
    }
    I.forEach((value, index) => {
        if (document.querySelector(`#Gap${index}`)) {
            const segment = document.querySelector(`#Gap${index}`);
            config.ResetQuest ? segment.value = '' : segment.value = I[index][1][0];
        }
    });
}

function SolveOneOfMultiCheck(AnsIndex) {
    if (config.SolveAllQuestions || config.SolveActualQuestion || config.ResetQuest) {
        if (config.ResetQuest) {
            CreateStatusArray();
            ResetHP();
        }
        for (let AIndex = 0; AIndex < I[AnsIndex][3].length; AIndex++) {
            if (config.ResetQuest)
                document.querySelector('#Q_' + AnsIndex + '_' + AIndex + '_Chk').checked = false;
            else
                document.querySelector('#Q_' + AnsIndex + '_' + AIndex + '_Chk').checked = I[AnsIndex][3][AIndex][3] === 100;
        }
        if (!config.ResetQuest) CheckMultiSelAnswer(AnsIndex);
    } else if (config.FillAllAnswers || config.FillActualAnswer) {
        for (let AIndex = 0; AIndex < I[AnsIndex][3].length; AIndex++) {
            if (I[AnsIndex][3][AIndex][3] === 100)
                document.querySelector('#Q_' + AnsIndex + '_' + AIndex + '_Chk').checked = true;
        }
    }
}

function SumTotalScore() {
    if (typeof CalculateOverallScore === 'function') {
        CalculateOverallScore();
        return Score;
    }
    return 0;
}

function ResetHP() {
    window.HP = new JCloze(0, 0);
    HP_add_listener(window, 'beforeunload', HP_send_results);
    HP_add_listener(window, 'pagehide', HP_send_results);
    HP_add_listener(window, 'unload', HP_send_results);
}

function GetHPStartTime() {
    return HPStartTime.substr(0, 24);
}

function ModifyHPStartTime(NewTime) {
    const LastPartOfTheTime = HPStartTime.substr(24);
    HP.starttime = new Date(NewTime + LastPartOfTheTime);
}

//Solver();
