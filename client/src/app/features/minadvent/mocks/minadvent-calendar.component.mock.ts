import { convertToParamMap } from '@angular/router';

export const MINADVENT_ACTIVATED_ROUTE_MOCK = {
  snapshot: {
    paramMap: convertToParamMap({}),
  },
};

export const MINADVENT_ROUTER_MOCK = {
  navigate: jasmine.createSpy('navigate').and.resolveTo(true),
};
