const taskInput = document.getElementById("taskInput");
const pendingDiv = document.getElementById("tasksPendingDiv");
const completedDiv = document.getElementById("tasksCompletedDiv");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function createTaskElement(taskObj, index) {
    const task = document.createElement("div");
    task.className = "task";

    const p = document.createElement("p");
    p.textContent = taskObj.text;

    const doneBtn = document.createElement("button");
    doneBtn.textContent = "Mark as done";
    doneBtn.className = "doneBtn";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "❌";
    deleteBtn.className = "deleteBtn";

    task.appendChild(p);

    if (!taskObj.completed) {
        task.appendChild(doneBtn);
    }

    task.appendChild(deleteBtn);

    if (taskObj.completed) {
        completedDiv.appendChild(task);
    } else {
        pendingDiv.appendChild(task);
    }

    doneBtn.onclick = function () {
        tasks[index].completed = true;
        saveTasks();
        renderTasks();
    };

    deleteBtn.onclick = function () {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    };
}

function renderTasks() {
    pendingDiv.innerHTML = "";
    completedDiv.innerHTML = "";

    tasks.forEach((task, index) => {
        createTaskElement(task, index);
    });
}

function addTask() {
    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task.");
        return;
    }

    tasks.push({
        text: taskText,
        completed: false
    });

    saveTasks();
    renderTasks();

    taskInput.value = "";
}

taskInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

renderTasks();  