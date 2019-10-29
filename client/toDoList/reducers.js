import aTypes from './actionTypes';
import Pending from '~/classes/Pending';
import { isEqualDays, sortTaskListByDate, findAvailableNewTaskId, taskErrorMessage } from '~/toDoList/helpers';

const pendingItems = {
    createItems: new Pending(),
    changeItems: new Pending(),
    doneItems: new Pending(),
    deleteItems: new Pending(),
};

const initMutableItem = {
    id: null,
    date: null,
    taskText: '',
};

const initState = {
    newTaskId: findAvailableNewTaskId(pendingItems.createItems.items),
    selectedTasksDate: new Date(),
    mutableItem: { ...initMutableItem },
    toDoTaskList: [],
    err: null,
};

const reducersToDoList = (state = initState, { type, payload }, gl = pendingItems) => {
    switch (type) {
        // запрос на создание нового задания вернул новое задание
        case aTypes.CREATE_TODO_TASK: {
            gl.createItems = gl.createItems.add(payload);

            if (isEqualDays(state.selectedTasksDate, payload.date)) {
                const mutableItem = { ...initMutableItem };
                let toDoTaskList = [...state.toDoTaskList];

                toDoTaskList.push(payload);
                toDoTaskList = sortTaskListByDate(toDoTaskList);

                return {
                    ...state,
                    newTaskId: findAvailableNewTaskId(gl.createItems.items),
                    mutableItem,
                    toDoTaskList,
                    err: null,
                };
            }

            return {
                ...state,
                newTaskId: findAvailableNewTaskId(gl.createItems.items),
                err: null,
            };
        }

        case aTypes.CREATE_TODO_TASK_FULFILLED: {
            const { id, newId } = payload;
            const awaitingItem = gl.createItems.findById(id);
            let toDoTaskList = [...state.toDoTaskList];

            if (awaitingItem !== null) {
                if (isEqualDays(state.selectedTasksDate, awaitingItem.date)) {
                    toDoTaskList = toDoTaskList.map(task => {
                        if (task.id === id) {
                            task.id = newId;
                        }

                        return task;
                    });
                }

                gl.createItems = gl.createItems.resolve(id);

                return {
                    ...state,
                    newTaskId: findAvailableNewTaskId(gl.createItems.items),
                    toDoTaskList,
                    err: null,
                };
            } else {
                console.log(taskErrorMessage(id));
            }

            return { ...state, err: null };
        }

        // запрос на создание нового задания вернул ошибку
        case aTypes.CREATE_TODO_TASK_REJECTED: {
            const { id, err } = payload;
            const awaitingItem = gl.createItems.findById(id);
            let toDoTaskList = [...state.toDoTaskList];

            if (awaitingItem !== null) {
                if (isEqualDays(state.selectedTasksDate, awaitingItem.date)) {
                    toDoTaskList = toDoTaskList.reduce((result, task) => {
                        if (task.id !== id) {
                            result.push(task);
                        }

                        return result;
                    }, []);
                }

                gl.createItems = gl.createItems.resolve(id);

                return {
                    ...state,
                    newTaskId: findAvailableNewTaskId(gl.createItems.items),
                    toDoTaskList,
                    err: err,
                };
            } else {
                console.log(taskErrorMessage(id));
            }

            return { ...state, toDoTaskList, err };
        }

        // запрос на изменение задания вернул измененное задание
        case aTypes.CHANGE_TODO_TASK: {
            const { id, date } = payload;
            const mutableItem = { ...initMutableItem };
            let toDoTaskList = state.toDoTaskList.reduce((result, task) => {
                if (task.id === id) {
                    if (isEqualDays(state.selectedTasksDate, date)) {
                        result.push(payload);
                    }

                    gl.changeItems = gl.changeItems.add({
                        ...task,
                        _changes: payload,
                    });
                } else {
                    result.push(task);
                }

                return result;
            }, []);

            return { ...state, mutableItem, toDoTaskList, err: null };
        }

        case aTypes.CHANGE_TODO_TASK_FULFILLED: {
            const { id } = payload;

            gl.changeItems = gl.changeItems.resolve(id);

            return { ...state, err: null };
        }

        // запрос на изменение задания вернул ошибку
        case aTypes.CHANGE_TODO_TASK_REJECTED: {
            const { id, err } = payload;
            const awaitingItem = gl.changeItems.findById(id);
            let toDoTaskList = [...state.toDoTaskList];

            if (awaitingItem !== null) {
                if (isEqualDays(state.selectedTasksDate, awaitingItem.date)) {
                    const awaitingItemWithoutChanges = { ...awaitingItem };
                    let isTaskRestored = false;

                    delete awaitingItemWithoutChanges._changes;

                    toDoTaskList = toDoTaskList.map(task => {
                        if (task.id === awaitingItem.id) {
                            isTaskRestored = true;

                            return awaitingItemWithoutChanges;
                        }

                        return task;
                    });

                    if (!isTaskRestored) {
                        toDoTaskList.push(awaitingItemWithoutChanges);
                    }

                    toDoTaskList = sortTaskListByDate(toDoTaskList);
                }

                gl.changeItems = gl.changeItems.resolve(id);
            } else {
                console.log(taskErrorMessage(id));
            }

            return { ...state, toDoTaskList, err };
        }

        // запрос на изменение статуса задания на "Выполнено" вернул
        // идентификатор обновленного задания
        case aTypes.DONE_TODO_TASK: {
            const toDoTaskList = state.toDoTaskList.map(task => {
                if (task.id === payload) {
                    gl.doneItems = gl.doneItems.add({ ...task });
                    task.status = 'done';
                }

                return task;
            });

            return { ...state, toDoTaskList, err: null };
        }

        case aTypes.DONE_TODO_TASK_FULFILLED: {
            const { id } = payload;

            gl.doneItems = gl.doneItems.resolve(id);

            return { ...state, err: null };
        }

        // запрос на изменение статуса задания на "Выполнено" вернул ошибку
        case aTypes.DONE_TODO_TASK_REJECTED: {
            const { id, err } = payload;
            const awaitingItem = gl.doneItems.findById(id);
            let toDoTaskList = [...state.toDoTaskList];

            if (awaitingItem !== null) {
                toDoTaskList = state.toDoTaskList.map(task => {
                    if (task.id === id) {
                        task.status = awaitingItem.status;
                    }

                    return task;
                });
                gl.doneItems = gl.doneItems.resolve(id);
            } else {
                console.log(taskErrorMessage(id));
            }

            return { ...state, toDoTaskList, err };
        }

        // запрос на удаление задания по идентификатору вернул
        // идентификатор удаленного задания
        case aTypes.DELETE_TODO_TASK: {
            const toDoTaskList = [...state.toDoTaskList].reduce((result, task) => {
                if (task.id === payload) {
                    gl.deleteItems = gl.deleteItems.add(task);
                } else {
                    result.push(task);
                }

                return result;
            }, []);

            return { ...state, toDoTaskList, err: null };
        }

        case aTypes.DELETE_TODO_TASK_FULFILLED: {
            const { id } = payload;

            gl.deleteItems = gl.deleteItems.resolve(id);

            return { ...state, err: null };
        }

        // запрос на удаление задания по идентификатору вернул ошибку
        case aTypes.DELETE_TODO_TASK_REJECTED: {
            const { id, err } = payload;
            const awaitingItem = gl.deleteItems.findById(id);
            let toDoTaskList = [...state.toDoTaskList];

            if (awaitingItem !== null) {
                if (isEqualDays(state.selectedTasksDate, awaitingItem.date)) {
                    toDoTaskList.push(awaitingItem);
                    toDoTaskList = sortTaskListByDate(toDoTaskList);
                }

                gl.deleteItems = gl.deleteItems.resolve(id);
            } else {
                console.log(taskErrorMessage(id));
            }

            return { ...state, toDoTaskList, err };
        }

        // запрос на список заданий вернул новый список заданий
        case aTypes.GET_TODO_TASKS_FOR_DATE_FULFILLED: {
            let { selectedTasksDate, toDoTaskList } = payload;

            toDoTaskList = toDoTaskList.map(task => {
                task.date = new Date(task.date);

                return task;
            });

            gl.createItems.items.forEach(awaitingItem => {
                if (isEqualDays(state.selectedTasksDate, awaitingItem.date)) {
                    if (!toDoTaskList.some(task => awaitingItem.id === task.id)) {
                        toDoTaskList.push(awaitingItem);
                    }
                }
            });

            gl.changeItems.items.forEach(awaitingItem => {
                if (isEqualDays(state.selectedTasksDate, awaitingItem.date)) {
                    toDoTaskList = toDoTaskList.map(task => {
                        if (task.id === awaitingItem.id) {
                            return awaitingItem._changes;
                        }

                        return task;
                    });
                }
            });

            gl.doneItems.items.forEach(awaitingItem => {
                if (isEqualDays(state.selectedTasksDate, awaitingItem.date)) {
                    toDoTaskList = toDoTaskList.map(task => {
                        if (task.id === awaitingItem.id) {
                            task.status = 'done';
                        }

                        return task;
                    });
                }
            });

            gl.deleteItems.items.forEach(awaitingItem => {
                if (isEqualDays(state.selectedTasksDate, awaitingItem.date)) {
                    toDoTaskList = toDoTaskList.reduce((result, task) => {
                        if (task.id !== awaitingItem.id) {
                            result.push(task);
                        }

                        return result;
                    }, []);
                }
            });

            toDoTaskList = sortTaskListByDate(toDoTaskList);

            return { ...state, selectedTasksDate, toDoTaskList, err: null };
        }

        // запрос на список заданий вернул ошибку
        case aTypes.GET_TODO_TASKS_FOR_DATE_REJECTED: {
            const { selectedTasksDate, err } = payload;

            return { ...state, selectedTasksDate, err };
        }

        // выбор задания для редактирование по идентификатору
        case aTypes.SET_MUTABLE_ITEM_ID: {
            let mutableItem = state.toDoTaskList.find(task => task.id === payload);

            if (!mutableItem) {
                mutableItem = { id: payload, date: new Date(), taskText: '' };
            }

            return { ...state, mutableItem, err: null };
        }

        // изменение даты редактируемого задания
        case aTypes.SET_MUTABLE_ITEM_DATE: {
            const mutableItem = { ...state.mutableItem };

            mutableItem.date = payload;

            return { ...state, mutableItem, err: null };
        }

        // изменение текста редактируемого задания
        case aTypes.SET_MUTABLE_ITEM_TASK_TEXT: {
            const mutableItem = { ...state.mutableItem };

            mutableItem.taskText = payload;

            return { ...state, mutableItem, err: null };
        }

        default:
            return { ...state };
    }
};

export default reducersToDoList;
