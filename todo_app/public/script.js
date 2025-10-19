

let token = localStorage.getItem('token')

let isLoading = false
let isAuthenticating = false
let isRegistration = false
let selectedTab = 'All'
let todos = []

const apiBase = '/'

// elements
const nav = document.querySelector('nav')
const header = document.querySelector('header')
const main = document.querySelector('main')
const navElements = document.querySelectorAll('.tab-button')
const authContent = document.getElementById('auth')
const textError = document.getElementById('error')
const email = document.getElementById('emailInput')
const password = document.getElementById('passwordInput')
const registerBtn = document.getElementById('registerBtn')
const authBtn = document.getElementById('authBtn')
const addTodoBtn = document.getElementById('addTodoBtn')
// const deleteBtn = document.getElementById('')
// const updateBtn = 

// PAGE RENDERING LOGIC
async function showDashboard() {
    nav.style.display = 'block'
    header.style.display = 'flex'
    main.style.display = 'flex'
    authContent.style.display = 'none'

    await fetchTodos()
}

function updateHeaderText() {
    const todosLength = todos.length
    const newString = todos.length === 1 ?
        `You have 1 open task.` :
        `You have ${todosLength} open tasks.`
    header.querySelector('h1').innerText = newString
}

function updateNavCount() {
    navElements.forEach(ele => {
        const btnText = ele.innerText.split(' ')[0]

        // filter todos in here
        const count = todos.filter(val => {
            if (btnText === 'All') {
                return true
            }
            return btnText === 'Complete' ?
                val.completed :
                !val.completed
        }).length

        // target inside space and update value
        ele.querySelector('span').innerText = `(${count})`
    })
}

function changeTab(tab) {
    selectedTab = tab
    navElements.forEach(val => {
        if (val.innerText.includes(tab)) {
            val.classList.add('selected-tab')
        } else {
            val.classList.remove('selected-tab')
        }
    })
    renderTodos()
}

function renderTodos() {
    // need to add filtering logic in here

    updateNavCount()
    updateHeaderText()

    let todoList = ``
    todos.filter(val => {
        return selectedTab === 'All' ? true : selectedTab === 'Complete' ? val.completed : !val.completed
    }).forEach((todo, todoIndex) => {
        const taskIndex = todo.id
        todoList += `
        <div class="card todo-item">
            <p>${todo.task}</p>
            <div class="todo-buttons">
                <button onclick="updateTodo(${taskIndex})" ${todo.completed ? 'disabled' : ''}>
                    <h6>Done</h6>
                </button>
                <button onclick="deleteTodo(${taskIndex})">
                    <h6>Delete</h6>
                </button>
            </div>
        </div>
        `
    })
    todoList += `
    <div class="input-container">
        <input id="todoInput" placeholder="Add task" />
        <button onclick="addTodo()">
            <i class="fa-solid fa-plus"></i>
        </button>
    </div>
    `
    main.innerHTML = todoList
}

// showDashboard()

// AUTH LOGIC

async function toggleIsRegister() {
    isRegistration = !isRegistration
    registerBtn.innerText = isRegistration ? 'Sign in' : 'Sign up'
    document.querySelector('#auth > div h2').innerText = isRegistration ? 'Sign Up' : 'Login'
    document.querySelector('.register-content p').innerText = isRegistration ? 'Already have an account?' : 'Don\'t have an account?'
    document.querySelector('.register-content button').innerText = isRegistration ? 'Sign in' : 'Sign up'
}

async function authenticate() {
    // access email and pass values
    const emailVal = email.value
    const passVal = password.value

    // guard clauses... if authenticating, return
    if (
        isLoading ||
        isAuthenticating ||
        !emailVal ||
        !passVal ||
        passVal.length < 6 ||
        !emailVal.includes('@')
    ) { return }

    // reset error and set isAuthenticating to true
    error.style.display = 'none'
    isAuthenticating = true
    authBtn.innerText = 'Authenticating...'

    try {
        let data
        if (isRegistration) {
            // register an account
            const response = await fetch(apiBase + 'auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: emailVal, password: passVal })
            })
            data = await response.json()
        } else {
            // login an account
            const response = await fetch(apiBase + 'auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: emailVal, password: passVal })
            })
            data = await response.json()
        }

        if (data.token) {
            token = data.token
            localStorage.setItem('token', token)

            // authenicating into loading
            authBtn.innerText = 'Loading...'

            // fetch todos
            await fetchTodos()

            // show dashboard
            showDashboard()
        } else {
            throw Error('❌ Failed to authenticate...')
        }

    } catch (err) {
        console.log(err.message)
        error.innerText = err.message
        error.style.display = 'block'
    } finally {
        authBtn.innerText = 'Submit'
        isAuthenticating = false
    }


}

function logout() {
    // wipe states and clear cached token
}

// CRUD LOGIC

async function fetchTodos() {
    isLoading = true
    const response = await fetch(apiBase + 'todos', {
        headers: { 'Authorization': token }
    })
    const todosData = await response.json()
    todos = todosData
    isLoading = false
    renderTodos()
}

async function updateTodo(index) {
    // set task complete status to true
    await fetch(apiBase + 'todos' + '/' + index, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({ task: todos.find(val => val.id === index).task, completed: 1 })
    })
    fetchTodos()
}

async function deleteTodo(index) {
    // set task complete status to true
    await fetch(apiBase + 'todos' + '/' + index, {
        method: 'DELETE',
        headers: {
            'Authorization': token
        },
    })
    fetchTodos()
}

async function addTodo() {
    // have to access this val later as it's rendered with js
    const todoInput = document.getElementById('todoInput')
    const task = todoInput.value

    if (!task) { return }

    await fetch(apiBase + 'todos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({ task })
    })
    todoInput.value = ''
    fetchTodos()
}

// UTILITY FUNCTIONS


// load page and read local storage for key

// default to login screen

// if is authenticated, show todo app
if (token) {
    async function run() {
        await fetchTodos()
        showDashboard()
    }
    run()
}