export const MINPOKER_SOCKET_MOCK = {
  id: 'test-socket',
  data: {},
  disconnect: jest.fn(),
  emit: jest.fn(),
  join: jest.fn(),
  leave: jest.fn(),
  handshake: {
    auth: {},
    headers: {
      authorization: 'Bearer valid-token',
    },
  },
};
