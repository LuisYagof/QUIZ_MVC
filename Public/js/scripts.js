const WRAPPERTIT = document.querySelector(".wrapperTitle");
const WRAPPERANS = document.querySelector(".wrapperAnsw");
let counter = 0;
let position = 0;

async function getQuest() {
    fetch("/getQuestions")
    .then(res => res.json())
    .then(data => {
        if (data.status == 200){
            printQuestion(data.data[position], data.data)
        }

        if (data.status == 500){
            alert(data.data)
        }
    })
    .catch(err => console.log("Internal server error. Sorry :(", err))
}

getQuest();

// ------------------------------------------------------SHUFFLE----------------------------------------

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}

// shuffle(allQuestions);

// ------------------------------------------------------GENERATE---------------------------------------

function printQuestion(question, database){
    let questionElements = [];
    let title = document.createElement("h2");
    let content = document.createTextNode(question.qu);
    title.appendChild(content);
    WRAPPERTIT.appendChild(title);
    questionElements.push(title)

    let arrayAns = [];
    for (let i = 0; i < question.an.length; i++) {
        arrayAns.push({
            pos: i,
            text: question.an[i]
        });
    }

    shuffle(arrayAns);
    for (let i = 0; i < arrayAns.length; i++) {
        let input = document.createElement("input");
        input.setAttribute("id", i);
        input.setAttribute("value", i);
        input.setAttribute("name", "answer");
        input.setAttribute("type", "radio");
        WRAPPERANS.appendChild(input);
        questionElements.push(input);
        
        let label = document.createElement("label");
        let labelCont = document.createTextNode(arrayAns[i].text);
        label.setAttribute("for", i);
        label.appendChild(labelCont);

        label.addEventListener("click",() => {
            if (!label.classList.contains("clicked")) {
                evaluateAnswer(question.ok, questionElements, label, arrayAns[i].pos, database)
            }
            });

        WRAPPERANS.appendChild(label);
        questionElements.push(label);
    }
}

// printQuestion(allQuestions[position]);

// ----------------------------------------------------------EVALUATE-------------------------------------

function evaluateAnswer(correctPos, nodes, answerLabel, selectedPos, database) {
    answerLabel.classList.add("checked");
    answerLabel.classList.add("clicked");
    
    setTimeout( function() {
        if (correctPos === selectedPos) {
            answerLabel.classList.remove("checked");
            answerLabel.classList.add("right");
            position++;
            counter++;

            next(nodes, database);
            
        }else{
            answerLabel.classList.remove("checked");
            answerLabel.classList.add("wrong");
            position++;

            next(nodes, database);
        }
    }, 500);
}

// ------------------------------------------------------NEXT QUESTION-----------------------------

function next(nodes, database) {
    setTimeout(() => remover(nodes), 1000);
    if (position < database.length) {
        setTimeout(() => printQuestion(database[position], database), 1000);
    }else{
        setTimeout(() => count(counter, database.length), 1000);}
}

function remover(nodes){
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].remove();        
    }
}

// ------------------------------------------------------SCORE-------------------------------------

function count(counter, length) {
    let mean = counter / length * 10

    let restart = document.createElement("button");
    let restartText = document.createTextNode(`REINICIAR`)
    restart.appendChild(restartText);
    restart.setAttribute("class", "restartBtn")
    WRAPPERANS.appendChild(restart);
    restart.addEventListener("click", restartGame)

    if (mean > 6) {
        let farewell = document.createElement("h2");
        let farewellText = document.createTextNode(`Tu puntuación ha sido de ${Math.round((mean + Number.EPSILON) * 100) / 100} sobre 10. Nivel: final-boss de Filmin. Eres un máquina`);
        farewell.appendChild(farewellText);
        WRAPPERTIT.appendChild(farewell);
    } else if (mean < 2) {
        let farewell = document.createElement("h2");
        let farewellText = document.createTextNode(`Tu puntuación ha sido de ${Math.round((mean + Number.EPSILON) * 100) / 100} sobre 10. Nivel: sácate el abono de la filmoteca`);
        farewell.appendChild(farewellText);
        WRAPPERTIT.appendChild(farewell);

    } else {
        let farewell = document.createElement("h2");
        let farewellText = document.createTextNode(`Tu puntuación ha sido de ${Math.round((mean + Number.EPSILON) * 100) / 100} sobre 10. Nivel: gafapasta amateur`);
        farewell.appendChild(farewellText);
        WRAPPERTIT.appendChild(farewell);
    }    
}

function restartGame(){
    fetch("/")
    .then(res => window.location.href = res.url)
    .catch(err => console.log("Internal server error. Sorry :(", err))
}