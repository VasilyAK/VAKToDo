export const mockAdd = jest.fn();
export const mockResolve = jest.fn();
export const mockFindById = jest.fn();

const Pending = jest.fn().mockImplementation(() => {
    return {
        items: [],
        add: mockAdd.mockReturnThis(),
        resolve: mockResolve.mockReturnThis(),
        findById: mockFindById,
    };
});

export default Pending;
