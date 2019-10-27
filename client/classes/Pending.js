/**
 * Приватные методы класса Pending
 */
const privates = {
    /**
     * Проверить что у элемента есть свойство id
     * @param {Object} item Проверяемый элемент
     * @return {Boolean} Результат проверки
     * @throws {Error} Проверяемый элемент не является объектом или не имеет свойство id
     */
    itemHasId: item => {
        try {
            if (item.id) {
                return true;
            }
        } catch (err) {
            console.error('Pending item must be Object and have property id');
        }
    },

    /**
     * Проверить что элемент уже находится в списке ожидания
     * @param {String} id Идентификатор проверяемого элемента
     * @return {Boolean} Результат проверки
     */
    itemAlreadyExist(id) {
        const itemExist = this.items.find(awaitingItem => awaitingItem.id === id);

        return itemExist !== undefined;
    },
};

/**
 * @class
 * @classdesc класс "В ожидании"
 */
class Pending {
    constructor() {
        /**
         * Список ожидающих элементов
         * @type {Object[]}
         */
        this.items = [];
    }

    /**
     * Добавить элемент в список ожидающих
     * @param {Object} item Ожидающий элемент, обязательно должен иметь свойство id
     * @return {this}
     */
    add(item) {
        if (privates.itemHasId(item) && !privates.itemAlreadyExist.call(this, item.id)) {
            this.items.push(item);
        } else {
            console.error(`Pending item with id ${item.id} already exist`);
        }

        return this;
    }

    /**
     * Удалить элемент из списка ожидания
     * @param {String} id Идентификатор ожидающего элемента
     * @return {this}
     */
    resolve(id) {
        if (privates.itemAlreadyExist.call(this, id)) {
            this.items = this.items.reduce((result, awaitingItem) => {
                if (awaitingItem.id !== id) {
                    result.push(awaitingItem);
                }

                return result;
            }, []);
        } else {
            console.error(`Pending item with id ${id} is not in awaiting list`);
        }

        return this;
    }

    /**
     * Найти элемент списка ожидания по идентификатору
     * @param {String} id Идентификатор ожидающего элемента
     * @return {Object|null}
     */
    findById(id) {
        const awaitingItem = this.items.find(awaitingItem => awaitingItem.id === id);

        return awaitingItem || null;
    }
}

export default Pending;
