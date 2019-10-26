import reducersToDoList from '../reducers';
import aTypes from '../actionTypes';
import * as HF from '~/toDoList/helpers';
import Pending from '~/classes/Pending';

jest.mock('~/toDoList/helpers');
jest.mock('~/classes/Pending');

const initMutableItem = {
    id: null,
    date: null,
    taskText: '',
};

const testTask = {
    id: 'testId',
    date: new Date('1990-01-01'),
    taskText: 'test text',
    status: 'test status',
};

afterEach(() => {
    HF.isEqualDays = jest.fn();
    HF.sortTaskListByDate = jest.fn();
    HF.findAvailableNewTaskId = jest.fn();
    HF.taskErrorMessage = jest.fn(() => 'someErrMessage');
    Pending.prototype.add = jest.fn().mockReturnThis();
    Pending.prototype.resolve = jest.fn().mockReturnThis();
    Pending.prototype.findById = jest.fn();
    jest.clearAllMocks();
});

describe('action type CREATE_TODO_TASK', () => {
    it('should create task without equalDays', () => {
        // ARRANGE
        const initState = {
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK,
            payload: testTask,
        };

        HF.isEqualDays = jest.fn(() => false);
        HF.findAvailableNewTaskId = jest.fn(() => 'newTask2');

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            newTaskId: 'newTask2',
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(0);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledWith(action.payload);
    });

    it('should create task with equalDays', () => {
        // ARRANGE
        const initState = {
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK,
            payload: testTask,
        };

        HF.isEqualDays = jest.fn(() => true);
        HF.sortTaskListByDate = jest.fn(taskList => taskList);
        HF.findAvailableNewTaskId = jest.fn(() => 'newTask2');

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            newTaskId: 'newTask2',
            toDoTaskList: [testTask],
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(1);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledWith(action.payload);
    });
});

describe('action type CREATE_TODO_TASK_FULFILLED', () => {
    it('should resolve create task if pending item not exist', () => {
        const initState = {
            newTaskId: 'newTask2',
            mutableItem: initMutableItem,
            toDoTaskList: [{ ...testTask, id: 'newTask1' }],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK_FULFILLED,
            payload: {
                id: 'newTask3',
                newId: 'someNewId',
            },
        };

        Pending.prototype.findById = jest.fn(() => null);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual(initState);
        expect(HF.isEqualDays).toHaveBeenCalledTimes(0);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(0);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
    });

    it('should resolve create task if pending item exist without equalDays', () => {
        const initState = {
            newTaskId: 'newTask2',
            mutableItem: initMutableItem,
            toDoTaskList: [{ ...testTask, id: 'newTask1' }],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK_FULFILLED,
            payload: {
                id: 'newTask3',
                newId: 'someNewId',
            },
        };

        HF.isEqualDays = jest.fn(() => false);
        HF.findAvailableNewTaskId = jest.fn(() => 'newTask2');
        Pending.prototype.findById = jest.fn(() => ({ ...testTask, id: action.payload.id }));

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual(initState);
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(1);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
    });

    it('should resolve create task if pending item exist with equalDays', () => {
        const initState = {
            newTaskId: 'newTask2',
            mutableItem: initMutableItem,
            toDoTaskList: [{ ...testTask, id: 'newTask1' }],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK_FULFILLED,
            payload: {
                id: 'newTask1',
                newId: 'someNewId',
            },
        };

        HF.isEqualDays = jest.fn(() => true);
        HF.findAvailableNewTaskId = jest.fn(() => 'newTask1');
        Pending.prototype.findById = jest.fn(() => ({ ...testTask, id: action.payload.id }));

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            newTaskId: 'newTask1',
            toDoTaskList: [{ ...testTask, id: 'someNewId' }],
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(1);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
    });
});

describe('action type CREATE_TODO_TASK_REJECTED', () => {
    it('should reject create task if pending item not exist', () => {
        const initState = {
            newTaskId: 'newTask2',
            mutableItem: initMutableItem,
            toDoTaskList: [{ ...testTask, id: 'newTask1' }],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK_REJECTED,
            payload: {
                id: 'newTask3',
                err: 'someErr',
            },
        };

        Pending.prototype.findById = jest.fn(() => null);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            err: 'someErr',
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(0);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(0);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(0);
    });

    it('should reject create task if pending item exist without equalDays', () => {
        const initState = {
            newTaskId: 'newTask2',
            mutableItem: initMutableItem,
            toDoTaskList: [{ ...testTask, id: 'newTask1' }],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK_REJECTED,
            payload: {
                id: 'newTask3',
                err: 'someErr',
            },
        };

        HF.isEqualDays = jest.fn(() => false);
        HF.findAvailableNewTaskId = jest.fn(() => 'newTask2');
        Pending.prototype.findById = jest.fn(() => ({ ...testTask, id: action.payload.id }));

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            err: 'someErr',
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(1);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
    });

    it('should reject create task if pending item exist with equalDays', () => {
        const initState = {
            newTaskId: 'newTask2',
            mutableItem: initMutableItem,
            toDoTaskList: [{ ...testTask, id: 'newTask1' }],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK_REJECTED,
            payload: {
                id: 'newTask1',
                err: 'someErr',
            },
        };

        HF.isEqualDays = jest.fn(() => true);
        HF.findAvailableNewTaskId = jest.fn(() => 'newTask1');
        Pending.prototype.findById = jest.fn(() => ({ ...testTask, id: action.payload.id }));

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            newTaskId: 'newTask1',
            toDoTaskList: [],
            err: 'someErr',
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(1);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
    });
});

describe('action type CHANGE_TODO_TASK', () => {
    it('should change task without equalDays', () => {
        // ARRANGE
        const initState = {
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [
                {
                    ...testTask,
                    id: 'someId1',
                    date: 'someDate1',
                    taskText: 'someText1',
                },
            ],
            err: null,
        };

        const action = {
            type: aTypes.CHANGE_TODO_TASK,
            payload: {
                ...testTask,
                id: 'someId1',
                date: 'someDate2',
                taskText: 'someText2',
            },
        };

        HF.isEqualDays = jest.fn(() => false);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            toDoTaskList: [],
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledWith(initState.toDoTaskList[0]);
    });

    it('should change task with equalDays', () => {
        // ARRANGE
        const initState = {
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [
                {
                    ...testTask,
                    id: 'someId1',
                    date: 'someDate1',
                    taskText: 'someText1',
                },
            ],
            err: null,
        };

        const action = {
            type: aTypes.CHANGE_TODO_TASK,
            payload: {
                ...testTask,
                id: 'someId1',
                date: 'someDate2',
                taskText: 'someText2',
            },
        };

        HF.isEqualDays = jest.fn(() => true);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            toDoTaskList: [action.payload],
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledWith(initState.toDoTaskList[0]);
    });
});

describe('action type CHANGE_TODO_TASK_FULFILLED', () => {
    it('should resolve change task', () => {
        // ARRANGE
        const initState = {
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [testTask],
            err: null,
        };

        const action = {
            type: aTypes.CHANGE_TODO_TASK_FULFILLED,
            payload: 'someId1',
        };

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual(initState);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
    });
});

describe('action type CHANGE_TODO_TASK_REJECTED', () => {
    it('should reject change task if pending item not exist', () => {
        // ARRANGE
        const initState = {
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [
                {
                    ...testTask,
                    id: 'someId1',
                    date: 'someDate2',
                    taskText: 'someText2',
                },
            ],
            err: null,
        };

        const action = {
            type: aTypes.CHANGE_TODO_TASK_REJECTED,
            payload: {
                id: 'someId2',
                err: 'someErr',
            },
        };

        Pending.prototype.findById = jest.fn(() => null);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            err: 'someErr',
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(0);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(0);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(0);
    });

    it('should reject change task if pending item exist without equalDays', () => {
        // ARRANGE
        const initState = {
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [
                {
                    ...testTask,
                    id: 'someId1',
                    date: 'someDate2',
                    taskText: 'someText2',
                },
            ],
            err: null,
        };

        const action = {
            type: aTypes.CHANGE_TODO_TASK_REJECTED,
            payload: {
                id: 'someId1',
                err: 'someErr',
            },
        };

        HF.isEqualDays = jest.fn(() => false);
        Pending.prototype.findById = jest.fn(() => ({
            ...testTask,
            id: 'someId1',
            date: 'someDate1',
            taskText: 'someText1',
        }));

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            err: 'someErr',
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(0);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
    });

    it('should reject change task if pending item exist with equalDays and awaiting id equal current id', () => {
        // ARRANGE
        const currentTask = {
            ...testTask,
            id: 'someId1',
            date: 'someDate2',
            taskText: 'someText2',
        };

        const awaitingTask = {
            ...testTask,
            id: 'someId1',
            date: 'someDate1',
            taskText: 'someText1',
        };

        const initState = {
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.CHANGE_TODO_TASK_REJECTED,
            payload: {
                id: 'someId1',
                err: 'someErr',
            },
        };

        HF.isEqualDays = jest.fn(() => true);
        HF.sortTaskListByDate = jest.fn(() => [awaitingTask]);
        Pending.prototype.findById = jest.fn(() => awaitingTask);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            toDoTaskList: [awaitingTask],
            err: 'someErr',
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(1);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
    });

    it('should reject change task if pending item exist with equalDays and awaiting id not equal current id', () => {
        // ARRANGE
        const currentTask = {
            ...testTask,
            id: 'someId1',
            date: 'someDate2',
            taskText: 'someText2',
        };

        const awaitingTask = {
            ...testTask,
            id: 'someId2',
            date: 'someDate1',
            taskText: 'someText1',
        };

        const initState = {
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.CHANGE_TODO_TASK_REJECTED,
            payload: {
                id: 'someId1',
                err: 'someErr',
            },
        };

        HF.isEqualDays = jest.fn(() => true);
        HF.sortTaskListByDate = jest.fn(() => [currentTask, awaitingTask]);
        Pending.prototype.findById = jest.fn(() => awaitingTask);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            toDoTaskList: [currentTask, awaitingTask],
            err: 'someErr',
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(1);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
    });
});
