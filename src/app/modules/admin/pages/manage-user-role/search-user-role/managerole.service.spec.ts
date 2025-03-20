import { TestBed } from '@angular/core/testing';

import { ManageroleService } from './managerole.service';

describe('ManageroleService', () => {
  let service: ManageroleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ManageroleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
