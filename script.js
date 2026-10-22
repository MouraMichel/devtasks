
/* ==========================================
   DEVTASKS 2.0
   Gerenciamento de tarefas
========================================== */

// Lista de tarefas salva no navegador
let tasks = JSON.parse(localStorage.getItem("devtasks")) || [];

// Filtro selecionado
let currentFilter = "todas";

// ID da tarefa que está sendo editada
let editingTaskId = null;

// ==========================================
// ELEMENTOS DO HTML
// ==========================================

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const filterButtons = document.querySelectorAll(".filter-btn");

const taskFormTitle = document.getElementById("taskFormTitle");
const submitTaskButton = document.getElementById("submitTaskButton");
const cancelEditButton = document.getElementById("cancelEditButton");

// ==========================================
// ADICIONAR E EDITAR TAREFAS
// ==========================================

taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = taskTitle.value.trim();
    const priority = taskPriority.value;

    if (title === "") {
        alert("Digite uma tarefa.");
        taskTitle.focus();
        return;
    }

    if (editingTaskId !== null) {
        tasks = tasks.map(function(task) {
            if (task.id === editingTaskId) {
                return {
                    ...task,
                    title: title,
                    priority: priority
                };
            }

            return task;
        });
    } else {
        const newTask = {
            id: Date.now(),
            title: title,
            priority: priority,
            completed: false
        };

        tasks.push(newTask);
    }

    saveTasks();
    resetTaskForm();
    renderTasks();
});

// ==========================================
// SALVAR TAREFAS
// ==========================================

function saveTasks() {
    localStorage.setItem("devtasks", JSON.stringify(tasks));
}

// ==========================================
// INICIAR EDIÇÃO
// ==========================================

function startEditingTask(id) {
    const task = tasks.find(function(item) {
        return item.id === id;
    });

    if (!task) {
        return;
    }

    editingTaskId = task.id;

    taskTitle.value = task.title;
    taskPriority.value = task.priority;

    taskFormTitle.textContent = "Editar tarefa";
    submitTaskButton.textContent = "Salvar alterações";
    cancelEditButton.hidden = false;

    taskTitle.focus();
}

// ==========================================
// RESTAURAR FORMULÁRIO
// ==========================================

function resetTaskForm() {
    editingTaskId = null;

    taskForm.reset();

    taskFormTitle.textContent = "Adicionar nova tarefa";
    submitTaskButton.textContent = "+ Adicionar tarefa";
    cancelEditButton.hidden = true;
}

// Cancelar edição
cancelEditButton.addEventListener("click", function() {
    resetTaskForm();
});

// ==========================================
// MOSTRAR TAREFAS
// ==========================================

function renderTasks() {
    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(function(task) {
        if (currentFilter === "pendentes") {
            return !task.completed;
        }

        if (currentFilter === "concluidas") {
            return task.completed;
        }

        return true;
    });

    if (filteredTasks.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }

    filteredTasks.forEach(function(task) {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });

    updateStatistics();
}

// ==========================================
// CRIAR ELEMENTO DA TAREFA
// ==========================================

function createTaskElement(task) {
    const article = document.createElement("article");
    article.classList.add("task");

    if (task.completed) {
        article.classList.add("completed");
    }

    const taskInfo = document.createElement("div");
    taskInfo.classList.add("task-info");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("task-checkbox");
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Concluir tarefa: " + task.title);

    checkbox.addEventListener("change", function() {
        toggleTask(task.id);
    });

    const title = document.createElement("span");
    title.classList.add("task-title");
    title.textContent = task.title;

    const priority = document.createElement("span");
    priority.classList.add("priority", "priority-" + task.priority);
    priority.textContent = formatPriority(task.priority);

    taskInfo.append(checkbox, title, priority);

    const actions = document.createElement("div");
    actions.classList.add("task-actions");

    const editButton = document.createElement("button");
    editButton.type = "button";
    editButton.classList.add("btn-edit");
    editButton.textContent = "Editar";
    editButton.setAttribute("aria-label", "Editar tarefa: " + task.title);

    editButton.addEventListener("click", function() {
        startEditingTask(task.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.classList.add("btn-delete");
    deleteButton.textContent = "Excluir";
    deleteButton.setAttribute("aria-label", "Excluir tarefa: " + task.title);

    deleteButton.addEventListener("click", function() {
        deleteTask(task.id);
    });

    actions.append(editButton, deleteButton);
    article.append(taskInfo, actions);

    return article;
}

// ==========================================
// FORMATAR PRIORIDADE
// ==========================================

function formatPriority(priority) {
    if (priority === "baixa") {
        return "Baixa";
    }

    if (priority === "media") {
        return "Média";
    }

    if (priority === "alta") {
        return "Alta";
    }

    return priority;
}

// ==========================================
// CONCLUIR OU REABRIR TAREFA
// ==========================================

function toggleTask(id) {
    tasks = tasks.map(function(task) {
        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

// ==========================================
// EXCLUIR TAREFA
// ==========================================

function deleteTask(id) {
    const confirmation = confirm(
        "Deseja realmente excluir esta tarefa?"
    );

    if (!confirmation) {
        return;
    }

    tasks = tasks.filter(function(task) {
        return task.id !== id;
    });

    if (editingTaskId === id) {
        resetTaskForm();
    }

    saveTasks();
    renderTasks();
}

// ==========================================
// ESTATÍSTICAS
// ==========================================

function updateStatistics() {
    const total = tasks.length;

    const completed = tasks.filter(function(task) {
        return task.completed;
    }).length;

    const pending = tasks.filter(function(task) {
        return !task.completed;
    }).length;

    totalTasks.textContent = total;
    pendingTasks.textContent = pending;
    completedTasks.textContent = completed;
}

// ==========================================
// FILTROS
// ==========================================

filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        currentFilter = button.dataset.filter;

        filterButtons.forEach(function(item) {
            item.classList.remove("active");
        });

        button.classList.add("active");
        renderTasks();
    });
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================

resetTaskForm();
renderTasks();
