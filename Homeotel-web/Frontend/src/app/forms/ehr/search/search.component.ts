import { Component, OnInit, style } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { MatTableDataSource } from '@angular/material';
import swal from 'sweetalert2';
import { CurBenService } from '../../../services/cur-ben.service';
import { FormControl, FormGroup } from '@angular/forms';
import { CurStaffService } from '../../../services/cur-staff.service';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  viewMode = 1; //1 - tabular format; 2 - cards format 
  mergeMode = false;
  mergeBenIds = [];

  searchResults = [];
  filtererdSearchResults = [];
  filterText = '';

  displayedColumns: string[] = ['photo', 'benId', 'strName', 'strFatherNameOrHusbandName', 'strGender', 'strAge', 'strVillageNameForTable'];
  dataSource: MatTableDataSource<Beneficiary>;

  benQueueOpen: Beneficiary[] = [];
  benQueueClosed: Beneficiary[] = [];

  constructor(public apiService: ApiService, public utilities: UtilitiesService, public datePipe: DatePipe,
    public curBen: CurBenService, public curStaff: CurStaffService) {
    this.utilities.docMode = false;
  }

  ngOnInit() {
    this.searchBeneficiaries();

    this.utilities.subSearchBeneficiary
      .subscribe(() => {
        this.searchBeneficiaries();
      });
  }

  /* TODO - allow search with ben id, phone number, id card number, name + surname, father name, etc - 
  both automatically and give a form for more advanced seaches - if possible like gmail search drop down style.. */
  searchBeneficiaries() {
    this.searchResults = [];
    this.filtererdSearchResults = [];
    this.apiService.searchBeneficiaries(this.utilities.searchText, this.utilities.searchType)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          //don't show error is there are no search results..
          console.log(data);
        }
        else {
          this.setSearchResults(data);
        }
      });
  }

  filterResults() {
    this.filtererdSearchResults = this.searchResults.filter(o =>
      Object.keys(o).some(k => typeof o[k] == 'string' && o[k].indexOf('base64') < 0 ? o[k].toLowerCase().includes(this.filterText.toLowerCase()) : false));

    this.dataSource = new MatTableDataSource(this.filtererdSearchResults);
  }

  setSearchResults(data) {
    data[0].forEach(benResult => {
      var thisBen = {};

      thisBen['benId'] = benResult['ben_id'];
      thisBen['benNodeId'] = benResult['ben_node_id'];

      thisBen['photo'] = "assets/images/photo-male-generic.png";
      if (benResult['photo'] && benResult['photo'] != '')
        thisBen['photo'] = "data:image/jpeg;base64," + benResult['photo']

      thisBen['strName'] = benResult['first_name'] + " " + (benResult['last_name'] ? benResult['last_name'] : '');

      thisBen['strAge'] = benResult['age'];
      this.curBen.ageUnits.forEach(ageUnit => {
        if (ageUnit.id == benResult['age_unit_id'])
          thisBen['strAge'] += " " + ageUnit.name;
      });

      this.curBen.genders.forEach(gender => {
        if (gender.id == benResult['gender_id'])
          thisBen['strGender'] = gender.name;
      });

      var fatherName = benResult['father_name'];
      var husbandName = benResult['husband_name'];
      thisBen['strFatherNameOrHusbandName'] = '';
      if (fatherName && fatherName != '')
        thisBen['strFatherNameOrHusbandName'] = "Father: " + fatherName;
      else if (husbandName && husbandName != '')
        thisBen['strFatherNameOrHusbandName'] = "Husband: " + husbandName;

      thisBen['strDob'] = '';
      if (benResult['dob']) {
        var dob = this.datePipe.transform(benResult['dob'], 'dd-MM-yyyy');
        thisBen['strDob'] = "DOB: " + dob;
      }

      thisBen['strRegisteredOn'] = '';
      if (benResult['reg_on']) {
        var registeredOn = this.datePipe.transform(benResult['reg_on'], 'dd-MM-yyyy');
        thisBen['strRegisteredOn'] = "Reg. On: " + registeredOn;
      }

      thisBen['strPhoneNumber'] = '';
      if (benResult['phone'] && benResult['phone'] != '') {
        thisBen['strPhoneNumber'] = 'Phone No.: ' + benResult['phone'];
      }

      thisBen['strIdProof'] = '';
      if (benResult['id_proof_type_id'] && benResult['id_proof_value'] && benResult['id_proof_value'] != '') {
        this.curBen.idProofTypes.forEach(idProofType => {
          if (idProofType.id == benResult['id_proof_type_id'])
            thisBen['strIdProof'] = idProofType.name;
        });
        thisBen['strIdProof'] += ": " + benResult['id_proof_value'];
      }

      thisBen['strVillageName'] = '';
      thisBen['strOtherLocation'] = '';
      thisBen['strVillageNameForTable'] = '';
      if (benResult['village_name']) {
        thisBen['strVillageName'] = 'village: ' + benResult['village_name'];
        thisBen['strVillageNameForTable'] = benResult['village_name'];
      }
      else if (benResult['other_location'])
        thisBen['strOtherLocation'] = 'location:' + benResult['other_location'];

      this.searchResults.push(thisBen);
      this.filtererdSearchResults.push(Object.assign({}, thisBen));
    });

    this.dataSource = new MatTableDataSource(this.filtererdSearchResults);
  }

  beneficiarySelected(benId, benNodeId, curEncNodeId = 0) {
    if (!this.mergeMode)
      this.curBen.selectBeneficiary(benId, benNodeId, curEncNodeId)
    else {
      if (this.mergeBenIds.length == 0)
        this.mergeBenIds.push({ 'benId': benId, 'benNodeId': benNodeId });
      else if (this.mergeBenIds.length == 1 && !(this.mergeBenIds[0].benId == benId && this.mergeBenIds[0].benNodeId == benNodeId))
        this.mergeBenIds.push({ 'benId': benId, 'benNodeId': benNodeId });
      else {
        this.mergeBenIds = this.mergeBenIds.filter(function (currentBenId) {
          return !(currentBenId.benId == benId && currentBenId.benNodeId == benNodeId);
        });
      }
    }
  }

  enableMergeMode() {
    this.mergeMode = true;
    this.mergeBenIds = [];
  }

  disableMergeMode() {
    this.mergeMode = false;
    this.mergeBenIds = [];
  }

  isSelectedForMerging(benId, benNodeId) {
    var boolIsSelectedForMerging = false;
    this.mergeBenIds.forEach(mergeBenId => {
      if (mergeBenId.benId == benId && mergeBenId.benNodeId == benNodeId)
        boolIsSelectedForMerging = true;
    });
    return boolIsSelectedForMerging;
  }

  doMerge() {
    var firstBenId = 0;
    var firstBenNodeId = 0;
    var secondBenId = 0;
    var secondBenNodeId = 0;

    if (this.mergeBenIds[0].benId < this.mergeBenIds[1].benId) {
      firstBenId = this.mergeBenIds[0].benId;
      firstBenNodeId = this.mergeBenIds[0].benNodeId;
      secondBenId = this.mergeBenIds[1].benId;
      secondBenNodeId = this.mergeBenIds[1].benNodeId;
    }
    else {
      firstBenId = this.mergeBenIds[1].benId;
      firstBenNodeId = this.mergeBenIds[1].benNodeId;
      secondBenId = this.mergeBenIds[0].benId;
      secondBenNodeId = this.mergeBenIds[0].benNodeId;
    }

    this.apiService.mergeBeneficiaries(firstBenId, firstBenNodeId, secondBenId, secondBenNodeId, this.curStaff.staffId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          this.utilities.openSnackBar("Successfully Merged the records", "Success");
          // swal({ title: "Success", text: "Successfully Merged the records", type: 'success' });
          this.searchBeneficiaries();
        }
      });

    alert(this.mergeBenIds[0].benId + ' - ' + this.mergeBenIds[0].benNodeId + ' and ' + this.mergeBenIds[1].benId + ' - ' + this.mergeBenIds[1].benNodeId)
    this.disableMergeMode();
  }
}

export interface Beneficiary {
  benId: string;
  benNodeId: string;
  curEncNodeId: string;
  photo: string;
  strName: string;
  strAge: string;
  strGender: string;
  strFatherNameOrHusbandName: string;
  strDob: string;
  strRegisteredOn: string;
  strIdProof: string;
  strPhoneNumber: string;
  strVillageNameForTable: string;
}