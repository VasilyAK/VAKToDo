/**
 * Определить, принадлежат ли даты к одному и тому же дню
 * @param {Date} date1 первая дата для сравнения
 * @param {Date} date2 вторая дата для сравнения
 * @return {Boolean} результат проверки
 */
export function isEqualDays(date1, date2) {
    const day1 = new Date(date1.getTime()).setHours(0, 0, 0, 0);
    const day2 = new Date(date2.getTime()).setHours(0, 0, 0, 0);

    return day1 === day2;
}

/**
 * Сортирует массив заданий по дате
 * @param {FullTask[]} taskList массив с заданиями
 * @return {FullTask[]} отсортированный по дате массив с заданиями
 */
export function sortTaskListByDate(taskList) {
    return taskList.sort((task1, task2) => {
        return (task2.date < task1.date) - (task1.date < task2.date);
    });
}

/**
 * Найти доступный идентификатор для нового задания
 * @param {FullTask[]} awaitingList список ожидающих элементов
 * @return {String} доступный идентификатор для нового задания
 */
export function findAvailableNewTaskId(awaitingList) {
    for (let index = 0; index < awaitingList.length; index++) {
        const awaitingItem = awaitingList.find(awaitingItem => {
            return Number(awaitingItem.id.replace('newTask', '')) === index;
        });

        if (!awaitingItem) {
            return `newTask${index}`;
        }
    }

    return `newTask${awaitingList.length}`;
}

/**
 * Сообщение об ошибке. Сервер вернул идентификатор задания, который не ожидает разрешения.
 * @param {String} id идентификатор задания
 * @return {String} текст ошибки
 */
export function taskErrorMessage(id) {
    return `Server returned the answer with task id ${id} which was not expected`;
}
