const jwtDecode = require("jwt-decode")
const ROOT_PATH = "http://localhost:3000"
let accessToken = localStorage.getItem("token") || null

exports.getAllQuestions = function (callback) {
    const request = new XMLHttpRequest()
    request.open("GET", ROOT_PATH + "/questions")
    request.send()
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 200:
                const bodyAsString = request.responseText
                const questions = JSON.parse(bodyAsString)
                callback([], questions)
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

exports.getQuestionById = function (id, callback) {
    const request = new XMLHttpRequest()
    request.open("GET", ROOT_PATH + "/questions/" + id)
    request.send()
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 200:
                const bodyAsString = request.responseText
                const question = JSON.parse(bodyAsString)
                callback([], question)
                break
            case 404:
                callback(["Question is not found"])
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

exports.createQuestion = function (title, description, callback) {
    const question = {
        title,
        description
    }
    const request = new XMLHttpRequest()
    request.open("POST", ROOT_PATH + "/questions")
    request.setRequestHeader("Content-Type", "application/json")
    request.setRequestHeader("Authorization", "Bearer " + accessToken)
    request.send(JSON.stringify(question))
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 201:
                const location = request.getResponseHeader("Location")
                const id = parseInt(location.substr("/questions/".length))
                callback([], id)
                break
            case 400:
                const errors = JSON.parse(request.responseText)
                callback(errors)
                break
            case 401:
                callback(["Unauthorized"])
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

module.exports.signOut = function (callback) {
    accessToken = null
    localStorage.removeItem("token")
    callback()
}

module.exports.signUp = function (username, name, password, callback) {
    const bodyToSend = {
        username,
        name,
        password,
    }
    const request = new XMLHttpRequest()
    request.open("POST", ROOT_PATH + "/accounts")
    request.setRequestHeader("Content-Type", "application/json")
    request.send(JSON.stringify(bodyToSend))
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 201:
                const location = request.getResponseHeader("Location")
                const id = parseInt(location.substr("/accounts/".length))
                callback([], id)
                break
            case 400:
                const errors = JSON.parse(request.responseText)
                callback(errors)
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

exports.signIn = function (username, password, callback) {
    const data = {
        username,
        password,
        grant_type: "password"
    }
    const request = new XMLHttpRequest()
    request.open("POST", ROOT_PATH + "/tokens")
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
    const bodyToSend = new URLSearchParams()
    for (const key of Object.keys(data))
        bodyToSend.append(key, data[key])
    request.send(bodyToSend.toString())
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 200:
                const body = JSON.parse(request.responseText)
                localStorage.setItem("token", body.access_token) // store the token in localstorage
                accessToken = body.access_token
                const payload = jwtDecode(body.id_token)
                const signedAccount = {
                    id: payload.sub,
                    username: payload.preferred_username,
                    displayName: payload.name
                }
                callback([], signedAccount)
                break
            case 400:
                const error = JSON.parse(request.responseText).error
                if (error == "invalid_request")
                    callback(["Username and password are required."])
                else if (error == "invalid_client")
                    callback(["Username or password is incorrect."])
                else
                    callback(["Unknown 400 error"])
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

exports.getAnswersByQuestionId = function (id, callback) {
    const request = new XMLHttpRequest()
    request.open("GET", ROOT_PATH + "/questions/" + id + "/answers")
    request.send()
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 200:
                const bodyAsString = request.responseText
                const answers = JSON.parse(bodyAsString)
                callback([], answers)
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

exports.createAnswer = function (questionId, description, callback) {
    const answer = {
        questionId,
        description
    }
    const request = new XMLHttpRequest()
    request.open("POST", ROOT_PATH + "/answers")
    request.setRequestHeader("Content-Type", "application/json")
    request.setRequestHeader("Authorization", "Bearer " + accessToken)
    request.send(JSON.stringify(answer))
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 201:
                const location = request.getResponseHeader("Location")
                const id = parseInt(location.substr("/answers/".length))
                callback([], id)
                break
            case 400:
                const errors = JSON.parse(request.responseText)
                callback(errors)
                break
            case 401:
                callback(["Unauthorized"])
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

exports.editQuestion = function (questionId, title, description, callback) {
    const question = {
        title,
        description,
    }
    const request = new XMLHttpRequest()
    request.open("PUT", ROOT_PATH + "/questions/" + questionId)
    request.setRequestHeader("Content-Type", "application/json")
    request.setRequestHeader("Authorization", "Bearer " + accessToken)
    request.send(JSON.stringify(question))
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 204:
                callback([])
                break
            case 400:
                const errors = JSON.parse(request.responseText)
                callback(errors)
                break
            case 401:
                callback(["Unauthorized"])
                break
            case 404:
                callback(["Question is not found"])
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

exports.deleteQuestion = function (questionId, callback) {
    const request = new XMLHttpRequest()
    request.open("DELETE", ROOT_PATH + "/questions/" + questionId)
    request.setRequestHeader("Content-Type", "application/json")
    request.setRequestHeader("Authorization", "Bearer " + accessToken)
    request.send()
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 204:
                callback([])
                break
            case 401:
                callback(["Unauthorized"])
                break
            case 404:
                callback(["Question is not found"])
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

exports.deleteAnswer = function (answerId, callback) {
    const request = new XMLHttpRequest()
    request.open("DELETE", ROOT_PATH + "/answers/" + answerId)
    request.setRequestHeader("Content-Type", "application/json")
    request.setRequestHeader("Authorization", "Bearer " + accessToken)
    request.send()
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 204:
                callback([])
                break
            case 401:
                callback(["Unauthorized"])
                break
            case 404:
                callback(["Answer is not found"])
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

exports.getAnswerById = function (id, callback) {
    const request = new XMLHttpRequest()
    request.open("GET", ROOT_PATH + "/answers/" + id)
    request.send()
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 200:
                const bodyAsString = request.responseText
                const answer = JSON.parse(bodyAsString)
                callback([], answer)
                break
            case 404:
                callback(["Answer is not found"])
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

exports.editAnswer = function (answerId, description, callback) {
    const answer = {
        description,
    }
    const request = new XMLHttpRequest()
    request.open("PUT", ROOT_PATH + "/answers/" + answerId)
    request.setRequestHeader("Content-Type", "application/json")
    request.setRequestHeader("Authorization", "Bearer " + accessToken)
    request.send(JSON.stringify(answer))
    request.addEventListener("load", () => {
        const status = request.status
        console.log(status)
        switch (status) {
            case 204:
                callback([])
                break
            case 400:
                const errors = JSON.parse(request.responseText)
                callback(errors)
                break
            case 401:
                callback(["Unauthorized"])
                break
            case 404:
                callback(["Answer is not found"])
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

exports.getQuestionsByAccountId = function (id, callback) {
    const request = new XMLHttpRequest()
    request.open("GET", ROOT_PATH + "/accounts/" + id + "/questions")
    request.send()
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 200:
                const bodyAsString = request.responseText
                const questions = JSON.parse(bodyAsString)
                callback([], questions)
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

exports.getAnswersByAccountId = function (id, callback) {
    const request = new XMLHttpRequest()
    request.open("GET", ROOT_PATH + "/accounts/" + id + "/answers")
    request.send()
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 200:
                const bodyAsString = request.responseText
                const answers = JSON.parse(bodyAsString)
                callback([], answers)
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

exports.getAccountById = function (id, callback) {
    const request = new XMLHttpRequest()
    request.open("GET", ROOT_PATH + "/accounts/" + id)
    request.send()
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 200:
                const bodyAsString = request.responseText
                const account = JSON.parse(bodyAsString)
                callback([], account)
                break
            case 404:
                callback(["Account is not found"])
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}

exports.editAccount = function (accountId, name, callback) {
    const account = {
        name
    }
    const request = new XMLHttpRequest()
    request.open("PUT", ROOT_PATH + "/accounts/" + accountId)
    request.setRequestHeader("Content-Type", "application/json")
    request.setRequestHeader("Authorization", "Bearer " + accessToken)
    request.send(JSON.stringify(account))
    request.addEventListener("load", () => {
        const status = request.status
        switch (status) {
            case 204:
                callback([])
                break
            case 400:
                const errors = JSON.parse(request.responseText)
                callback(errors)
                break
            case 401:
                callback(["Unauthorized"])
                break
            case 404:
                callback(["Account is not found"])
                break
            case 500:
                callback(["Unknown server error"])
                break
            default:
                callback(["Unknown server error"])
        }
    })
    request.addEventListener("error", function () {
        callback(["Connection Refused!"])
    })
}