import { Injectable } from '@angular/core';
import { CurBenService } from './cur-ben.service';
import { CurStaffService } from './cur-staff.service';
import { Subject } from 'rxjs';
import { Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class UtilitiesService {

  printMode = false;
  thisSystemNodeId;

  docMode = false;

  constructor(private curBen: CurBenService, private curStaff: CurStaffService, private _snackBar: MatSnackBar) { }

  /* a useful function to have in the repo but currently, seems directly converting to date is giving the date as expected...
  convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return this.formatDate(newDate);
  }
  */

  //some temp stuff for search functionality
  subSearchBeneficiary = new Subject();
  EnumSearchType = { "name": 1, "id": 2, "phone": 3, "Aadhar": 4 };
  searchText = '';
  searchType;

  getCurEncNodeId() {
    if (this.curStaff.isSpecialistDoctor())
      return this.curBen.curEncNodeId;
    else
      return this.thisSystemNodeId;
  }

  getThisSystemNodeId() {
    if (this.curStaff.isSpecialistDoctor())
      return this.curBen.curEncNodeId;
    else
      return this.thisSystemNodeId;
  }

  getThisSystemEncounterTypeId() {
    return this.thisSystemNodeId;
    //THIS WORKS ONLY IN DIGWAL coz
    //center 1 corresponds to clinic so encounter is also clinic
    //and center 2 corresponds to MMU so encounter is field
  }

  formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  isValidEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  setStyles() {
    //language setting related styles..
    var lineHeightRequired = "20px";
    if (this.curStaff.language == "telugu") {
      lineHeightRequired = "30px";
    }

    var matFormFields = document.getElementsByClassName('mat-form-field');
    for (var i = 0; i < matFormFields.length; i++) {
      (<HTMLElement>matFormFields[i]).style.lineHeight = lineHeightRequired;
    }
  }

  getBenCardBorderTopStyle() {
    if (this.curBen.todaysEncounterStatus == this.curBen.EncounterStatusEnum.Open_Case)
      return '5px solid #rgb(57, 100, 8)';
    else if (this.curBen.todaysEncounterStatus == this.curBen.EncounterStatusEnum.Closed_Case)
      return '5px solid rgb(47,149,11)';
    else if (this.curBen.todaysEncounterStatus == this.curBen.EncounterStatusEnum.Tele_Consultation_Case)
      return '5px solid rgb(0,119,204)';
    else
      return '0px';
  }

  enableDisableDependentCtrls(ctrl, dependentCtrl1, dependentCtrl2) {
    var ctrlName = ctrl.value.name ? ctrl.value.name.toLowerCase() : '';
    if (ctrlName == '' || ctrlName.indexOf("never") > -1 || ctrlName.indexOf("not applicable") > -1) {
      this.disableControl(dependentCtrl1);
      this.disableControl(dependentCtrl2);
    }
    else {
      this.enableControl(dependentCtrl1);
      this.enableControl(dependentCtrl2);
    }
  }

  multiSelectEnableDisableOtherCtrl(ctrl, otherCtrl) {
    var otherSelected = false;

    if (ctrl.value) {
      ctrl.value.forEach(selectedOption => {
        if (selectedOption.name.toLowerCase().indexOf('other') > -1)
          otherSelected = true;
      });
    }

    if (otherSelected) {
      this.enableControl(otherCtrl);
      otherCtrl.setValidators([Validators.required, Validators.pattern('^[a-zA-Z .,-]+')]);
      otherCtrl.updateValueAndValidity();
    }
    else {
      this.disableControl(otherCtrl);
      otherCtrl.setValidators();
      otherCtrl.updateValueAndValidity();
    }
  }

  disableControl(ctrl) {
    ctrl.setValue('');
    ctrl.disable();
  }

  enableControl(ctrl) {
    ctrl.enable();
  }

  isInvalidApiResponseData(data) {
    if ((!data) ||
      (data && data.hasOwnProperty('error')) ||
      (data && data[0] && data[0].hasOwnProperty('error')) ||
      (data && data[0] && data[0][0] && data[0][0].hasOwnProperty('error')))
      return true;
    else return false;
  }

  getErrorMessage(formControl) {
    return formControl.hasError('required') ? 'required_error_msg' :
      formControl.hasError('pattern') ? 'invalid_error_msg' :
        formControl.hasError('min') ? 'invalid_error_msg' :
          formControl.hasError('max') ? 'invalid_error_msg' :
            formControl.hasError('minlength') ? 'invalid_error_msg' :
              formControl.hasError('maxlength') ? 'invalid_error_msg' :
                '';
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
