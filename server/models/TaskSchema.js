const mongoose = require('mongoose');
const Task = require('../classes/toDoList/Task');
const Schema = mongoose.Schema;

/**
 * Установить статус задания
 * @param {Date} date задания
 * @return {TaskStatus} статус задания
 * @memberof ToDoTask
 */
function setTaskStatus(date) {
    return new Date() > date ? 'failed' : 'expected';
}

const taskSchema = new Schema({
    date: { type: Date },
    taskText: { type: String },
    status: { type: String },
});

/**
 * Получить тестовые данные для заполнения пустой бд
 * @return {Task[]}
 * @memberof ToDoTask
 */
function getTestData() {
    const time10 = new Date(new Date().setHours(10, 0, 0, 0));
    const time11 = new Date(new Date().setHours(11, 0, 0, 0));
    const time12 = new Date(new Date().setHours(12, 0, 0, 0));
    const time13 = new Date(new Date().setHours(13, 0, 0, 0));
    const time14 = new Date(new Date().setHours(14, 0, 0, 0));

    return (testData = [
        new Task({
            date: time10,
            taskText: 'Позавтракать',
            status: setTaskStatus(time10),
        }).data,
        new Task({
            date: time11,
            taskText: 'Погулять с собакой',
            status: setTaskStatus(time11),
        }).data,
        new Task({
            date: time12,
            taskText: 'Помыть полы',
            status: setTaskStatus(time12),
        }).data,
        new Task({
            date: time13,
            taskText: 'Купить продукты',
            status: setTaskStatus(time13),
        }).data,
        new Task({
            date: time14,
            taskText: 'Помыть посуду',
            status: setTaskStatus(time14),
        }).data,
    ]);
}

taskSchema.statics.getTestData = getTestData;

module.exports = mongoose.model('TaskSchema', taskSchema, 'Tasks');
