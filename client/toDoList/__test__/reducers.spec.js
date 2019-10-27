import reducersToDoList from '../reducers';
import aTypes from '../actionTypes';
import * as HF from '~/toDoList/helpers';
import Pending from '~/classes/Pending';

jest.mock('~/toDoList/helpers');
jest.mock('~/classes/Pending');

const CURRENT_DAY = new Date('1990-01-01');
const NOT_CURRENT_DAY = new Date('1990-01-02');
const ANY_DAY = new Date('1990-01-03');

const initMutableItem = {
    id: null,
    date: null,
    taskText: '',
};

const testTask = {
    id: 'someId',
    date: new Date('1990-01-01'),
    taskText: ANY_DAY,
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
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK,
            payload: { ...testTask, date: NOT_CURRENT_DAY },
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
        expect(HF.isEqualDays).toHaveBeenCalledWith(initState.selectedTasksDate, action.payload.date);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(0);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledWith(action.payload);
    });

    it('should create task with equalDays', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK,
            payload: { ...testTask, date: CURRENT_DAY },
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
        expect(HF.isEqualDays).toHaveBeenCalledWith(initState.selectedTasksDate, action.payload.date);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(1);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledWith(action.payload);
    });
});

describe('action type CREATE_TODO_TASK_FULFILLED', () => {
    const currentTask = { ...testTask, id: 'newTask1' };
    let awaitingTask = { ...testTask, id: 'newTask1' };

    it('should resolve create task if pending item not exist', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask2',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK_FULFILLED,
            payload: {
                id: awaitingTask.id,
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
        // ARRANGE
        awaitingTask = { ...awaitingTask, date: NOT_CURRENT_DAY };

        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask2',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK_FULFILLED,
            payload: {
                id: awaitingTask.id,
                newId: 'someNewId',
            },
        };

        HF.isEqualDays = jest.fn(() => false);
        HF.findAvailableNewTaskId = jest.fn(() => 'newTask2');
        Pending.prototype.findById = jest.fn(() => awaitingTask);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual(initState);
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.isEqualDays).toHaveBeenCalledWith(initState.selectedTasksDate, awaitingTask.date);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(1);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledWith(action.payload.id);
    });

    it('should resolve create task if pending item exist with equalDays', () => {
        // ARRANGE
        awaitingTask = { ...awaitingTask, date: CURRENT_DAY };

        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask2',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK_FULFILLED,
            payload: {
                id: awaitingTask.id,
                newId: 'someNewId',
            },
        };

        HF.isEqualDays = jest.fn(() => true);
        HF.findAvailableNewTaskId = jest.fn(() => 'newTask1');
        Pending.prototype.findById = jest.fn(() => awaitingTask);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            newTaskId: 'newTask1',
            toDoTaskList: [{ ...testTask, id: 'someNewId' }],
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.isEqualDays).toHaveBeenCalledWith(initState.selectedTasksDate, awaitingTask.date);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(1);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledWith(action.payload.id);
    });
});

describe('action type CREATE_TODO_TASK_REJECTED', () => {
    const currentTask = { ...testTask, id: 'newTask1' };
    let awaitingTask = { ...testTask, id: 'newTask1' };

    it('should reject create task if pending item not exist', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask2',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK_REJECTED,
            payload: {
                id: awaitingTask.id,
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
        // ARRANGE
        awaitingTask = { ...awaitingTask, date: NOT_CURRENT_DAY };

        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask2',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK_REJECTED,
            payload: {
                id: awaitingTask.id,
                err: 'someErr',
            },
        };

        HF.isEqualDays = jest.fn(() => false);
        HF.findAvailableNewTaskId = jest.fn(() => 'newTask2');
        Pending.prototype.findById = jest.fn(() => awaitingTask);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            err: 'someErr',
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.isEqualDays).toHaveBeenCalledWith(initState.selectedTasksDate, awaitingTask.date);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(1);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledWith(action.payload.id);
    });

    it('should reject create task if pending item exist with equalDays', () => {
        // ARRANGE
        awaitingTask = { ...awaitingTask, date: CURRENT_DAY };

        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask2',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.CREATE_TODO_TASK_REJECTED,
            payload: {
                id: awaitingTask.id,
                err: 'someErr',
            },
        };

        HF.isEqualDays = jest.fn(() => true);
        HF.findAvailableNewTaskId = jest.fn(() => 'newTask1');
        Pending.prototype.findById = jest.fn(() => awaitingTask);

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
        expect(HF.isEqualDays).toHaveBeenCalledWith(initState.selectedTasksDate, awaitingTask.date);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(1);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledWith(action.payload.id);
    });
});

describe('action type CHANGE_TODO_TASK', () => {
    const currentTask = {
        ...testTask,
        id: 'someId1',
        taskText: 'someText1',
    };

    let awaitingTask = {
        ...testTask,
        id: 'someId1',
        taskText: 'someText2',
    };

    it('should change task without equalDays', () => {
        // ARRANGE
        awaitingTask = { ...awaitingTask, date: NOT_CURRENT_DAY };

        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.CHANGE_TODO_TASK,
            payload: awaitingTask,
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
        expect(HF.isEqualDays).toHaveBeenCalledWith(initState.selectedTasksDate, action.payload.date);
        expect(Pending.prototype.add).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledWith({
            ...initState.toDoTaskList[0],
            _changes: awaitingTask,
        });
    });

    it('should change task with equalDays', () => {
        // ARRANGE
        awaitingTask = { ...awaitingTask, date: CURRENT_DAY };

        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.CHANGE_TODO_TASK,
            payload: awaitingTask,
        };

        HF.isEqualDays = jest.fn(() => true);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            toDoTaskList: [awaitingTask],
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.isEqualDays).toHaveBeenCalledWith(initState.selectedTasksDate, action.payload.date);
        expect(Pending.prototype.add).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledWith({
            ...initState.toDoTaskList[0],
            _changes: awaitingTask,
        });
    });
});

describe('action type CHANGE_TODO_TASK_FULFILLED', () => {
    it('should resolve change task', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [testTask],
            err: null,
        };

        const action = {
            type: aTypes.CHANGE_TODO_TASK_FULFILLED,
            payload: { id: 'someId1' },
        };

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual(initState);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledWith(action.payload.id);
    });
});

describe('action type CHANGE_TODO_TASK_REJECTED', () => {
    const currentTask = {
        ...testTask,
        id: 'someId1',
        taskText: 'someText2',
    };

    let awaitingTask = {
        ...testTask,
        id: 'someId1',
        taskText: 'someText1',
        _changes: currentTask,
    };

    it('should reject change task if pending item not exist', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.CHANGE_TODO_TASK_REJECTED,
            payload: {
                id: awaitingTask.id,
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
        awaitingTask = { ...awaitingTask, date: NOT_CURRENT_DAY };

        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.CHANGE_TODO_TASK_REJECTED,
            payload: {
                id: awaitingTask.id,
                err: 'someErr',
            },
        };

        HF.isEqualDays = jest.fn(() => false);
        Pending.prototype.findById = jest.fn(() => awaitingTask);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            err: 'someErr',
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.isEqualDays).toHaveBeenCalledWith(initState.selectedTasksDate, awaitingTask.date);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(0);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledWith(awaitingTask.id);
    });

    it('should reject change task if pending item exist with equalDays and awaiting id is equal current id', () => {
        // ARRANGE
        awaitingTask = { ...awaitingTask, date: CURRENT_DAY };

        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.CHANGE_TODO_TASK_REJECTED,
            payload: {
                id: awaitingTask.id,
                err: 'someErr',
            },
        };

        const awaitingItemWithoutChanges = { ...awaitingTask };

        delete awaitingItemWithoutChanges._changes;
        HF.isEqualDays = jest.fn(() => true);
        HF.sortTaskListByDate = jest.fn(taskList => taskList);
        Pending.prototype.findById = jest.fn(() => awaitingTask);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            toDoTaskList: [awaitingItemWithoutChanges],
            err: 'someErr',
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.isEqualDays).toHaveBeenCalledWith(initState.selectedTasksDate, awaitingTask.date);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(1);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledWith(awaitingTask.id);
    });

    it('should reject change task if pending item exist with equalDays and awaiting id is not equal current id', () => {
        // ARRANGE
        awaitingTask = { ...awaitingTask, date: CURRENT_DAY };

        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.CHANGE_TODO_TASK_REJECTED,
            payload: {
                id: 'someId2',
                err: 'someErr',
            },
        };

        const awaitingItemWithoutChanges = { ...awaitingTask };

        delete awaitingItemWithoutChanges._changes;
        HF.isEqualDays = jest.fn(() => true);
        HF.sortTaskListByDate = jest.fn(taskList => taskList);
        Pending.prototype.findById = jest.fn(() => ({ ...awaitingTask, id: action.payload.id }));

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            toDoTaskList: [currentTask, { ...awaitingItemWithoutChanges, id: action.payload.id }],
            err: 'someErr',
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.isEqualDays).toHaveBeenCalledWith(initState.selectedTasksDate, awaitingTask.date);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(1);
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledWith(action.payload.id);
    });
});

describe('action type DONE_TODO_TASK', () => {
    const currentTask = {
        ...testTask,
        id: 'someId1',
        status: 'notDone',
    };

    const awaitingTask = {
        ...testTask,
        id: 'someId1',
        status: 'notDone',
    };

    it('should do task status done', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.DONE_TODO_TASK,
            payload: awaitingTask.id,
        };

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            toDoTaskList: [{ ...currentTask, status: 'done' }],
        });
        expect(Pending.prototype.add).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledWith(awaitingTask);
    });
});

describe('action type DONE_TODO_TASK_FULFILLED', () => {
    const currentTask = {
        ...testTask,
        id: 'someId1',
        status: 'done',
    };

    it('should resolve to do task status done', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.DONE_TODO_TASK_FULFILLED,
            payload: { id: 'someId1' },
        };

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual(initState);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledWith(action.payload.id);
    });
});

describe('action type DONE_TODO_TASK_REJECTED', () => {
    const currentTask = {
        ...testTask,
        id: 'someId1',
        status: 'done',
    };

    const awaitingTask = {
        ...testTask,
        id: 'someId1',
        status: 'notDone',
    };

    it('should reject to do task status done if pending item not exist', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.DONE_TODO_TASK_REJECTED,
            payload: {
                id: awaitingTask.id,
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
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(0);
    });

    it('should reject to do task status done if pending item exist and awaiting id is equal current id', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.DONE_TODO_TASK_REJECTED,
            payload: {
                id: awaitingTask.id,
                err: 'someErr',
            },
        };

        Pending.prototype.findById = jest.fn(() => awaitingTask);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            toDoTaskList: [awaitingTask],
            err: 'someErr',
        });
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledWith(action.payload.id);
    });

    it('should reject to do task status done if pending item exist and awaiting id is not equal current id', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.DONE_TODO_TASK_REJECTED,
            payload: {
                id: 'someId2',
                err: 'someErr',
            },
        };

        Pending.prototype.findById = jest.fn(() => ({ ...awaitingTask, id: action.payload.id }));

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            err: 'someErr',
        });
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledWith(action.payload.id);
    });
});

describe('action type DELETE_TODO_TASK', () => {
    const currentTask = {
        ...testTask,
        id: 'someId1',
    };

    const awaitingTask = {
        ...testTask,
        id: 'someId1',
    };

    it('should delete task', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.DELETE_TODO_TASK,
            payload: awaitingTask.id,
        };

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            toDoTaskList: [],
        });
        expect(Pending.prototype.add).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.add).toHaveBeenCalledWith(awaitingTask);
    });
});

describe('action type DELETE_TODO_TASK_FULFILLED', () => {
    const currentTask = {
        ...testTask,
        id: 'someId1',
        status: 'done',
    };

    it('should resolve delete task', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.DELETE_TODO_TASK_FULFILLED,
            payload: { id: 'someId1' },
        };

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual(initState);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledWith(action.payload.id);
    });
});

describe('action type DELETE_TODO_TASK_REJECTED', () => {
    const currentTask = {
        ...testTask,
        id: 'someId1',
        status: 'done',
    };

    const awaitingTask = {
        ...testTask,
        id: 'someId2',
        status: 'notDone',
    };

    it('should reject delete task if pending item not exist', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.DELETE_TODO_TASK_REJECTED,
            payload: {
                id: awaitingTask.id,
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
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(1);
        expect(HF.isEqualDays).toHaveBeenCalledTimes(0);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(0);
    });

    it('should reject delete task if pending item exist without equalDay', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.DELETE_TODO_TASK_REJECTED,
            payload: {
                id: awaitingTask.id,
                err: 'someErr',
            },
        };

        HF.isEqualDays = jest.fn(() => false);
        Pending.prototype.findById = jest.fn(() => awaitingTask);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            err: 'someErr',
        });
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(0);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledWith(action.payload.id);
    });

    it('should reject delete task if pending item exist with equalDay', () => {
        // ARRANGE
        const initState = {
            selectedTasksDate: CURRENT_DAY,
            newTaskId: 'newTask1',
            mutableItem: initMutableItem,
            toDoTaskList: [currentTask],
            err: null,
        };

        const action = {
            type: aTypes.DELETE_TODO_TASK_REJECTED,
            payload: {
                id: awaitingTask.id,
                err: 'someErr',
            },
        };

        HF.isEqualDays = jest.fn(() => true);
        HF.sortTaskListByDate = jest.fn(taskList => taskList);
        Pending.prototype.findById = jest.fn(() => awaitingTask);

        // ACT
        const result = reducersToDoList(initState, action);

        // ASSERT
        expect(result).toEqual({
            ...initState,
            toDoTaskList: [currentTask, awaitingTask],
            err: 'someErr',
        });
        expect(HF.taskErrorMessage).toHaveBeenCalledTimes(0);
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.findById).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledTimes(1);
        expect(Pending.prototype.resolve).toHaveBeenCalledWith(action.payload.id);
    });
});
