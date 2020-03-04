import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable()
export class CaseSheetService {

  isCaseSheet: boolean = false;
  previousUrl;
  benEncounters = [];
  encounterComplaintsData = [];
  encounterComplaintHistoryData = [];
  encounterTreatmentHistoryData = [];
  encounterVaccinationData = [];
  encounterSurgicalData = [];
  encounterFamilyData = [];
  encounterCurrentMedicationData = [];
  encounterPersonalData = [];
  encounterMeasurementsData = [];
  encounterVitalsData = [];
  encounterSystemicData = [];
  encounterGeneralData = [];
  constructor(private apiService: ApiService) { }

}
