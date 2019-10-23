export const mockAdd = jest.fn().mockReturnThis();
export const mockResolve = jest.fn().mockReturnThis();
export const mockFindById = jest.fn();
class Pending {
    constructor() {
        this.items = [];
    }
}

Pending.prototype.add = mockAdd;
Pending.prototype.resolve = mockResolve;
Pending.prototype.findById = mockFindById;

export default Pending;
