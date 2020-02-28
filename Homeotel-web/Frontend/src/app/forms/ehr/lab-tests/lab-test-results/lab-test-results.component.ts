import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { MatTableDataSource } from '@angular/material';
import swal from 'sweetalert2';
import { CurBenService } from '../../../../services/cur-ben.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-lab-test-results',
  templateUrl: './lab-test-results.component.html',
  styleUrls: ['./lab-test-results.component.css']
})
export class LabTestResultsComponent implements OnInit {

  @Input('view-mode')
  viewMode: boolean = false;

  labInstitute; otherLabInstitute;

  //temp variables - test
  isOtherLabInstitute = false;

  //for hints - min max - mandatories, etc
  rbsValid = true;
  minRbs = 40; maxRbs = 500;
  strRbsHint = this.minRbs + " to " + this.maxRbs + " mg%";

  hbValid = true;
  minHb = 2; maxHb = 25;
  strHbHint = this.minHb + " to " + this.maxHb + " gm/dl";

  //masters
  units = []; labInstitutes = [];

  //for mat table
  displayedColumns: string[] = ['fullTestName', 'result', 'unitId', 'saved'];
  dataSource: MatTableDataSource<LabTestResults>;
  labTestResults: LabTestResults[] = [];
  labTestResultsOriginal: LabTestResults[] = [];

  @Output() dataReady = new EventEmitter<any>();

  constructor(public curBen: CurBenService, public apiService: ApiService, public curStaff: CurStaffService,
    public utilities: UtilitiesService, public datePipe: DatePipe) { }

  ngOnInit() {
    this.initialiseForm();
  }

  initialiseForm() {
    this.labTestResults = [];
    this.labTestResultsOriginal = [];
    this.loadMasters();
    this.createFormControls();
  }

  afterMasterDataLoads() {
    this.utilities.setStyles();

    this.loadLabTestsResultsData();
  }

  resetMasters() {
    this.units = [];
    this.labInstitutes = [];
  }

  loadMasters() {
    this.apiService.getLabTestResultsComponentMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.resetMasters();
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'lab_units')
              this.units.push({ name: masterRow.name, id: masterRow.id });
            if (masterRow.master_type == 'lab_institution')
              this.labInstitutes.push({ name: masterRow.name, id: masterRow.id });
          });
          this.afterMasterDataLoads();
        }
      });
  }

  createFormControls() {
    this.labInstitute = new FormControl();
    this.otherLabInstitute = new FormControl();
  }

  //handling user events
  labInstituteChanged(calledFromLoadData = false) {
    if (this.labInstitute.value.name.toLowerCase().indexOf('other') > -1)
      this.isOtherLabInstitute = true;
    else {
      this.isOtherLabInstitute = false;
      if (!calledFromLoadData)
        this.saveLabInstitute();
    }
  }

  //save and load data
  saveLabInstitute() {
    if (!this.labInstituteValid()) return;
    if (!this.curStaff.allowDataSave()) return;

    this.apiService.saveLabInstitution(this.curBen.curEncId, this.utilities.getCurEncNodeId(),
      this.labInstitute.value.id, this.otherLabInstitute.value, this.curStaff.staffId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while saving the data", type: 'error' });
          console.log(data);
        }
        else {
          this.loadLabTestsResultsData();
        }
      });
  }

  labInstituteValid() {
    if ((!this.labInstitute.value) ||
      (this.isOtherLabInstitute && !this.otherLabInstitute.value)) {
      swal({ title: "Error", text: "Please select the lab institution.", type: 'error' });
      return false;
    }
    else
      return true;
  }

  isRbsAndInvalid(element) {
    if (element.fullTestName == 'Random Blood Sugar' && element.result != '') {
      if (isNaN(element.result) || element.result < this.minRbs || element.result > this.maxRbs) {
        this.rbsValid = false;
        return true;
      }
      else {
        this.rbsValid = true;
        return false;
      }
    }
    else return false;
  }

  isHbAndInvalid(element) {
    if (element.fullTestName == "HB Tallquist Paper & Shali'S Method" && element.result != '') {
      if (isNaN(element.result) || element.result < this.minHb || element.result > this.maxHb) {
        this.hbValid = false;
        return true;
      }
      else {
        this.hbValid = true;
        return false;
      }
    }
    else return false;
  }

  saveThisResult(element) {
    if (!this.labInstituteValid()) return;

    if (!this.curStaff.allowDataSave()) return;
    if (!element.result || !element.unitId) return;

    //check if there result or unit is changed w.r.t. original 
    var originalResult = this.labTestResultsOriginal.find(val => val.labTestId == element.labTestId && val.parameterId == element.parameterId);
    if (originalResult.result == element.result && originalResult.unitId == element.unitId) {
      element.saved = originalResult.saved;
      return; //as nothing was changed...
    }

    if (element.fullTestName == 'Random Blood Sugar' && !this.rbsValid) {
      swal({ title: "Error", text: "Invalid RBS value. Please check and try again.", type: 'error' });
      return;
    }

    if (element.fullTestName == "HB Tallquist Paper & Shali'S Method" && !this.hbValid) {
      swal({ title: "Error", text: "Invalid HB Tallquist value. Please check and try again.", type: 'error' });
      return;
    }

    element.saved = false;
    this.apiService.saveLabTestResult(this.curBen.curEncId, this.utilities.getCurEncNodeId(), this.labInstitute.value.id,
      element.labTestId, element.parameterId, element.result, element.unitId, this.curStaff.staffId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while saving the data", type: 'error' });
          console.log(data);
        }
        else {
          element.saved = true;
          this.loadLabTestsResultsData();
        }
      });
  }


  loadLabTestsResultsData() {
    this.apiService.getLabTestResults(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loaing the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setLabTestsResults(data[0], data[1][0]);
        }
      });
  }

  setLabTestsResults(labTestResultData, labTestInstitutionData) {

    if (!labTestInstitutionData) return; //coz the results data cannot be saved if institute info is not given anyway..

    this.labInstitute.setValue(this.labInstitutes.find(val => val.id == labTestInstitutionData['lab_institution_id']));
    this.otherLabInstitute.setValue(labTestInstitutionData['other_lab_institution']);

    var noOfResultsEntered = 0;
    this.labTestResults = [];
    this.labTestResultsOriginal = [];

    labTestResultData.forEach((labTestResultsData, index) => {
      var fullTestName = '';
      if (labTestResultsData['lab_test_param_name'] == labTestResultsData['lab_test_name'])
        fullTestName = labTestResultsData['lab_test_param_name'];
      else
        fullTestName = labTestResultsData['lab_test_param_name'] + " (" + labTestResultsData['lab_test_name'] + ")";

      var thisLabTestResult: LabTestResults = {
        labTestId: labTestResultsData['lab_test_id'],
        labTestName: labTestResultsData['lab_test_name'],
        parameterId: labTestResultsData['lab_test_param_id'],
        parameterName: labTestResultsData['lab_test_param_name'],
        fullTestName: fullTestName,
        result: labTestResultsData['result'],
        unitId: labTestResultsData['result_unit_id'] ? labTestResultsData['result_unit_id'] : labTestResultsData['default_unit_id'],
        saved: labTestResultsData['result'] ? true : false
      }

      if (labTestResultsData['result']) noOfResultsEntered++;

      this.labTestResults.push(thisLabTestResult);
      this.labTestResultsOriginal.push(Object.assign({}, thisLabTestResult));
    });

    var strShortDescription = noOfResultsEntered + " out of " + this.labTestResults.length + " Parameters Entered";
    this.dataReady.emit({ from: 'lab-test-results', strShortDescription: strShortDescription });
    this.dataSource = new MatTableDataSource(this.labTestResults);

    this.labInstituteChanged(true);
  }

  getUnitName(unitId) {
    var thisUnit = this.units.find(val => val.id == unitId);
    if (thisUnit)
      return thisUnit.name;
    else
      return "";
  }
}

export interface LabTestResults {
  labTestId: number;
  labTestName: string;
  parameterId: number;
  parameterName: string;
  fullTestName: string;
  result: string;
  unitId: number;
  saved: boolean;
}