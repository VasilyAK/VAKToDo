/** @namespace ToDoTask */

/**
 * @typedef {String} TaskStatus
 * @example
 * 'done'       // задание выполнено
 * 'failed'     // задание провалено
 * 'expected'   // задание активно
 */

/**
 * @typedef {Object} TaskData
 * @property {String} id идентификатор задания
 * @property {Date} date дата задания
 * @property {String} taskText текст задания
 * @property {TaskStatus} status состояние задания
 */

/**
 * @memberof ToDoTask
 * @class
 * @classdesc класс "Задание"
 * @param {TaskData} taskData данные нового задания
 */
class Task {
    constructor({ id, date, taskText, status }) {
        /**
         * @type {String}
         * @description идентификатор задания
         */
        this.id = id;
        /**
         * @type {Date}
         * @description дата задания
         */
        this.date = date;
        /**
         * @type {String}
         * @description текст задания
         */
        this.taskText = taskText;
        /**
         * @type {TaskStatus}
         * @description состояние задания
         */
        this.status = status;
    }

    /**
     * @type {TaskData}
     * @description получить данные по заданию без идентификатора
     */
    get data() {
        const { date, taskText, status } = this;

        return { date, taskText, status };
    }

    /**
     * @type {TaskData}
     * @description получить все данные по заданию
     */
    get fullData() {
        const { id, date, taskText, status } = this;

        return { id, date, taskText, status };
    }
}

module.exports = Task;
