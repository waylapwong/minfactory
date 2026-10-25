import { convertToParamMap } from '@angular/router';

export const MINADVENT_ACTIVATED_ROUTE_MOCK: { snapshot: { paramMap: import('@angular/router').ParamMap } } = {
  snapshot: {
    paramMap: convertToParamMap({}),
  },
};

export const MINADVENT_ROUTER_MOCK: { navigate: jasmine.Spy<jasmine.Func> } = {
  navigate: jasmine.createSpy('navigate').and.resolveTo(true),
};
