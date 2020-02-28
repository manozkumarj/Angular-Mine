import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Injectable()
export class CurBenService {

  //encTypeId = encounterTypeId means => tmc visit or field visit or call center call, etc - 
  //@m_enc_type - 1 == Telemedicine center visit
  //TODO - to be brought from config file or better if something more secure and less error prone...

  benId = 0;
  benNodeId = 0; //combined, benId and benNodeId will uniquely identify a beneficiary
  curEncId = 0;  //0 => no case today else has a case today - either open or closed
  curEncNodeId = 0; // as of now, the only place this is used for specialist consultation
  //coz when spl. changes something, it should be like this change was done at the node level...

  EncounterStatusEnum = { "No_Encounter_Today": 0, "Open_Case": 1, "Tele_Consultation_Case": 2, "Closed_Case": 3 }
  todaysEncounterStatus = this.EncounterStatusEnum.No_Encounter_Today;

  //ben details required else where
  age; age_unit_id;

  //variable for showing ben details in ben-details-card 
  strClinicOrMmu;
  strName;
  strAge;
  strGender;
  strFatherNameOrHusbandName;
  strDob;
  strRegisteredOn;
  photoBase64: null;
  strPhoneNumber;
  strIdProof;

  registeredOn;
  fatherOrHusbandName;
  phoneNumber;

  //some masters being used in multiple places (registration page, ben-card details and search results)
  genders = [];
  ageUnits = [];
  idProofTypes = [];

  constructor(private router: Router) { }

  showRevisitButton() { //returns true if it isn't a new ben case && isn't an open case today && is not a tc case (to rule out forced revisit cases)
    return this.benId != 0
      && this.todaysEncounterStatus != this.EncounterStatusEnum.Open_Case
      && this.todaysEncounterStatus != this.EncounterStatusEnum.Tele_Consultation_Case;
    //
  }

  showForceRevisitButton() {
    return this.benId != 0
      && this.todaysEncounterStatus == this.EncounterStatusEnum.Tele_Consultation_Case;
  }

  showRegisterButton() { //returns true if a new ben can be registered.. invariably equivalent to (benId == 0)
    return this.benId == 0;
  }

  isOpenCase() {
    return this.todaysEncounterStatus == this.EncounterStatusEnum.Open_Case;
  }

  isClosedCase() {
    return this.todaysEncounterStatus == this.EncounterStatusEnum.Closed_Case;
  }

  isTeleConsultationCase() {
    return this.todaysEncounterStatus == this.EncounterStatusEnum.Tele_Consultation_Case;
  }


  isFemale() {
    return this.strGender.toLowerCase().indexOf('female') > -1;
  }

  hasAgeAbove(age) {
    if (this.age > 15 && this.age_unit_id == 1) //age_unit_id == 1 for years (@m_reg_age_unit) 
      return true;
    else
      return false;
  }

  selectBeneficiary(benId, benNodeId, curEncNodeId = 0) {
    this.benId = benId;
    this.benNodeId = benNodeId;
    if (curEncNodeId) this.curEncNodeId = curEncNodeId; //this will happen only for spl. role as his node id should be equal to the encounters node id... 
    this.router.navigate(['/registration']);
  }

  addNewBen() {
    this.resetCurBen();

    this.strName = '';
    this.strAge = this.strDob = this.strFatherNameOrHusbandName = this.strGender = this.strIdProof = this.strPhoneNumber = this.strRegisteredOn = '';
    this.photoBase64 = null;
    this.registeredOn = this.fatherOrHusbandName = this.phoneNumber = '';    

    this.router.navigate(['/registration']);
  }

  resetCurBen() {
    this.benId = 0;
    this.benNodeId = 0;
    this.curEncId = 0;
    this.todaysEncounterStatus = this.EncounterStatusEnum.No_Encounter_Today;
  }

  returnIfBenNotLoaded() {
    if (this.benId == 0) //if ben is not selected    
    {
      //no need to check todays encounter status, as the user won't be able to open such case anyway.. 
      //TODO - it should be made sure.. this doesn't happen... like by changing date or in some other way..
      swal({ title: "Error", text: "No Beneficiary Selected. Please check and try again.", type: 'error' });
      this.router.navigate(['/queue']);
    }
  }
}
