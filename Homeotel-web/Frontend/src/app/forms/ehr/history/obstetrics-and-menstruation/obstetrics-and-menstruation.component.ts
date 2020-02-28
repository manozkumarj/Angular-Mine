import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import swal from 'sweetalert2';
import { CurBenService } from '../../../../services/cur-ben.service';

@Component({
  selector: 'app-obstetrics-and-menstruation',
  templateUrl: './obstetrics-and-menstruation.component.html',
  styleUrls: ['./obstetrics-and-menstruation.component.css']
})
export class ObstetricsAndMenstruationComponent implements OnInit {

  obstetricsForm;

  menstrual; period; bleeding; pain; discharge;

  //masters  
  menstruals = []; periods = []; bleedings = []; pains = []; discharges = [];

  @Output() hasData = new EventEmitter<any>();

  constructor(public apiService: ApiService, public curStaff: CurStaffService, public utilities: UtilitiesService,
    public curBen: CurBenService) { }

  ngOnInit() {
    this.initialiseForm();
  }

  initialiseForm() {
    this.loadMasters();
    this.createFormControls();
    this.createForm();

    this.loadObstetrics();
  }

  afterMasterDataLoads() {
    this.utilities.setStyles();
  }

  resetMasters() {
    this.menstruals = []; this.periods = []; this.bleedings = []; this.pains = []; this.discharges = [];
  }

  loadMasters() {
    this.apiService.getHistoryObstetricsMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.resetMasters();
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'menstrual')
              this.menstruals.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'period')
              this.periods.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'bleeding')
              this.bleedings.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'pain')
              this.pains.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'discharge')
              this.discharges.push({ name: masterRow.name, id: masterRow.id });
          });
          this.afterMasterDataLoads();
        }
      })
  }

  createFormControls() {
    this.menstrual = new FormControl('', Validators.required);
    this.period = new FormControl();
    this.bleeding = new FormControl();
    this.pain = new FormControl();
    this.discharge = new FormControl();
  }

  createForm() {
    this.obstetricsForm = new FormGroup({
      menstrual: this.menstrual,
      period: this.period,
      bleeding: this.bleeding,
      pain: this.pain,
      discharge: this.discharge
    });
  }

  menstrualChanged() {
    if (this.menstrual.value == 3) //Menopause Achieved
      this.removeMandatoryForOtherFields();
    else
      this.addBackMandatoryForOtherFields();
  }

  removeMandatoryForOtherFields() {
    this.period.setValidators();
    this.period.updateValueAndValidity();

    this.bleeding.setValidators();
    this.bleeding.updateValueAndValidity();

    this.pain.setValidators();
    this.pain.updateValueAndValidity();

    this.discharge.setValidators();
    this.discharge.updateValueAndValidity();
  }

  addBackMandatoryForOtherFields() {
    this.period.setValidators([Validators.required]);    
    this.period.updateValueAndValidity();

    this.bleeding.setValidators([Validators.required]);
    this.bleeding.updateValueAndValidity();

    this.pain.setValidators([Validators.required]);
    this.pain.updateValueAndValidity();

    this.discharge.setValidators([Validators.required]);
    this.discharge.updateValueAndValidity();
  }

  //save and load data
  saveObstetrics() {

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.saveObstetrics(this.curBen.curEncId, this.utilities.getCurEncNodeId(),
      this.menstrual.value, this.period.value, this.bleeding.value, this.pain.value, this.discharge.value,
      this.curStaff.staffId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while saving the data", type: 'error' });
          console.log(data);
        }
        else {
          swal({ title: "Success", text: "Saved Data Successfully", type: 'success' });
          this.initialiseForm();
        }
      });
  }

  loadObstetrics() {
    this.apiService.getObstetrics(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setObstetricsData(data[0][0]);
        }
      });
  }

  setObstetricsData(obstetricsData) {
    if (!obstetricsData) return;

    this.hasData.emit();
    this.menstrual.setValue(obstetricsData['menstrual_id']);
    this.period.setValue(obstetricsData['period_id']);
    this.bleeding.setValue(obstetricsData['bleeding_id']);
    this.pain.setValue(obstetricsData['pain_id']);
    this.discharge.setValue(obstetricsData['discharge_id']);
  }
}