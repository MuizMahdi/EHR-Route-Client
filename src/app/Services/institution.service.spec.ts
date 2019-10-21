import { TestBed } from '@angular/core/testing';

import { InstitutionService } from './institution.service';

describe('InstitutionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InstitutionService = TestBed.get(InstitutionService);
    expect(service).toBeTruthy();
  });
});
