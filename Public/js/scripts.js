const WRAPPERTIT = document.querySelector(".wrapperTitle");
const WRAPPERANS = document.querySelector(".wrapperAnsw");
let counter = 5;
let position = 0;

// ------------------------------------------------------SHUFFLE----------------------------------------

function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
  }
shuffle(DATABASE);

// ------------------------------------------------------GENERATE---------------------------------------

function printQuestion(question){
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
                evaluateAnswer(question.ok, questionElements, label, arrayAns[i].pos)
            }
            });

        WRAPPERANS.appendChild(label);
        questionElements.push(label);
    }
}

printQuestion(DATABASE[position]);

// ----------------------------------------------------------EVALUATE-------------------------------------

function evaluateAnswer(correctPos, nodes, answerLabel, selectedPos) {
    answerLabel.classList.add("checked");
    answerLabel.classList.add("clicked");
    
    setTimeout( function() {
        if (correctPos === selectedPos) {
            answerLabel.classList.remove("checked");
            answerLabel.classList.add("right");
            position++;
            counter++;

            next(nodes);
            
        }else{
            answerLabel.classList.remove("checked");
            answerLabel.classList.add("wrong");
            position++;
            counter= counter-1;

            next(nodes);
        }
    }, 500);
}

// ------------------------------------------------------NEXT QUESTION-----------------------------

function next(nodes) {
    setTimeout(() => remover(nodes), 1000);
    if (position < DATABASE.length) {
        setTimeout(() => printQuestion(DATABASE[position]), 1000);
    }else{
        setTimeout(() => count(counter), 1000);}
}

function remover(nodes){
    for (let i = 0; i < nodes.length; i++) {
        nodes[i].remove();        
    }
}

// ------------------------------------------------------SCORE-------------------------------------

function count(counter) {
    let restart = document.createElement("a");
    restart.setAttribute("href", "main.html");
    let restartText = document.createTextNode(`REINICIAR`);
    restart.appendChild(restartText);
    WRAPPERANS.appendChild(restart);

    if (counter > 6) {
        let farewell = document.createElement("h2");
        let farewellText = document.createTextNode(`Tu puntuación ha sido de ${counter} sobre 10. Nivel: final-boss de Filmin. Eres un máquina`);
        farewell.appendChild(farewellText);
        WRAPPERTIT.appendChild(farewell);
    } else if (counter < 2) {
        let farewell = document.createElement("h2");
        let farewellText = document.createTextNode(`Tu puntuación ha sido de ${counter} sobre 10. Nivel: sácate el abono de la filmoteca`);
        farewell.appendChild(farewellText);
        WRAPPERTIT.appendChild(farewell);

    } else {
        let farewell = document.createElement("h2");
        let farewellText = document.createTextNode(`Tu puntuación ha sido de ${counter} sobre 10. Nivel: gafapasta amateur`);
        farewell.appendChild(farewellText);
        WRAPPERTIT.appendChild(farewell);
    }    
}