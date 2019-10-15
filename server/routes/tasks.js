const {
    CREATE_TODO_TASK,
    CHANGE_TODO_TASK,
    DONE_TODO_TASK,
    DELETE_TODO_TASK,
    GET_TODO_TASKS_FOR_DATE,
} = require('../actionTypes/toDoList');
const app = require('express').Router();
const TaskSchema = require('../models/TaskSchema');
const Task = require('../classes/toDoList/Task');

/**
 * Сохранить в базу новое задание
 * @param {TaskData} taskData данные нового задания
 * @return {Promise<TaskData|undefined>}
 * @memberof ToDoTask
 */
async function saveTask(taskData) {
    const savedTask = await new TaskSchema(taskData).save();
    return new Task(savedTask).fullData;
}

/**
 * Создать в базе набор тестовых заданий за текущую дату
 * @return {Promise<TaskData[]>}
 * @memberof ToDoTask
 */
function createTestData() {
    return new Promise(async (res, rej) => {
        const promises = [];

        TaskSchema.getTestData().forEach(taskData => {
            promises.push(saveTask(taskData));
        });

        const response = await Promise.all(promises);

        response ? res(response) : rej(new Error('Test tasks was not created'));
    });
}

app.post('/', async (req, res) => {
    const { type, payload } = req.body;

    switch (type) {
        // сохранить в базу новое задание
        case CREATE_TODO_TASK: {
            const newTask = new Task(payload).data;
            const result = await saveTask(newTask);

            if (result) {
                res.json({ id: result.id });
            } else {
                res.send({ err: `Task ${newTask.id} not created` });
            }

            break;
        }

        // изменить задание
        case CHANGE_TODO_TASK: {
            const updatedTask = new Task(payload).data;
            const result = await TaskSchema.updateOne({ _id: updatedTask.id }, updatedTask);

            if (result.nModified) {
                res.json({ id: updatedTask.id });
            } else {
                res.send({ err: `Task ${updatedTask.id} not found` });
            }

            break;
        }

        // перевести задание в состояние "done"
        case DONE_TODO_TASK: {
            const result = await TaskSchema.updateOne({ _id: payload }, { status: 'done' });

            if (result.nModified) {
                res.json({ id: payload });
            } else {
                res.send({ err: `Task ${payload} not found` });
            }

            break;
        }

        // удалить задание
        case DELETE_TODO_TASK: {
            const result = await TaskSchema.deleteOne({ _id: payload });

            if (result.ok) {
                res.json({ id: payload });
            } else {
                res.send({ err: `Task ${payload} not found` });
            }

            break;
        }

        // получить список заданий за дату
        case GET_TODO_TASKS_FOR_DATE: {
            const from = new Date(new Date(payload).setHours(0, 0, 0, 0));
            const to = new Date(new Date(payload).setHours(24, 0, 0, 0));
            const today = new Date().setHours(0, 0, 0, 0);
            let taskList = await TaskSchema.find()
                .where('date')
                .gte(from)
                .lte(to);

            taskList = taskList.map(taskData => new Task(taskData).fullData);

            if (taskList.length) {
                res.json(taskList);
            } else if (from === today) {
                const testTaskList = await createTestData();

                res.json(testTaskList);
            } else {
                res.json([]);
            }

            break;
        }

        default:
            res.send({ err: 'Unknown action' });
            break;
    }
});

module.exports = app;
