import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CurStaffService } from '../../../services/cur-staff.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { CurBenService } from '../../../services/cur-ben.service';
import { Router } from '@angular/router';
import { UtilitiesService } from '../../../services/utilities.service';


const MY_DATE_FORMATS = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' }
  },
  display: {
    // dateInput: { month: 'short', year: 'numeric', day: 'numeric' }, - test
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  }
};


export class MyDateAdapter extends NativeDateAdapter {
  format(date: Date, displayFormat: Object): string {
    if (displayFormat == "input") {
      let day = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      return this._to2digit(day) + '-' + this._to2digit(month) + '-' + year;
    } else {
      return date.toDateString();
    }
  }

  _to2digit(n: number) {
    return ('00' + n).slice(-2);
  }
}


@Component({
  selector: 'app-doctor-registration',
  templateUrl: './doctor-registration.component.html',
  styleUrls: ['./doctor-registration.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ]
})
export class DoctorRegistrationComponent implements OnInit, AfterViewInit {
  firstName; lastName; gender;
  age; ageUnit; dob;
  phoneNumber; email; doctorType;
  maxDob;minDob;
  doctorRegistraion: FormGroup;
  genders = []; ageUnits = []; doctorTypes = [];
  @ViewChild('firstNameElement') firstNameElement: ElementRef;
  constructor(public datePipe: DatePipe, public authService: AuthService, public apiService: ApiService,
    public curBen: CurBenService, public curStaff: CurStaffService, public router: Router, public utilities: UtilitiesService) {

     }

  ngOnInit() {
    this.initialiseForm();
  }
  ngAfterViewInit() {
    this.firstNameElement.nativeElement.focus();
    this.utilities.setStyles();
  }
  initialiseForm(){
    this.loadMasters();
    this.createFormControl();
    this.createForm();
    this.setDefaults();
    this.utilities.setStyles();
  }
  createFormControl(){


    this.firstName = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]+'), Validators.minLength(3)]);
    this.lastName = new FormControl('', Validators.pattern('^[a-zA-Z ]+'));
    this.gender = new FormControl('', Validators.required);
    this.age = new FormControl('', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]+')]);
    this.ageUnit = new FormControl('', Validators.required);
    this.dob = new FormControl();
    this.phoneNumber = new FormControl('', [Validators.pattern('^[0-9]+'), Validators.minLength(10), Validators.maxLength(10)]);
    this.email = new FormControl('',[Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$')]);
    this.doctorType = new FormControl('', Validators.required);
  }

  createForm() {
    this.doctorRegistraion = new FormGroup({
      firstName: this.firstName,
      lastName: this.lastName,
      gender: this.gender,
      age: this.age,
      ageUnit: this.ageUnit,
      phoneNumber: this.phoneNumber,
      email: this.email,
      doctorType: this.doctorType
    })
  }
  loadMasters(){
      this.genders=[{id: 1, name: 'Male'},{id: 2, name: 'Female'}];
     this.ageUnits = [{id:1, name: 'Years'}, {id: 2, name: 'Month'}, {id: 3, name: 'Days'}];
     this.doctorTypes = [{id:1, name:'Junior Doctor'}, {id: 2, name: 'Senior Doctor'}]
  }
  setDefaults() {
    this.ageUnit.setValue(1);
    this.maxDob = this.datePipe.transform(Date.now(), 'yyyy-MM-dd');
    this.minDob = '1900-01-01';
  }

  dobChanged(event) {
    var timeDiff = Math.abs(Date.now() - this.dob.value);
    var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
    if (diffDays < 30) {
      this.ageUnit.setValue(3);
      this.age.setValue(diffDays);
    }
    else if (diffDays < 365) {
      this.ageUnit.setValue(2);
      this.age.setValue(Math.floor(diffDays / 30));
    }
    else {
      this.ageUnit.setValue(1);
      this.age.setValue(Math.floor(diffDays / 365));
    }


  }
onSubmit(){

}
ageChanged() {


  var today = new Date();
  var age = this.age.value;
  if (this.ageUnit.value == 1) {
    var currentYear = today.getFullYear();
    var dobYear = currentYear - age;
    var dob = new Date(dobYear, today.getMonth(), today.getDate())
  }
  else if (this.ageUnit.value == 2) {
    var currentMonth = today.getMonth();
    var dobMonth = currentMonth - age;
    var dob = new Date(today.getFullYear(), dobMonth, today.getDate())
  }
  if (this.ageUnit.value == 3) {
    var currentDate = today.getDate();
    var dobDate = currentDate - age;
    var dob = new Date(today.getFullYear(), today.getMonth(), dobDate)
  }
  this.dob.setValue(dob);


}

}
