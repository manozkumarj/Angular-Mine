import { Component, OnInit } from '@angular/core';
import { CurBenService } from '../../../../services/cur-ben.service';
import { Router } from '@angular/router';
import { UtilitiesService } from '../../../../services/utilities.service';

@Component({
  selector: 'app-clinical-examinations',
  templateUrl: './clinical-examinations.component.html',
  styleUrls: ['./clinical-examinations.component.css']
})
export class ClinicalExaminationsComponent implements OnInit {

  step = -1;

  bmiHasData = false;
  vitalsHasData = false;
  seHasData = false;
  geHasData = false;

  constructor(public curBen: CurBenService, public router: Router, public utilities: UtilitiesService) { }

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
      case 'bmi':
        this.bmiHasData = true;
        break;
      case 'vitals':
        this.vitalsHasData = true;
        break;
      case 'se':
        this.seHasData = true;
        break;
      case 'ge':
        this.geHasData = true;
        break;      
    }
  }
}
