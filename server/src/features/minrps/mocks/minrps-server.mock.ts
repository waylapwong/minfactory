export const MINRPS_SERVER_TO_EMIT_MOCK = jest.fn();
export const MINRPS_SERVER_TO_EXCEPT_EMIT_MOCK = jest.fn();
export const MINRPS_SERVER_TO_EXCEPT_MOCK = jest.fn().mockReturnValue({ emit: MINRPS_SERVER_TO_EXCEPT_EMIT_MOCK });

export const MINRPS_SERVER_MOCK = {
  to: jest.fn().mockReturnValue({
    emit: MINRPS_SERVER_TO_EMIT_MOCK,
    except: MINRPS_SERVER_TO_EXCEPT_MOCK,
  }),
};
