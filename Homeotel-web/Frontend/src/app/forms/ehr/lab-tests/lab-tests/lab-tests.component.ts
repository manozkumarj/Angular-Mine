import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import swal from 'sweetalert2';
import { CurBenService } from '../../../../services/cur-ben.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-lab-tests',
  templateUrl: './lab-tests.component.html',
  styleUrls: ['./lab-tests.component.css']
})
export class LabTestsComponent implements OnInit {

  step = -1;

  bloodGroupHasData = false;
  bloodGroupShortDescription = 'Blood Group Not Selected';

  labTestsOrderHasData = false;
  labTestsOrderShortDescription = 'No lab tests ordered';

  labTestResultsHasData = false;
  labTestResultsShortDescription = 'No results entered';

  labFilesUploadHasData = false
  labFilesUploadShortDescription = 'No lab files uploaded'

  @ViewChild('labTestResults') labTestResults;
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

  printPreview() {
    this.utilities.printMode = true;
  }

  print() {
    window.print();
  }

  endPrint() {
    this.utilities.printMode = false;
  }
  
  //handle has data event from child components to show tick marks
  setDescription(event) {

    switch (event.from) {
      case 'blood-group':
        this.bloodGroupHasData = true;
        this.bloodGroupShortDescription = event.strShortDescription;
        break;
      case 'lab-tests-ordered':
        this.labTestsOrderHasData = true;
        this.labTestsOrderShortDescription = event.strShortDescription;
        break;
      case 'lab-test-results':
        this.labTestResultsHasData = true;
        this.labTestResultsShortDescription = event.strShortDescription;
        break;
      case 'lab-files-upload':
        if (!event.strShortDescription) {
          this.labFilesUploadHasData = false;
          this.labFilesUploadShortDescription = 'No lab files uploaded';
        }
        else {
          this.labFilesUploadHasData = true;
          this.labFilesUploadShortDescription = event.strShortDescription;
        }
        break;
    }
  }

  //and to update the parameters when new test is added
  newTestsAdded() {
    this.labTestResults.initialiseForm();
  }
}
