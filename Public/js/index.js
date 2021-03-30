document.querySelector("#admin")
    .addEventListener("click", getLogin)

function getLogin() {
    fetch("/login")
    .then(res => window.location.href = res.url)
    .catch(err => console.log("Internal server error. Sorry :(", err))
}

document.querySelector(".enterButton")
    .addEventListener("click", getTest)

function getTest() {
    fetch("/test")
    .then(res => window.location.href = res.url)
    .catch(err => console.log("Internal server error. Sorry :(", err))
}