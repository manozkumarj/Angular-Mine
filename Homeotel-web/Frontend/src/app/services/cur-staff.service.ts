import { Injectable } from '@angular/core';
import { SidenavService } from './sidenav.service';
import { Subject } from 'rxjs';
import { CurBenService } from './cur-ben.service';

@Injectable()
export class CurStaffService {

  subLanguageChanged: Subject<any> = new Subject<any>();

  //user details..        
  staffId: number;
  roleId: number;
  splId: number;
  strName: string;
  strRole: string;

  //current setting selected
  language = "english";
  compactness = "30%"; //the width occupied by a control relative to parents width
  gapBetweenControls = "20px";


  constructor(private sidenavService: SidenavService, private curBen: CurBenService) { }

  setUserData(staffId, roleId, roleName, splId, name, surname) { //username, staffId, name, roleId, preferredLanguage) {

    //TODO - maybe later rename user as staff and store only the required fields - eg. username is not really reqd. 
    //this.username = "test id";
    this.strName = name;
    if (surname)
      this.strName += " " + surname;
    this.staffId = staffId;
    this.roleId = roleId;
    this.strRole = roleName;

    if (splId)
      this.splId = splId;
    else
      this.splId = 0;

    //this.language = "telugu";
    //this.languageChanged(this.language);    

    //also make sure benId and benNodeId are reset when user logs back in..
    this.curBen.benId = 0;
    this.curBen.benNodeId = 0;

    this.sidenavService.updateSideMenu(this.roleId);
  }

  languageChanged(lang) {
    this.language = lang;
    this.subLanguageChanged.next(lang);
  }

  allowDataSave() {
    if (this.isTMT()) return false; // a TMT can only view data, can never modify data

    if (this.isLabTechnician()) //should be able to edit lab tests even if referred to specialist
      return (this.curBen.todaysEncounterStatus == this.curBen.EncounterStatusEnum.Tele_Consultation_Case)
        || (this.curBen.todaysEncounterStatus == this.curBen.EncounterStatusEnum.Open_Case);

    if (this.isSpecialistDoctor())
      return this.curBen.todaysEncounterStatus == this.curBen.EncounterStatusEnum.Tele_Consultation_Case;
    else
      return (this.curBen.todaysEncounterStatus == this.curBen.EncounterStatusEnum.Open_Case);
  }

  canRegisterBen() {
    return this.isDEO();//return this.isANM() || this.isDEO();
  }

  isANM() {
    return this.roleId == 6;
  }

  isTMT() {
    return this.roleId == 11;
  }

  isDEO() {
    return this.roleId == 2;
  }

  isLocalDoctor() {
    return this.roleId == 7;
  }

  isSpecialistDoctor() {
    return this.roleId == 10;
  }

  isLabTechnician() {
    return this.roleId == 3;
  }

  isPharmacist() {
    return this.roleId == 5;
  }
}

