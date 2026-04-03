export const MINPOKER_SERVER_TO_EMIT_MOCK = jest.fn();

export const MINPOKER_SERVER_MOCK = {
  emit: jest.fn(),
  to: jest.fn().mockReturnValue({
    emit: MINPOKER_SERVER_TO_EMIT_MOCK,
  }),
};
