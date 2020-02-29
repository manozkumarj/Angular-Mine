import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { CurBenService } from '../../../../services/cur-ben.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-bmi',
  templateUrl: './bmi.component.html',
  styleUrls: ['./bmi.component.css']
})
export class BmiComponent implements OnInit {

  @Input('view-mode')
  viewMode: boolean = false;

  bmiForm;

  weight; height; bmi; waist;

  //for hints - min max - mandatories, etc
  minHeight = 40; maxHeight = 220;
  strHeightHint = this.minHeight + " to " + this.maxHeight + " cm";

  minWeight = 1; maxWeight = 150;
  strWeightHint = this.minWeight + " to " + this.maxWeight + " kg";

  minWaist = 10; maxWaist = 200
  strWaistHint = this.minWaist + " to " + this.maxWaist + " cm";

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
    this.setDefaults();

    this.loadBmiData()
  }

  createFormControls() {
    this.weight = new FormControl('', [Validators.required, Validators.min(this.minWeight), Validators.max(this.maxWeight)]);
    this.height = new FormControl('', [Validators.required, Validators.min(this.minHeight), Validators.max(this.maxHeight)]);
    this.bmi = new FormControl('', Validators.required);
    this.waist = new FormControl('', [Validators.required, Validators.min(this.minWaist), Validators.max(this.maxWaist)]);
  }

  setDefaults() {
    this.bmi.disable();
  }

  createForm() {
    this.bmiForm = new FormGroup({
      weight: this.weight,
      height: this.height,
      bmi: this.bmi,
      waist: this.waist
    });
  }

  //handle userInputs
  heightChanged() {
    this.calculateBmi();
  }

  weightChanged() {
    this.calculateBmi();
  }

  calculateBmi() {
    var height = this.height.value;
    var weight = this.weight.value;
    if (height && weight && this.areHeightWeightValid()) {
      var heightInMeters = height / 100;
      var bmi = weight / (heightInMeters * heightInMeters); //bmi = weight/ height^2      
      this.bmi.setValue(bmi.toFixed(2));
    }
    else
      this.bmi.setValue('');
  }

  areHeightWeightValid() {
    var height = this.height.value;
    var weight = this.weight.value;
    if (height == 0) {
      swal({ title: "Error", text: "Height cannot be 0. Please check and try again", type: 'error' });
      return false;
    }
    if (height < 0) {
      swal({ title: "Error", text: "Height cannot be negative. Please check and try again", type: 'error' });
      return false;
    }
    else if (weight == 0) {
      swal({ title: "Error", text: "Weight cannot be 0. Please check and try again", type: 'error' });
      return false;
    }
    else if (weight < 0) {
      swal({ title: "Error", text: "Weight cannot be negative. Please check and try again", type: 'error' });
      return false;
    }
    else
      return true;
  }

  //save and load data
  saveBmi() {

    if (!this.areHeightWeightValid())
      return;

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.saveBmi(this.curBen.curEncId, this.utilities.getCurEncNodeId(),
      this.height.value, this.weight.value, this.bmi.value, this.waist.value,
      this.curStaff.staffId)
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

  loadBmiData() {
    this.apiService.getBmi(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setBmiData(data[0][0]);
        }
      });
  }

  setBmiData(bmiData) {
    if (!bmiData) return;

    this.hasData.emit();

    this.height.setValue(bmiData['height']);
    this.weight.setValue(bmiData['weight']);
    this.bmi.setValue(bmiData['bmi']);
    this.waist.setValue(bmiData['waist']);
  }
}