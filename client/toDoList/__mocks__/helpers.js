/** Определить, принадлежат ли даты к одному и тому же дню */
export const isEqualDays = jest.fn();

/** Сортирует массив заданий по дате */
export const sortTaskListByDate = jest.fn();

/** Найти доступный идентификатор для нового задания */
export const findAvailableNewTaskId = jest.fn();

/** Сообщение об ошибке. Сервер вернул идентификатор задания, который не ожидает разрешения. */
export const taskErrorMessage = jest.fn(() => 'someErrMessage');
