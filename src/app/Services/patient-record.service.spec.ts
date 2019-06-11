import { TestBed } from '@angular/core/testing';

import { PatientRecordService } from './patient-record.service';

describe('PatientRecordService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PatientRecordService = TestBed.get(PatientRecordService);
    expect(service).toBeTruthy();
  });
});
