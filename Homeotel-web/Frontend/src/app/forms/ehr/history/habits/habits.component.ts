import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../../../services/api.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import swal from 'sweetalert2';
import { CurBenService } from '../../../../services/cur-ben.service';

@Component({
  selector: 'app-habits',
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css']
})
export class HabitsComponent implements OnInit {

  habitsForm;

  smoking; smokingDuration; smokingFrequency; alcohol; alcoholDuration; alcoholFrequency; exercise; exerciseDuration; exerciseFrequency;

  //temp variables    
  doesSmoking = false; doesAlcohol = false; doesExercise = false;

  //masters
  smokings = []; alcohols = []; exercises = [];

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
  }

  afterMasterDataLoads() {
    this.setDefaults();
    this.utilities.setStyles();

    this.loadHabits();
  }

  resetMasters() {
    this.smokings = []; this.alcohols = []; this.exercises = [];
  }

  loadMasters() {
    this.apiService.getHistoryHabitsComponentMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.resetMasters();
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'alcohol')
              this.alcohols.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'smoking')
              this.smokings.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'exercise')
              this.exercises.push({ name: masterRow.name, id: masterRow.id });
          });

          this.afterMasterDataLoads();
        }
      })
  }

  createFormControls() {
    this.alcohol = new FormControl('', Validators.required);
    this.alcoholDuration = new FormControl();
    this.alcoholFrequency = new FormControl();
    this.smoking = new FormControl('', Validators.required);
    this.smokingDuration = new FormControl();
    this.smokingFrequency = new FormControl();
    this.exercise = new FormControl('', Validators.required);
    this.exerciseDuration = new FormControl();
    this.exerciseFrequency = new FormControl();
  }

  createForm() {
    this.habitsForm = new FormGroup({
      alcohol: this.alcohol,
      alcoholDuration: this.alcoholDuration,
      alcoholFrequency: this.alcoholFrequency,
      smoking: this.smoking,
      smokingDuration: this.smokingDuration,
      smokingFrequency: this.smokingFrequency,
      exercise: this.exercise,
      exerciseDuration: this.exerciseDuration,
      exerciseFrequency: this.exerciseFrequency
    });
  }

  setDefaults() {
    this.smokingChanged();
    this.alcoholChanged();
    this.exerciseChanged();
  }

  //handling user inputs
  smokingChanged() {
    this.utilities.enableDisableDependentCtrls(this.smoking, this.smokingDuration, this.smokingFrequency);
  }

  alcoholChanged() {
    this.utilities.enableDisableDependentCtrls(this.alcohol, this.alcoholDuration, this.alcoholFrequency);
  }

  exerciseChanged() {
    this.utilities.enableDisableDependentCtrls(this.exercise, this.exerciseDuration, this.exerciseFrequency);
  }

  //save and load data
  saveHabits() {

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.saveHistoryHabits(this.curBen.curEncId, this.utilities.getCurEncNodeId(),
      this.smoking.value.id, this.smokingDuration.value, this.smokingFrequency.value,
      this.alcohol.value.id, this.alcoholDuration.value, this.alcoholFrequency.value,
      this.exercise.value.id, this.exerciseDuration.value, this.exerciseFrequency.value,
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

  loadHabits() {
    this.apiService.getHistoryHabits(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setHabitsData(data[0][0]);
        }
      });
  }

  setHabitsData(habitsData) {
    if (!habitsData) return;

    this.hasData.emit();

    this.smoking.setValue(this.smokings.find(val => val.id == habitsData['smoking_id']));
    this.smokingDuration.setValue(habitsData['smoking_duration']);
    this.smokingFrequency.setValue(habitsData['smoking_freq']);

    this.alcohol.setValue(this.alcohols.find(val => val.id == habitsData['alcohol_id']));
    this.alcoholDuration.setValue(habitsData['alcohol_duration']);
    this.alcoholFrequency.setValue(habitsData['alcohol_freq']);

    this.exercise.setValue(this.exercises.find(val => val.id == habitsData['exercise_id']));
    this.exerciseDuration.setValue(habitsData['exercise_duration']);
    this.exerciseFrequency.setValue(habitsData['exercise_freq']);

    this.smokingChanged();
    this.alcoholChanged();
    this.exerciseChanged();
  }
}
