import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from "@angular/material";
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { CurBenService } from '../../../services/cur-ben.service';
import { CurStaffService } from '../../../services/cur-staff.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { Subject } from 'rxjs';
import swal from 'sweetalert2';

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
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MyDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ]
})
export class RegistrationComponent implements OnInit, AfterViewInit {

  regForm: FormGroup;

  firstName; lastName; gender;
  age; ageUnit; dob; maritalStatus;
  fatherName; husbandName; phoneNumber; benCategoryType;
  idProofType; idProofValue; isPiramalStaff;
  literacyType; socialStatus; economicStatus;
  district; mandal; village; otherLocation;
  email; religion; nationality;

  //temp variables
  maxDob; minDob; isMarriedWoman; disableMaritalStatus; isOtherLocation;
  cameraRolling; capturePhotoObservable = new Subject();
  photoImgData; benPhotoExists;
  isFreshPhotoCaptured = false;
  // tele-homeo
  consultationFor;
  relationWithConsultant;
  relationVisiblity = false;
  differentAdressVisibilty = false;
  delivery;
  occupation;
  relations =
    [
      { id: 1, name: "Mother" },
      { id: 2, name: "Father" },
      { id: 3, name: "Spouse" },
      { id: 4, name: "Child" },
      { id: 5, name: "Sibling" },
      { id: 6, name: "Aunt" },
      { id: 7, name: "Uncle" },
    ]

  religions =
    [
      { id: 1, name: "Hindu" },
      { id: 2, name: "Muslim" },
      { id: 3, name: "Christian" }
    ]

  nationalities =
    [
      { id: 1, name: "India" },
      { id: 2, name: "US" },
      { id: 3, name: "China" }
    ]

  Consultations = [
    { id: 1, name: "Self" },
    { id: 2, name: "Family" },
    { id: 3, name: "Friends" }
  ]

  occupationTypes = [
    { id: 1, shift: "Rotational Shift" },
    { id: 2, shift: "Night Shift" },
    { id: 3, shift: "General Shift" },
  ]

  deliveryTypes =
    [

      { id: 1, type: "Will Collect By Myself" },
      { id: 2, type: "Post To My Address" },
      { id: 3, type: "Post To Different Adress" }
    ]
  //masters
  genders = []; ageUnits = []; maritalStatuses = []; benCategoryTypes = []; allBenCategoryTypes = []; idProofTypes = [];
  literacyTypes = []; socialStatuses = []; economicStatuses = [];
  districts = []; mandals = []; villages = [];

  @ViewChild('firstNameElement') firstNameElement: ElementRef;
  constructor(public datePipe: DatePipe, public authService: AuthService, public apiService: ApiService,
    public curBen: CurBenService, public curStaff: CurStaffService, public router: Router, public utilities: UtilitiesService) {

  }

  ngOnInit() {
    if (!this.curStaff.canRegisterBen())
      this.curBen.returnIfBenNotLoaded();
    this.initialiseForm();
  }

  ngAfterViewInit() {
    this.firstNameElement.nativeElement.focus();
    this.utilities.setStyles();
  }

  initialiseForm() {
    this.relationVisiblity = false;
    this.differentAdressVisibilty = false;
    this.loadMasters();
    this.createFormControls();
    this.createForm();
  }

  afterMasterDataLoads() {
    this.setDefaults();
    this.utilities.setStyles();
    this.setCurBenMasters();

    this.loadBenPhoto();
    this.loadBenDetails();
  }

  resetMasters() {
    this.genders = []; this.ageUnits = []; this.maritalStatuses = []; this.benCategoryTypes = [];
    this.allBenCategoryTypes = []; this.idProofTypes = [];
    this.literacyTypes = []; this.socialStatuses = []; this.economicStatuses = [];
    this.districts = []; this.mandals = []; this.villages = [];
  }

  setCurBenMasters() {
    this.curBen.genders = this.genders;
    this.curBen.ageUnits = this.ageUnits;
    this.curBen.idProofTypes = this.idProofTypes;
  }

  loadMasters() {
    this.apiService.getRegistrationPageMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.resetMasters();
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'gender')
              this.genders.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'age_unit')
              this.ageUnits.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'marital_status')
              this.maritalStatuses.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'ben_category')
              this.allBenCategoryTypes.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'id_proof_type')
              this.idProofTypes.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'literacy_type')
              this.literacyTypes.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'economic_status')
              this.economicStatuses.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'social_status')
              this.socialStatuses.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'district')
              this.districts.push({ name: masterRow.name, id: masterRow.id });
          });

          this.afterMasterDataLoads();
        }
      })
    /* TODO - double check if unsubscribing is not required for http requests..  */
    /* TODO - Check entire application for any other type of subscriptions and close them onNgDestroy */
  }

  getMandalMaster(districtId, setMandalId = 0) {
    if (!districtId || districtId == 25) return; //corresponds to "OTHERS" @ m_reg_district            

    this.apiService.getMandals(districtId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while getting the mandal master", type: 'error' });
          console.log(data);
        }
        else {
          var masterData = data[0];
          this.mandals = [];
          masterData.forEach(masterRow => {
            this.mandals.push({ name: masterRow.name, id: masterRow.id });
          });

          if (setMandalId)
            this.mandal.setValue(setMandalId);
          else
            this.mandal.setValue();
        }
      })
  }

  getVillageMaster(mandalId, setVillageId = 0) {
    if (!mandalId) return; //usually happens when loading a ben with other location

    this.apiService.getVillages(mandalId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while getting villages Master", type: 'error' });
          console.log(data);
        }
        else {
          var masterData = data[0];
          this.villages = [];
          masterData.forEach(masterRow => {
            this.villages.push({ name: masterRow.name, id: masterRow.id });
          });

          if (setVillageId)
            this.village.setValue(setVillageId);
          else
            this.village.setValue()
        }
      })
  }

  createFormControls() {

    this.consultationFor = new FormControl('');
    this.relationWithConsultant = new FormControl('')
    this.firstName = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]+'), Validators.minLength(3)]);
    this.lastName = new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z ]+')]);
    this.gender = new FormControl('', [Validators.required]);
    this.age = new FormControl('', [Validators.min(1), Validators.pattern('^[0-9]+')]);
    this.ageUnit = new FormControl('');
    this.dob = new FormControl('', [Validators.required]);
    this.maritalStatus = new FormControl();
    this.occupation = new FormControl();
    this.fatherName = new FormControl('', [Validators.pattern('^[a-zA-Z ]+')]);
    this.husbandName = new FormControl('', [Validators.pattern('^[a-zA-Z ]+')]);
    this.phoneNumber = new FormControl('', [Validators.pattern('^[0-9]+'), Validators.minLength(10), Validators.maxLength(10)]);
    this.benCategoryType = new FormControl('');
    this.idProofType = new FormControl();
    this.idProofValue = new FormControl();
    this.isPiramalStaff = new FormControl(0);
    this.literacyType = new FormControl('1');
    this.economicStatus = new FormControl('1');
    this.socialStatus = new FormControl('1');
    this.district = new FormControl('1');
    this.mandal = new FormControl('1');
    this.village = new FormControl('1');
    this.otherLocation = new FormControl('test');
    this.delivery = new FormControl();
    this.email = new FormControl();
    this.religion = new FormControl();
    this.nationality = new FormControl();
  }
  //TODO - set required validator to father/ husband name as the case maybe dynamically
  //TODO - set mandal, village OR otherLocation as mandatory as the case may be
  //TODO - set the max allowed age value validator based on the age unit selected dynamically

  createForm() {
    this.regForm = new FormGroup({
      consultationFor: this.consultationFor,
      relationWithConsultant: this.relationWithConsultant,
      firstName: this.firstName,
      lastName: this.lastName,
      gender: this.gender,
      age: this.age,
      ageUnit: this.ageUnit,
      maritalStatus: this.maritalStatus,
      occupation: this.occupation,
      fatherName: this.fatherName,
      husbandName: this.husbandName,
      phoneNumber: this.phoneNumber,
      benCategoryType: this.benCategoryType,
      idProofType: this.idProofType,
      idProofValue: this.idProofValue,
      isPiramalStaff: this.isPiramalStaff,
      literacyType: this.literacyType,
      economicStatus: this.economicStatus,
      socialStatus: this.socialStatus,
      district: this.district,
      mandal: this.mandal,
      village: this.village,
      otherLocation: this.otherLocation,
      delivery: this.delivery,
    })
  }

  setDefaults() {
    this.ageUnit.setValue(1);
    this.maxDob = this.datePipe.transform(Date.now(), 'yyyy-MM-dd');
    this.minDob = '1900-01-01';
    this.isMarriedWoman = false;
    this.isOtherLocation = false;
    this.cameraRolling = false;
    this.benPhotoExists = false;

    //setting the default village as the latest registered village for MMU
    if (this.utilities.getThisSystemNodeId() == 2 &&
      localStorage.getItem('mmu_district_id') && localStorage.getItem('mmu_mandal_id') && localStorage.getItem('mmu_village_id')) {
      this.district.setValue(parseInt(localStorage.getItem('mmu_district_id')));
      this.mandal.setValue(parseInt(localStorage.getItem('mmu_mandal_id')));
      this.village.setValue(parseInt(localStorage.getItem('mmu_village_id')));

      this.getMandalMaster(this.district.value, this.mandal.value);
      this.getVillageMaster(this.mandal.value, this.village.value);
    }
  }

  //User events handling
  idProofTypeChanged() {
    if (this.idProofType.value == 1) { // Aadhar
      this.idProofValue.setValidators([Validators.pattern('^[0-9]+'), Validators.minLength(12), Validators.maxLength(12)]);
      this.idProofValue.updateValueAndValidity();
    }
    else if (this.idProofType.value == 2) { // Voter Card
      this.idProofValue.setValidators([Validators.pattern('^[A-Za-z]{3}[0-9]{7}$')]);
      this.idProofValue.updateValueAndValidity();
    }
    else if (this.idProofType.value == 3) { // Ration Card
      this.idProofValue.setValidators([Validators.pattern('^[A-Za-z]{3}[0-9]{12}$')]);
      this.idProofValue.updateValueAndValidity();
    }
    else if (this.idProofType.value == 4) { // PAN Card
      this.idProofValue.setValidators([Validators.pattern('^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$')]);
      this.idProofValue.updateValueAndValidity();
    }
    else { // other
      this.idProofValue.setValidators();
      this.idProofValue.updateValueAndValidity();
    }
  }

  idProofValueChanged() {
    var enteredIdProofValue = this.idProofValue.value;
    if (enteredIdProofValue)
      this.idProofValue.setValue(enteredIdProofValue.toUpperCase())
  }

  firstNameChanged() {
    var enteredFirstName = this.firstName.value;
    if (enteredFirstName)
      this.firstName.setValue(enteredFirstName.toUpperCase())
  }

  lastNameChanged() {
    var enteredLastName = this.lastName.value;
    if (enteredLastName)
      this.lastName.setValue(enteredLastName.toUpperCase())
  }

  fatherNameChanged() {
    var enteredFatherName = this.fatherName.value;
    if (enteredFatherName)
      this.fatherName.setValue(enteredFatherName.toUpperCase())
  }

  husbandNameChanged() {
    var enteredHusbandName = this.husbandName.value;
    if (enteredHusbandName)
      this.husbandName.setValue(enteredHusbandName.toUpperCase())
  }


  districtChanged() {
    this.mandal.setValue();
    this.village.setValue();

    if (this.district.value == 25) { //corresponds to "OTHERS" @ m_reg_district      
      this.isOtherLocation = true;

      this.otherLocation.setValidators();
      this.otherLocation.updateValueAndValidity();
      this.village.setValidators();
      this.village.updateValueAndValidity();
      this.mandal.setValidators();
      this.mandal.updateValueAndValidity();
    }
    else {
      this.isOtherLocation = false;

      this.otherLocation.setValidators();
      this.otherLocation.updateValueAndValidity();
      this.village.setValidators();
      this.village.updateValueAndValidity();
      this.mandal.setValidators();
      this.mandal.updateValueAndValidity();

      this.getMandalMaster(this.district.value);
    }
  }

  mandalChanged() {
    this.village.setValue();
    this.getVillageMaster(this.mandal.value);
  }

  maritalStatusChanged() {
    this.setIsMarriedWoman();
  }

  ageChanged() {
    this.enableDisableMaritalStatus();
    this.setBenCategoryTypes();

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

    this.setDefaultBenCategory();
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

    this.setDefaultBenCategory();
  }

  genderChanged() {
    this.setIsMarriedWoman();
    this.setBenCategoryTypes();
  }

  enableDisableMaritalStatus() {
    if (this.age.value > 15 && this.ageUnit.value == 1) //age_unit_id == 1 for years (@m_reg_age_unit)       
      this.disableMaritalStatus = false;
    else {
      this.maritalStatus.setValue(0);
      this.disableMaritalStatus = true;
    }
    this.setIsMarriedWoman();
  }

  setIsMarriedWoman() {
    //unmarried = 2 @ m_reg_marital status
    //female = 2 @ m_reg_gender
    var genderId = this.gender.value;
    var maritalStatusId = this.maritalStatus.value;
    if (maritalStatusId && genderId && maritalStatusId != 2 && genderId == 2) {
      this.isMarriedWoman = true;
      this.fatherName.setValue('');
    }
    else {
      this.isMarriedWoman = false;
      this.husbandName.setValue('');
    }
  }

  setBenCategoryTypes(setBenCategoryTypeId = 0) {
    //female = 2 @ m_reg_gender
    //age_unit_id = 1 for years
    //show only enc_type_id = 1 (general) and = 2 (pediatric) for others
    //show all enct_types for female and age above 15 years
    var genderId = this.gender.value;
    var age = this.age.value;
    var ageUnitId = this.ageUnit.value;
    if (age > 15 && ageUnitId == 1 && genderId == 2)
      this.benCategoryTypes = this.allBenCategoryTypes;
    else {
      this.benCategoryTypes = [];
      this.allBenCategoryTypes.forEach(benCategoryType => {
        if (benCategoryType.id == 1 || benCategoryType.id == 2)
          this.benCategoryTypes.push(benCategoryType)
      });
    }

    if (setBenCategoryTypeId)
      this.benCategoryType.setValue(setBenCategoryTypeId);
    else
      this.benCategoryType.setValue();
  }

  setDefaultBenCategory(setCategoryTypeId = 0) {
    if (this.curStaff.canRegisterBen()) {
      //setting by default as gen or pedia based on age
      if (this.age.value > 18 && this.ageUnit.value == 1)
        this.benCategoryType.setValue(1);
      else
        this.benCategoryType.setValue(2);
    }
    else
      this.benCategoryType.setValue(setCategoryTypeId);
  }

  startCamera() {
    this.cameraRolling = true;
  }

  takePhoto() {
    this.cameraRolling = false;
    this.capturePhotoObservable.next();
  }

  photoCaptured(data) {
    this.isFreshPhotoCaptured = true;
    this.photoImgData = data.imageAsBase64;
    this.benPhotoExists = true;
    /* TODO - Compress image before sending to server */
  }

  getPhotoDataUrl() {
    if (this.photoImgData)
      return "data:image/jpeg;base64," + this.photoImgData;
    else
      return "assets/images/photo-male-generic.png";
  }

  register() {
    var dob = this.dob.value == '' ? '' : this.datePipe.transform(this.dob.value, 'yyyy-MM-dd');

    //if this is MMU, let's save the village and mandal to be reused for the rest of the session
    if (this.utilities.getThisSystemNodeId() == 2) {
      localStorage.setItem('mmu_district_id', this.district.value);
      localStorage.setItem('mmu_mandal_id', this.mandal.value);
      localStorage.setItem('mmu_village_id', this.village.value);
    }

    this.apiService.registerBeneficiary(this.photoImgData, this.firstName.value, this.lastName.value, dob, this.age.value,
      this.ageUnit.value, this.gender.value, this.fatherName.value, this.husbandName.value, this.maritalStatus.value,
      this.socialStatus.value, this.economicStatus.value, this.idProofType.value, this.idProofValue.value,
      this.literacyType.value, this.isPiramalStaff.value, this.phoneNumber.value, this.village.value,
      this.mandal.value, this.district.value, this.otherLocation.value, this.benCategoryType.value,
      this.occupation.value, this.religion.value, this.nationality.value, this.email.value, "", "", "", "", "", "")
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while registering the beneficiary", type: 'error' });
          console.log(data);
        }
        else {
          var newBenId = data[0][0]['new_ben_id'];
          var newEncId = data[0][0]['new_enc_id'];

          this.curBen.benId = newBenId;
          this.curBen.benNodeId = this.utilities.getThisSystemNodeId(); //because this is a new registration
          this.curBen.curEncId = newEncId;

          this.loadBenPhoto();
          this.loadBenDetails();

          this.utilities.openSnackBar("Registered beneficiary successfully!", "Success");
          // swal({ title: "Success", text: "Registered beneficiary successfully!", type: 'success' });
        }
      })
  }

  revisit() {
    this.apiService.revisitBeneficiary(this.isFreshPhotoCaptured, this.photoImgData, this.benCategoryType.value)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while revisiting the beneficiary", type: 'error' });
          console.log(data);
        }
        else {
          var newEncId = data[0][0]['new_enc_id'];
          this.curBen.curEncId = newEncId;

          if (this.isFreshPhotoCaptured)
            this.loadBenPhoto();

          this.loadBenDetails();
          this.utilities.openSnackBar("Revisit created successfully!", "Success");
          // swal({ title: "Success", text: "Revisit created successfully!", type: 'success' });
        }
      })
  }

  updateBenDetails() {
    var dob = this.dob.value == '' ? '' : this.datePipe.transform(this.dob.value, 'yyyy-MM-dd');

    this.apiService.updateBeneficiaryDetails(this.photoImgData, this.firstName.value, this.lastName.value, dob, this.age.value,
      this.ageUnit.value, this.fatherName.value, this.husbandName.value, this.maritalStatus.value,
      this.socialStatus.value, this.economicStatus.value, this.idProofType.value, this.idProofValue.value,
      this.literacyType.value, this.isPiramalStaff.value, this.phoneNumber.value, this.village.value,
      this.mandal.value, this.district.value, this.otherLocation.value, this.occupation.value, this.religion.value, this.nationality.value, this.email.value)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while registering the beneficiary", type: 'error' });
          console.log(data);
        }
        else {
          if (this.isFreshPhotoCaptured)
            this.loadBenPhoto();

          this.loadBenDetails();
          this.utilities.openSnackBar("Updated beneficiary details successfully!", "Success");
          // swal({ title: "Success", text: "Updated beneficiary details successfully!", type: 'success' });
        }
      })
  }

  loadBenDetails() {
    if (this.curBen.benId == 0) return;

    this.apiService.getBeneficiaryDetails(this.curBen.benNodeId, this.curBen.benId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the beneficiary", type: 'error' });
          console.log(data);
        }
        else {
          this.setBenDetails(data[0][0], data[1][0]);
        }
      });
  }

  loadBenPhoto() {
    if (this.curBen.benId == 0) return;

    this.apiService.getBeneficiaryPhoto(this.curBen.benNodeId, this.curBen.benId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          //Don't sshow any error if there's no photo
          this.isFreshPhotoCaptured = false;
          this.photoImgData = null;
          this.curBen.photoBase64 = null;
          this.benPhotoExists = false;
        }
        else {
          this.isFreshPhotoCaptured = false;
          if (data[0] && data[0][0] && data[0][0]['photo']) {
            this.photoImgData = data[0][0]['photo'];
            this.curBen.photoBase64 = data[0][0]['photo'];
            this.benPhotoExists = true;
          }
          else {
            this.photoImgData = null;
            this.curBen.photoBase64 = null;
            this.benPhotoExists = false;
          }
        }
      });
  }

  setBenDetails(benData, encData) {
    this.firstName.setValue(benData['first_name']);
    this.lastName.setValue(benData['last_name']);
    this.gender.setValue(benData['gender_id']);
    this.age.setValue(benData['age']);
    this.ageUnit.setValue(benData['age_unit_id']);
    this.dob.setValue(benData['dob']);
    this.maritalStatus.setValue(benData['marital_status_id']);
    this.fatherName.setValue(benData['father_name']);
    this.husbandName.setValue(benData['husband_name']);
    this.phoneNumber.setValue(benData['phone']);
    this.idProofType.setValue(benData['id_proof_type_id']);
    this.idProofValue.setValue(benData['id_proof_value']);
    this.isPiramalStaff.setValue(benData['is_piramal_staff']);
    this.socialStatus.setValue(benData['social_status_id']);
    this.economicStatus.setValue(benData['economic_status_id']);
    this.literacyType.setValue(benData['literacy_type_id']);

    this.district.setValue(benData['district_id']);
    this.districtChanged();
    this.otherLocation.setValue(benData['other_location']);
    this.getMandalMaster(benData['district_id'], benData['mandal_id']);
    this.getVillageMaster(benData['mandal_id'], benData['village_id']);

    this.enableDisableMaritalStatus(); //this in turn calls setIsMarriedWoman anyway..

    this.occupation.setValue(benData['occupation_id']);
    this.religion.setValue(benData['religion_id']);
    this.email.setValue(benData['email']);
    this.nationality.setValue(benData['nationality_id'])
    //while fetching the encounter, we are considering only this center's and only today's encounters    
    if (encData == undefined) //no encounter today
    {
      this.curBen.curEncId = 0;
      this.curBen.todaysEncounterStatus = this.curBen.EncounterStatusEnum.No_Encounter_Today;
      this.setBenCategoryTypes();
      this.setDefaultBenCategory();
    }
    else if (encData['is_closed'] == '1') //closed case
    {
      this.curBen.curEncId = encData['enc_id'];
      this.curBen.curEncNodeId = encData['enc_node_id'];
      this.curBen.todaysEncounterStatus = this.curBen.EncounterStatusEnum.Closed_Case;
      this.setBenCategoryTypes();
      this.setDefaultBenCategory(encData['ben_category_id']);
    }
    else if (encData['is_closed'] == '0' && encData['is_tc'] == '0') //open case
    {
      this.curBen.curEncId = encData['enc_id'];
      this.curBen.curEncNodeId = encData['enc_node_id'];
      this.curBen.todaysEncounterStatus = this.curBen.EncounterStatusEnum.Open_Case;
      this.setBenCategoryTypes(encData['ben_category_id']);
    }
    else if (encData['is_closed'] == '0' && encData['is_tc'] == '1') //tc case
    {
      this.curBen.curEncId = encData['enc_id'];
      this.curBen.curEncNodeId = encData['enc_node_id'];
      this.curBen.todaysEncounterStatus = this.curBen.EncounterStatusEnum.Tele_Consultation_Case;
      this.setBenCategoryTypes(encData['ben_category_id']);
    }
    else //should never come here..
      swal({ title: "Error", text: "Something went wrong while fetching beneficiary open status. Please contact admin.", type: 'error' });

    this.setCurBenDetails(benData);
  }

  setCurBenDetails(benData) {
    this.curBen.strName = benData['first_name'] + " " + (benData['last_name'] ? benData['last_name'] : '');

    this.curBen.age = benData['age'];
    this.curBen.age_unit_id = benData['age_unit_id'];

    this.curBen.strAge = benData['age'];
    this.ageUnits.forEach(ageUnit => {
      if (ageUnit.id == benData['age_unit_id'])
        this.curBen.strAge += " " + ageUnit.name;
    });

    this.genders.forEach(gender => {
      if (gender.id == benData['gender_id'])
        this.curBen.strGender = gender.name;
    });

    var fatherName = benData['father_name'];
    var husbandName = benData['husband_name'];
    this.curBen.strFatherNameOrHusbandName = '';
    this.curBen.fatherOrHusbandName = '';
    if (fatherName && fatherName != '') {
      this.curBen.strFatherNameOrHusbandName = "Father: " + fatherName;
      this.curBen.fatherOrHusbandName = fatherName;
    }
    else if (husbandName && husbandName != '') {
      this.curBen.strFatherNameOrHusbandName = "Husband: " + husbandName;
      this.curBen.fatherOrHusbandName = husbandName;
    }

    this.curBen.strDob = '';
    if (benData['dob']) {
      var dob = this.datePipe.transform(benData['dob'], 'dd-MM-yyyy');
      this.curBen.strDob = "DOB: " + dob;
    }

    this.curBen.strRegisteredOn = '';
    this.curBen.registeredOn = '';
    if (benData['reg_on']) {
      var registeredOn = this.datePipe.transform(benData['reg_on'], 'dd-MM-yyyy');
      this.curBen.strRegisteredOn = "Reg. On: " + registeredOn;
      this.curBen.registeredOn = registeredOn;
    }

    this.curBen.strPhoneNumber = '';
    this.curBen.phoneNumber = '';
    if (benData['phone'] && benData['phone'] != '') {
      this.curBen.strPhoneNumber = 'Phone No.: ' + benData['phone'];
      this.curBen.phoneNumber = benData['phone'];
    }

    this.curBen.strIdProof = '';
    if (benData['id_proof_type_id'] && benData['id_proof_value'] && benData['id_proof_value'] != '') {
      this.idProofTypes.forEach(idProofType => {
        if (idProofType.id == benData['id_proof_type_id'])
          this.curBen.strIdProof = idProofType.name;
      });
      this.curBen.strIdProof += ": " + benData['id_proof_value'];
    }

    this.curBen['strVillageName'] = '';
    this.curBen['strOtherLocation'] = '';
    if (benData['village_name'])
      this.curBen['strVillageName'] = 'village: ' + benData['village_name'];
    else if (benData['other_location'])
      this.curBen['strOtherLocation'] = 'location:' + benData['other_location'];

    if (this.curStaff.isLabTechnician())
      this.router.navigate(['/lab-tests']);
    else if (this.curStaff.isPharmacist())
      this.router.navigate(['/drug-issue']);
  }

  addNewBen(fromBenDetailsCard = false) {
    if (!fromBenDetailsCard) //because this must have already happened @ben-details.component.ts
      this.curBen.addNewBen();

    this.photoImgData = null;
    this.initialiseForm();
  }

  // tele-homeo

  consultationChanged() {
    this.consultationFor.value === 2 ? this.relationVisiblity = true : this.relationVisiblity = false;
  }

  deliveryTypeChanged() {
    this.delivery.value === 3 ? this.differentAdressVisibilty = true : this.differentAdressVisibilty = false;
  }
}