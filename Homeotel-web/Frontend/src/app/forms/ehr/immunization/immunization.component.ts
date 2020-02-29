import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { CurStaffService } from '../../../services/cur-staff.service';
import { UtilitiesService } from '../../../services/utilities.service';
import swal from 'sweetalert2';
import { CurBenService } from '../../../services/cur-ben.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-immunization',
  templateUrl: './immunization.component.html',
  styleUrls: ['./immunization.component.css']
})
export class ImmunizationComponent implements OnInit {

  /* for habits form */
  immunizationForm: FormGroup;

  birthWeight; deliveryType;
  polio; bcg; dpt; vitaminA; hepatitisB; measles;

  //temp variables    

  //masters
  birthWeights = []; deliveryTypes = [];
  polios = []; bcgs = []; dpts = []; vitaminAs = []; hepatitisBs = []; measlesList = [];

  constructor(public curBen: CurBenService, public apiService: ApiService, public curStaff: CurStaffService,
    public utilities: UtilitiesService, public router: Router, public datePipe: DatePipe) { }

  ngOnInit() {
    this.curBen.returnIfBenNotLoaded();
    this.initialiseForm();
  }

  initialiseForm() {
    this.loadMasters();
    this.createFormControls();
    this.createForm();
  }

  afterMasterDataLoads() {
    this.setDefaults();
    this.utilities.setStyles();

    this.loadImmunizationData();
  }

  resetMasters() {
    this.birthWeights = []; this.deliveryTypes = [];
    this.polios = []; this.bcgs = []; this.dpts = []; this.vitaminAs = []; this.hepatitisBs = []; this.measlesList = [];
  }

  loadMasters() {
    this.apiService.getImmunizationPageMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.resetMasters();
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'birth_weight')
              this.birthWeights.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'delivery_type')
              this.deliveryTypes.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'polio')
              this.polios.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'bcg')
              this.bcgs.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'dpt')
              this.dpts.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'vitamin_a')
              this.vitaminAs.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'hepatitis_b')
              this.hepatitisBs.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'measles')
              this.measlesList.push({ name: masterRow.name, id: masterRow.id });
          });
          this.afterMasterDataLoads();
        }
      })
  }

  createFormControls() {
    //for habits
    this.birthWeight = new FormControl('', Validators.required);
    this.deliveryType = new FormControl('', Validators.required);
    this.polio = new FormControl();
    this.bcg = new FormControl();
    this.dpt = new FormControl();
    this.vitaminA = new FormControl();
    this.hepatitisB = new FormControl();
    this.measles = new FormControl();
  }

  createForm() {
    this.immunizationForm = new FormGroup({
      birthWeight: this.birthWeight,
      deliveryType: this.deliveryType,
      polio: this.polio,
      bcg: this.bcg,
      dpt: this.dpt,
      vitaminA: this.vitaminA,
      hepatitisB: this.hepatitisB,
      measles: this.measles
    });
  }

  setDefaults() {
  }


  //save and load data
  getStrDataToAdd(ctrl, curEncId, encNodeId, createdBy, createdAt) {
    var str = '';

    if (ctrl.value) {
      ctrl.value.forEach((thisDosage, index) => {
        str += "(";
        str += curEncId + ",";
        str += encNodeId + ",";
        str += thisDosage.id + ",";
        str += createdBy + ",";
        str += "'" + createdAt + "'"
        str += ")";
        if (index != ctrl.value.length - 1)
          str += ',';
      });
    }

    return str;
  }

  saveImmunization() {
    var curEncId = this.curBen.curEncId;
    var encNodeId = this.utilities.getCurEncNodeId();
    var createdAt = this.datePipe.transform(Date.now(), 'yyyy-MM-dd HH:mm:ss');
    var createdBy = this.curStaff.staffId;

    var strPolioToAdd = this.getStrDataToAdd(this.polio, curEncId, encNodeId, createdBy, createdAt);
    var strBcgToAdd = this.getStrDataToAdd(this.bcg, curEncId, encNodeId, createdBy, createdAt);
    var strDptToAdd = this.getStrDataToAdd(this.dpt, curEncId, encNodeId, createdBy, createdAt);
    var strMeaslesToAdd = this.getStrDataToAdd(this.measles, curEncId, encNodeId, createdBy, createdAt);
    var strHepatitisBToAdd = this.getStrDataToAdd(this.hepatitisB, curEncId, encNodeId, createdBy, createdAt);
    var strVitaminAToAdd = this.getStrDataToAdd(this.vitaminA, curEncId, encNodeId, createdBy, createdAt);

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.saveImmunization(this.curBen.curEncId, this.utilities.getCurEncNodeId(),
      this.curBen.benId, this.curBen.benNodeId, this.deliveryType.value, this.birthWeight.value, this.curStaff.staffId,
      strPolioToAdd, strBcgToAdd, strDptToAdd, strMeaslesToAdd, strHepatitisBToAdd, strVitaminAToAdd)
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

  loadImmunizationData() {
    this.apiService.getImmunization(this.curBen.benId, this.curBen.benNodeId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setImmunizationData(data[0][0], data[1], data[2], data[3], data[4], data[5], data[6]);
        }
      });
  }

  setImmunizationData(immData, polioData, bcgData, dptData, measlesData, hepatitisBData, vitaminAData) {
    if (!immData) return;

    this.deliveryType.setValue(immData['delivery_type_id']);
    this.birthWeight.setValue(immData['birth_weight_id']);

    this.setVaccinationCtrl(polioData, this.polio, this.polios, 'polio_id');
    this.setVaccinationCtrl(bcgData, this.bcg, this.bcgs, 'bcg_id');
    this.setVaccinationCtrl(dptData, this.dpt, this.dpts, 'dpt_id');
    this.setVaccinationCtrl(measlesData, this.measles, this.measlesList, 'measles_id');
    this.setVaccinationCtrl(hepatitisBData, this.hepatitisB, this.hepatitisBs, 'hepatitis_b_id');
    this.setVaccinationCtrl(vitaminAData, this.vitaminA, this.vitaminAs, 'vitamin_a_id');
  }

  setVaccinationCtrl(vaccinationData, vaccinationCtrl, vaccinationMaster, vaccinationId) {
    var vaccinationList = [];
    vaccinationData.forEach(thisVaccination => {
      var thisVaccinationWithName = vaccinationMaster.find(val => val.id == thisVaccination[vaccinationId])
      vaccinationList.push(thisVaccinationWithName);
    });
    vaccinationCtrl.setValue(vaccinationList);
  }
}
