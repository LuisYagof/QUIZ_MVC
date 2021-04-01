const WRAPPERTIT = document.querySelector(".wrapperTitle");
const WRAPPERANS = document.querySelector(".wrapperAnsw");
let counter = 0;
let position = 0;

async function getQuest() {
    fetch("http://localhost:8080/getTest")
    .then(res => res.json())
    .then(data => {
        if (data.status == 200){
            shuffle(data.data)
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

// ------------------------------------------------------GENERATE---------------------------------------

function printQuestion(question, database){
    let title = document.createElement("h2");
    let content = document.createTextNode(question.qu);
    title.appendChild(content);
    WRAPPERTIT.appendChild(title);

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
        
        let label = document.createElement("label");
        let labelCont = document.createTextNode(arrayAns[i].text);
        label.setAttribute("for", i);
        label.appendChild(labelCont);

        label.addEventListener("click",() => {
            if (!title.classList.contains("clicked")) {
                evaluateAnswer(question.ok, label, arrayAns[i].pos, database, title)
            }
            });
        WRAPPERANS.appendChild(label);
    }
}

// ----------------------------------------------------------EVALUATE-------------------------------------

function evaluateAnswer(correctPos, answerLabel, selectedPos, database, title) {
    answerLabel.classList.add("checked");
    title.classList.add("clicked");
    
    setTimeout( function() {
        if (correctPos === selectedPos) {
            answerLabel.classList.remove("checked");
            answerLabel.classList.add("right");
            position++;
            counter++;

            next(database);
            
        }else{
            answerLabel.classList.remove("checked");
            answerLabel.classList.add("wrong");
            position++;

            next(database);
        }
    }, 500);
}

// ------------------------------------------------------NEXT QUESTION-----------------------------

function next(database) {
    setTimeout(() => removeWrapper(), 1000);
    if (position < database.length) {
        setTimeout(() => printQuestion(database[position], database), 1000);
    }else{
        setTimeout(() => count(counter, database.length), 1000);}
}

function removeWrapper() {
    WRAPPERTIT.querySelectorAll('*').forEach(el => el.remove())
    WRAPPERANS.querySelectorAll('*').forEach(el => el.remove())
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

    if (mean > 8) {
        let farewell = document.createElement("h2");
        let farewellText = document.createTextNode(`Tu puntuación ha sido de ${Math.round((mean + Number.EPSILON) * 100) / 100} sobre 10. Nivel: final-boss de Filmin. Eres un máquina`);
        farewell.appendChild(farewellText);
        WRAPPERTIT.appendChild(farewell);
    } else if (mean < 3) {
        let farewell = document.createElement("h2");
        let farewellText = document.createTextNode(`Tu puntuación ha sido de ${Math.round((mean + Number.EPSILON) * 100) / 100} sobre 10. Nivel: sácate el abono de la filmoteca`);
        farewell.appendChild(farewellText);
        WRAPPERTIT.appendChild(farewell);
    } else if (mean > 3 && mean < 5) {
        let farewell = document.createElement("h2");
        let farewellText = document.createTextNode(`Tu puntuación ha sido de ${Math.round((mean + Number.EPSILON) * 100) / 100} sobre 10. Nivel: hay que ver más cine`);
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