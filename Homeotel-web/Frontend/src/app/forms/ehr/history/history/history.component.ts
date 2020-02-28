import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { CurBenService } from '../../../../services/cur-ben.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {

  step = -1;

  habitsHasData = false;
  personalHistoryHasData = false;
  clinicalHistoryHasData = false;
  familyHistoryHasData = false;
  currentMedicationHasData = false;
  obstetricsHasData = false;
  treatmentHistoryHasData = false;
  surgicalHistoryHasData = false;
  vaccinationHasData = false;

  constructor(public curBen: CurBenService, public apiService: ApiService, public curStaff: CurStaffService,
    public utilities: UtilitiesService, public router: Router) { }

  ngOnInit() {
    this.curBen.returnIfBenNotLoaded();
  }

  //handling user inputs
  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

  //handle has data event from child components to show tick marks

  hasData(childCmpName) {
    switch (childCmpName) {
      case 'habits':
        this.habitsHasData = true;
        break;

        case 'treatment-medical':
        this.treatmentHistoryHasData = true;
        break;
      case 'personal-history':
        this.personalHistoryHasData = true;
        break;
      case 'clinical-history':
        this.surgicalHistoryHasData = true;
        break;
      case 'family-history':
        this.familyHistoryHasData = true;
        break;
       case 'treatment-vaccination':
         this.vaccinationHasData = true;
         break;
      case 'obstetrics':
        this.obstetricsHasData = true;
        break;
      case 'current-medication':
        this.currentMedicationHasData = true;
        break;
    }
  }
}
