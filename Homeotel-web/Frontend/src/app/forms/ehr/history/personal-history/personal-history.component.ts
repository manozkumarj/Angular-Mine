import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { FormControl, FormGroup } from '@angular/forms';
import swal from 'sweetalert2';
import { CurBenService } from '../../../../services/cur-ben.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-personal-history',
  templateUrl: './personal-history.component.html',
  styleUrls: ['./personal-history.component.css']
})
export class PersonalHistoryComponent implements OnInit {

  personalHistoryForm;

  allergy; otherAllergy; appetite; bowelMovement; defecation; handWashing; occupation; drinkingWater; mosquitoExposure;

  //masters  
  allergies = []; appetites = []; bowelMovements = []; defecations = []; handWashings = []; occupations = []; drinkingWaters = []; mosquitoExposures = [];

  @Output() hasData = new EventEmitter<any>();

  constructor(public apiService: ApiService, public curStaff: CurStaffService, public utilities: UtilitiesService,
    public curBen: CurBenService, public datePipe: DatePipe) { }

  ngOnInit() {
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

    this.loadPersonalHistory();
  }

  resetMasters() {
    this.allergies = []; this.appetites = []; this.bowelMovements = []; this.defecations = []; this.handWashings = [];
    this.occupations = []; this.drinkingWaters = []; this.mosquitoExposures = [];
  }

  loadMasters() {
    this.apiService.getHistoryPhComponentMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.resetMasters();
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'allergy')
              this.allergies.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'appetite')
              this.appetites.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'bowel_movement')
              this.bowelMovements.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'defecation')
              this.defecations.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'hand_washing')
              this.handWashings.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'occupation')
              this.occupations.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'drinking_water')
              this.drinkingWaters.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'mosquito_exposure')
              this.mosquitoExposures.push({ name: masterRow.name, id: masterRow.id });
          });
          this.afterMasterDataLoads();
        }
      })
  }

  createFormControls() {
    this.allergy = new FormControl();
    this.otherAllergy = new FormControl();
    this.appetite = new FormControl();
    this.bowelMovement = new FormControl();
    this.defecation = new FormControl();
    this.handWashing = new FormControl();
    this.occupation = new FormControl();
    this.drinkingWater = new FormControl();
    this.mosquitoExposure = new FormControl();
  }

  createForm() {
    this.personalHistoryForm = new FormGroup({
      allergy: this.allergy,
      otherAllergy: this.otherAllergy,
      appetite: this.appetite,
      bowelMovement: this.bowelMovement,
      defecation: this.defecation,
      handWashing: this.handWashing,
      occupation: this.occupation,
      drinkingWater: this.drinkingWater,
      mosquitoExposure: this.mosquitoExposure
    });
  }

  setDefaults() {
    this.allergyChanged();
  }

  //handling user inputs
  allergyChanged() {
    this.utilities.multiSelectEnableDisableOtherCtrl(this.allergy, this.otherAllergy);
  }

  savePersonalHistory() {

    var curEncId = this.curBen.curEncId;
    var encNodeId = this.utilities.getCurEncNodeId();
    var createdAt = this.datePipe.transform(Date.now(), 'yyyy-MM-dd HH:mm:ss');

    var strAllergiesToAdd = '';
    this.allergy.value.forEach((thisAllergy, index) => {
      strAllergiesToAdd += "(";
      strAllergiesToAdd += curEncId + ",";
      strAllergiesToAdd += encNodeId + ",";
      strAllergiesToAdd += thisAllergy.id + ",";
      if (thisAllergy.name.toLowerCase().indexOf('other') > -1)
        strAllergiesToAdd += "'" + this.otherAllergy.value + "',";
      else
        strAllergiesToAdd += "null" + ",";
      strAllergiesToAdd += this.curStaff.staffId + ",";
      strAllergiesToAdd += "'" + createdAt + "'"
      strAllergiesToAdd += ")";
      if (index != this.allergy.value.length - 1)
        strAllergiesToAdd += ',';
    });

    /* TODO - make sure all PKs, FKs, NULL, Auto Inc. settings etc are properly set in all tables @ database */

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.savePersonalHistory(this.curBen.curEncId, this.utilities.getCurEncNodeId(), strAllergiesToAdd,
      this.appetite.value, this.bowelMovement.value, this.defecation.value, this.handWashing.value,
      this.occupation.value, this.drinkingWater.value, this.mosquitoExposure.value, this.curStaff.staffId)
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

  loadPersonalHistory() {
    this.apiService.getPersonalHistory(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setPersonalHistoryData(data[0][0], data[1]);
        }
      });
  }

  setPersonalHistoryData(otherPersonalHistoryData, allergiesData) {
    //this.allergy.setValue(allergiesData);
    var allergiesList = [];
    allergiesData.forEach(thisAllergy => {
      var thisAllergyWithName = this.allergies.find(val => val.id == thisAllergy['allergy_id'])
      allergiesList.push(thisAllergyWithName);
      if (thisAllergyWithName.name.toLowerCase().indexOf('other') > -1)
        this.otherAllergy.setValue(thisAllergy['other_allergy']);
    });
    this.allergy.setValue(allergiesList);

    if (allergiesList.length > 0 || otherPersonalHistoryData)
      this.hasData.emit();

    if (!otherPersonalHistoryData) return;
    this.appetite.setValue(otherPersonalHistoryData['appetite_id']);
    this.bowelMovement.setValue(otherPersonalHistoryData['bowel_movement_id']);
    this.defecation.setValue(otherPersonalHistoryData['defecation_id']);
    this.handWashing.setValue(otherPersonalHistoryData['hand_washing_id']);
    this.occupation.setValue(otherPersonalHistoryData['occupation_id']);
    this.drinkingWater.setValue(otherPersonalHistoryData['drinking_water_id']);
    this.mosquitoExposure.setValue(otherPersonalHistoryData['mosquito_exposure_id']);

    this.allergyChanged();
  }
}
