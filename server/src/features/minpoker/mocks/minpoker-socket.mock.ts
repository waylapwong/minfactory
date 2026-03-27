export const MINPOKER_SOCKET_MOCK = {
  id: 'test-socket',
  data: {},
  disconnect: jest.fn(),
  emit: jest.fn(),
  handshake: {
    auth: {},
    headers: {
      authorization: 'Bearer valid-token',
    },
  },
};
