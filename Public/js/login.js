const INPUTmail = document.querySelector("#email")
const INPUTpass = document.querySelector("#password")

// ---------------------------------------------SIGN UP  

document.querySelector("#log")
    .addEventListener("click", () => login() )
    
function login() {
    fetch("/login", {
        method: 'POST',
        body: JSON.stringify( {email: INPUTmail.value, pass: INPUTpass.value} ),
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(res => res.json())
    .then(data => {
        if (data.status == 200){
            alert("Datos correctos. Entrando en área administrador")
            sessionStorage.setItem("token", data.token)
            setTimeout(window.location.href = data.url, 1500)
        }
        if (data.status == 401){
            alert(data.data)
        }
        if (data.status == 406){
            alert(data.data)
        }
        if (data.status == 500){
            alert(data.data)
        }
    })
    .catch(err => console.log("Internal server error. Sorry :(", err))
}

// ---------------------------------------------VOLVER

document.querySelector("#back")
    .addEventListener("click", () => goBack())
    
function goBack() {
    fetch("/")
    .then(res => window.location.href = res.url)
    .catch(err => console.log("Internal server error. Sorry :(", err))
}