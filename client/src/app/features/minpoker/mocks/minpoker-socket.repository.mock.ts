export const MINPOKER_SOCKET_REPOSITORY_MOCK = {
  connect: jasmine.createSpy('connect'),
  disconnect: jasmine.createSpy('disconnect'),
  emit: jasmine.createSpy('emit'),
  off: jasmine.createSpy('off'),
  on: jasmine.createSpy('on'),
};
