import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { CurBenService } from '../../../../services/cur-ben.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-vitals',
  templateUrl: './vitals.component.html',
  styleUrls: ['./vitals.component.css']
})
export class VitalsComponent implements OnInit {

  @Input('view-mode')
  viewMode: boolean = false;

  vitalsForm;

  temperature; pulseRate; respRate; systolicBp; diastolicBp;

  //for hints - min max - mandatories, etc
  minTemp = 92; maxTemp = 106;
  strTempHint = this.minTemp + " to " + this.maxTemp + " °F";

  minPulse = 60; maxPulse = 120;
  strPulseHint = this.minPulse + " to " + this.maxPulse + " per min.";

  minResp = 10; maxResp = 50;
  strRespHint = this.minResp + " to " + this.maxResp + " per min.";

  minSys = 80; maxSys = 200;
  strSysHint = this.minSys + " to " + this.maxSys + " mm Hg";

  minDia = 40; maxDia = 120;
  strDiaHint = this.minDia + " to " + this.maxDia + " mm Hg";

  @Output() hasData = new EventEmitter<any>();

  constructor(public apiService: ApiService, public curStaff: CurStaffService, public utilities: UtilitiesService,
    public curBen: CurBenService) { }

  ngOnInit() {
    this.initialiseForm();
  }


  initialiseForm() {
    this.createFormControls();
    this.createForm();
    this.utilities.setStyles();

    this.loadVitalsData();
  }

  createFormControls() {
    this.temperature = new FormControl('', [Validators.min(this.minTemp), Validators.max(this.maxTemp)]);
    this.pulseRate = new FormControl('', [Validators.min(this.minPulse), Validators.max(this.maxPulse)]);
    this.respRate = new FormControl('', [Validators.min(this.minResp), Validators.max(this.maxResp)]);
    this.systolicBp = new FormControl('', [Validators.min(this.minSys), Validators.max(this.maxSys)]);
    this.diastolicBp = new FormControl('', [Validators.min(this.minDia), Validators.max(this.maxDia)]);
  }

  createForm() {
    this.vitalsForm = new FormGroup({
      temperature: this.temperature,
      respRate: this.respRate,
      pulseRate: this.pulseRate,
      systolicBp: this.systolicBp,
      diastolicBp: this.diastolicBp
    });
  }

  isValidData() {
    if (!this.temperature.value && !this.respRate.value && !this.pulseRate.value && (!this.systolicBp.value || !this.diastolicBp.value)) {
      swal({ title: "Error", text: "Incomplete data. Please check and try again", type: 'error' });
      return false;
    }
    else if (this.isZeroOrNegative(this.temperature, "Temperature") || this.isZeroOrNegative(this.pulseRate, "Pulse Rate")
      || this.isZeroOrNegative(this.respRate, "Respirator Rate") || this.isZeroOrNegative(this.systolicBp, "BP Systolic")
      || this.isZeroOrNegative(this.diastolicBp, "BP Diastolic"))
      return false;
    else if ((this.systolicBp.value && !this.diastolicBp.value) || (!this.systolicBp.value && this.diastolicBp.value)) {
      swal({ title: "Error", text: "Systolic or Diastolic data missing. Please check and try again", type: 'error' });
      return false;
    }
    else
      return true;
  }

  isZeroOrNegative(ctrl, vitalName) {
    if (ctrl.value && ctrl.value == 0) {
      swal({ title: "Error", text: vitalName + " cannot be zero. Please check and try again", type: 'error' });
      return true;
    }
    else if (ctrl.value && ctrl.value < 0) {
      swal({ title: "Error", text: vitalName + " cannot be negative. Please check and try again", type: 'error' });
      return true;
    }
    else return false;
  }

  //save and load data
  saveVitals() {

    if (!this.isValidData())
      return;

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.saveVitals(this.curBen.curEncId, this.utilities.getCurEncNodeId(),
      this.temperature.value, this.pulseRate.value, this.respRate.value, this.systolicBp.value,
      this.diastolicBp.value, this.curStaff.staffId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while saving the data", type: 'error' });
          console.log(data);
        }
        else {
          this.utilities.openSnackBar("Data Saved Successfully", "Success");
          // swal({ title: "Success", text: "Saved Data Successfully", type: 'success' });
          this.initialiseForm();
        }
      });
  }

  loadVitalsData() {
    this.apiService.getVitals(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setVitalsData(data[0][0]);
        }
      });
  }

  setVitalsData(vitalsData) {
    if (!vitalsData) return;

    this.hasData.emit();

    this.temperature.setValue(vitalsData['temperature']);
    this.pulseRate.setValue(vitalsData['pulse_rate']);
    this.respRate.setValue(vitalsData['resp_rate']);
    this.systolicBp.setValue(vitalsData['bp_systolic']);
    this.diastolicBp.setValue(vitalsData['bp_diastolic']);
  }
}
