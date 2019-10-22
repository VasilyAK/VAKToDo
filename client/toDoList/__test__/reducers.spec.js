import reducersToDoList from '../reducers';
import aTypes from '../actionTypes';
import * as HF from '~/toDoList/helpers';
import * as mockPending from '~/classes/Pending';

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

describe('action type CREATE_TODO_TASK', () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
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
            newTaskId: 'newTask2',
            mutableItem: initMutableItem,
            toDoTaskList: [testTask],
            err: null,
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(1);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(1);
        expect(mockPending.mockAdd).toHaveBeenCalledTimes(1);
    });

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
            newTaskId: 'newTask2',
            mutableItem: initMutableItem,
            toDoTaskList: [],
            err: null,
        });
        expect(HF.isEqualDays).toHaveBeenCalledTimes(1);
        expect(HF.sortTaskListByDate).toHaveBeenCalledTimes(0);
        expect(HF.findAvailableNewTaskId).toHaveBeenCalledTimes(1);
        expect(mockPending.mockAdd).toHaveBeenCalledTimes(1);
    });
});
