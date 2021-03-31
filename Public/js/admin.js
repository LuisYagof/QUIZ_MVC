// ----------------------------------------------------------WELCOME

function readQuest() {
        fetch("/questions", {
            headers: {
                'authorization': `Bearer: ${sessionStorage.getItem('token')}`
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.status == 200){
                data.data.map(el => printData(el))
            }
            if (data.status == 401){
                alert(data.data)
                setTimeout(window.location.href = data.url, 1500)
            }
            if (data.status == 500){
                alert(data.data)
            }
        })
        .catch(err => console.log("Internal server error. Sorry :(", err))
}

function printData(element) {
    let questBox = document.createElement("div")
    questBox.setAttribute("class", "questBox")
    document.querySelector(".wrapperResult")
    .appendChild(questBox)
        
    let quest = document.createElement("h3")
    let questCon = document.createTextNode(element.qu)
    quest.appendChild(questCon)
    questBox.appendChild(quest)
    
    let btnBox = document.createElement("div")
    btnBox.setAttribute("class", "btnBox")
    questBox.appendChild(btnBox)
        
    let edit = document.createElement("button")
    let editCon = document.createTextNode("Editar")
    edit.appendChild(editCon)
    btnBox.appendChild(edit)
    edit.addEventListener("click", () => {
        printDetailEdit(element)
    })

    let erase = document.createElement("button")
    let eraseCon = document.createTextNode("Eliminar")
    erase.appendChild(eraseCon)
    btnBox.appendChild(erase)
    erase.addEventListener("click", () => {
        if (confirm("¿Seguro que quieres borrar esta pregunta?")) {
            deleteQuestion(element.qu)
        }
    })
}

readQuest();

// ----------------------------------------------------------LOGOUT

document.querySelector("#logout")
    .addEventListener("click", () => logout() )
    
function logout() {
    fetch("/logout", {
        method: 'PUT',
        headers: {
            'authorization': `Bearer: ${sessionStorage.getItem('token')}`
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status == 200){
            alert(data.data)
            setTimeout(window.location.href = data.url, 1500)
        }
        if (data.status == 400){
            alert(data.data)
            setTimeout(window.location.href = data.url, 1500)
        }
        if (data.status == 401){
            alert(data.data)
            setTimeout(window.location.href = data.url, 1500)
        }
        if (data.status == 500){
            alert(data.data)
        }
    })
    .catch(err => console.log("Internal server error. Sorry :(", err))
}

//  ----------------------------------------------------------ADD QUEST

document.querySelector("#crear")
    .addEventListener("click", printDetailNewQ)

function removeWrapper() {
    document.querySelector(".wrapperResult")
        .querySelectorAll("*")
        .forEach(el => el.remove())
}

function printDetailNewQ(){
    removeWrapper();

    let title = document.createElement("h4")
    let titleCon = document.createTextNode("Añade una pregunta nueva")
    title.appendChild(titleCon)
    document.querySelector(".wrapperResult")
        .appendChild(title)

    let question = document.createElement("input")
    question.setAttribute("placeholder", "Título de la pregunta")
    question.setAttribute("required", "")
    document.querySelector(".wrapperResult")
        .appendChild(question)

    let answ1 = document.createElement("input")
    answ1.setAttribute("placeholder", "Primera respuesta")
    document.querySelector(".wrapperResult")
        .appendChild(answ1)

    let answ2 = document.createElement("input")
    answ2.setAttribute("placeholder", "Segunda respuesta")
    document.querySelector(".wrapperResult")
        .appendChild(answ2)

    let answ3 = document.createElement("input")
    answ3.setAttribute("placeholder", "Tercera respuesta")
    document.querySelector(".wrapperResult")
        .appendChild(answ3)

    let answ4 = document.createElement("input")
    answ4.setAttribute("placeholder", "Cuarta respuesta")
    document.querySelector(".wrapperResult")
        .appendChild(answ4)
    
    let selectorBox = document.createElement("div")
    document.querySelector(".wrapperResult").appendChild(selectorBox)

    let selector = document.createElement("select")
    selector.setAttribute("id", "selector")
    selectorBox.appendChild(selector)

    let selectorLab = document.createElement("label")
    selectorLab.setAttribute("for", "selector")
    selectorLab.innerText = "Respuesta correcta"
    selectorBox.appendChild(selectorLab)

    let opt1 = document.createElement("option")
    opt1.setAttribute("value", 0)
    let opt1Cont = document.createTextNode("1")
    opt1.appendChild(opt1Cont)
    selector.appendChild(opt1)

    let opt2 = document.createElement("option")
    opt2.setAttribute("value", 1)
    let opt2Cont = document.createTextNode("2")
    opt2.appendChild(opt2Cont)
    selector.appendChild(opt2)

    let opt3 = document.createElement("option")
    opt3.setAttribute("value", 2)
    let opt3Cont = document.createTextNode("3")
    opt3.appendChild(opt3Cont)
    selector.appendChild(opt3)

    let opt4 = document.createElement("option")
    opt4.setAttribute("value", 3)
    let opt4Cont = document.createTextNode("4")
    opt4.appendChild(opt4Cont)
    selector.appendChild(opt4)

    let btnBox = document.createElement("div")
    document.querySelector(".wrapperResult").appendChild(btnBox)

    let send = document.createElement("button")
    let sendCont = document.createTextNode("Añadir")
    send.appendChild(sendCont)
    btnBox.appendChild(send)
    send.addEventListener("click", () => {
        if (question.value == "" || answ1.value == "" || answ2.value == "" || answ3.value == "" || answ4.value == "" ){
            alert("La pregunta debe tener contenidos")
        } else {
            addQuestionToDB(question.value, answ1.value, answ2.value, answ3.value, answ4.value, Number(selector.value))
        }
    })

    let back = document.createElement("button")
    let backCont = document.createTextNode("Atrás")
    back.appendChild(backCont)
    btnBox.appendChild(back)
    back.addEventListener("click", () => {
        removeWrapper();
        readQuest();
    })
}

function addQuestionToDB(qu, an1, an2, an3, an4, corr) {
    fetch("/add", {
        method: 'POST',
        body: JSON.stringify( {qu: qu, an: [an1, an2, an3, an4], ok: corr} ),
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status == 200){
            alert(data.data)
            setTimeout(window.location.href = data.url, 1500)
        }
        if (data.status == 400){
            alert(data.data)
        }
        if (data.status == 500){
            alert(data.data)
        }
    })
    .catch(err => console.log("Internal server error. Sorry :(", err))
}

//  ----------------------------------------------------------DELETE QUEST

function deleteQuestion(questionTitle) {
    fetch("/delete", {
        method: 'DELETE',
        body: JSON.stringify( { qu: questionTitle } ),
        headers: {
            'Content-Type': "application/json"
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status == 200){
            alert(data.data)
            setTimeout(window.location.href = data.url, 1500)
        }
        if (data.status == 500){
            alert(data.data)
        }
    })
    .catch(err => console.log("Internal server error. Sorry :(", err))
}

//  ----------------------------------------------------------EDIT QUEST

function printDetailEdit(element){
    removeWrapper();

    let title = document.createElement("h4")
    let titleCon = document.createTextNode("Edita esta pregunta")
    title.appendChild(titleCon)
    document.querySelector(".wrapperResult")
        .appendChild(title)

    let question = document.createElement("h5")
    question.innerText = element.qu
    document.querySelector(".wrapperResult")
        .appendChild(question)

    let answ1 = document.createElement("input")
    answ1.setAttribute("value", element.an[0])
    document.querySelector(".wrapperResult")
        .appendChild(answ1)

    let answ2 = document.createElement("input")
    answ2.setAttribute("value", element.an[1])
    document.querySelector(".wrapperResult")
        .appendChild(answ2)

    let answ3 = document.createElement("input")
    answ3.setAttribute("value", element.an[2])
    document.querySelector(".wrapperResult")
        .appendChild(answ3)

    let answ4 = document.createElement("input")
    answ4.setAttribute("value", element.an[3])
    document.querySelector(".wrapperResult")
        .appendChild(answ4)
    
    let selectorBox = document.createElement("div")
    document.querySelector(".wrapperResult").appendChild(selectorBox)

    let selector = document.createElement("select")
    selector.setAttribute("id", "selector")
    selectorBox.appendChild(selector)

    let selectorLab = document.createElement("label")
    selectorLab.setAttribute("for", "selector")
    selectorLab.innerText = "Respuesta correcta"
    selectorBox.appendChild(selectorLab)

    let opt1 = document.createElement("option")
    opt1.setAttribute("value", 0)
    let opt1Cont = document.createTextNode("1")
    opt1.appendChild(opt1Cont)
    selector.appendChild(opt1)

    let opt2 = document.createElement("option")
    opt2.setAttribute("value", 1)
    let opt2Cont = document.createTextNode("2")
    opt2.appendChild(opt2Cont)
    selector.appendChild(opt2)

    let opt3 = document.createElement("option")
    opt3.setAttribute("value", 2)
    let opt3Cont = document.createTextNode("3")
    opt3.appendChild(opt3Cont)
    selector.appendChild(opt3)

    let opt4 = document.createElement("option")
    opt4.setAttribute("value", 3)
    let opt4Cont = document.createTextNode("4")
    opt4.appendChild(opt4Cont)
    selector.appendChild(opt4)

    let btnBox = document.createElement("div")
    document.querySelector(".wrapperResult").appendChild(btnBox)

    
    let send = document.createElement("button")
    let sendCont = document.createTextNode("Editar")
    send.appendChild(sendCont)
    btnBox.appendChild(send)
    send.addEventListener("click", () => {
        if (answ1.value == "" || answ2.value == "" || answ3.value == "" || answ4.value == "" ){
            alert("La pregunta debe tener contenidos")
        } else {
            editQuestionDB(element.qu, answ1.value, answ2.value, answ3.value, answ4.value, Number(selector.value))
        }
    })

    let back = document.createElement("button")
    let backCont = document.createTextNode("Atrás")
    back.appendChild(backCont)
    btnBox.appendChild(back)
    back.addEventListener("click", () => {
        removeWrapper();
        readQuest();
    })
}

function editQuestionDB(qu, an1, an2, an3, an4, corr) {
    fetch("/edit", {
        method: 'PUT',
        body: JSON.stringify( {qu: qu, an: [an1, an2, an3, an4], ok: corr} ),
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status == 200){
            alert(data.data)
            setTimeout(window.location.href = data.url, 1500)
        }
        if (data.status == 400){
            alert(data.data)
            setTimeout(window.location.href = data.url, 1500)
        }
        if (data.status == 500){
            alert(data.data)
        }
    })
    .catch(err => console.log("Internal server error. Sorry :(", err))
}