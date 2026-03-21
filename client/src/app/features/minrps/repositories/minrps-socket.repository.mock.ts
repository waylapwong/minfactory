export const MINRPS_SOCKET_REPOSITORY_MOCK = {
  connect: jasmine.createSpy('connect'),
  disconnect: jasmine.createSpy('disconnect'),
  on: jasmine.createSpy('on'),
  off: jasmine.createSpy('off'),
  emit: jasmine.createSpy('emit'),
};
