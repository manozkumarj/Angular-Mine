import { Component, OnInit, style } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../../services/api.service';
import { MatTableDataSource } from '@angular/material';
import { UtilitiesService } from '../../../services/utilities.service';
import swal from 'sweetalert2';
import { CurBenService } from '../../../services/cur-ben.service';
import { CurStaffService } from '../../../services/cur-staff.service';

@Component({
  selector: 'app-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.css']
})
export class QueueComponent implements OnInit {

  viewMode = 1; //1 - tabular format; 2 - cards format
  displayedColumns: string[] = ['photo', 'strName', 'strGender', 'strAge'];

  openQueueDataSource: MatTableDataSource<Beneficiary>;
  closedQueueDataSource: MatTableDataSource<Beneficiary>;

  benQueueOpen: Beneficiary[] = [];
  benQueueClosed: Beneficiary[] = [];

  constructor(public apiService: ApiService, public utilities: UtilitiesService, public datePipe: DatePipe,
    public curBen: CurBenService, public curStaff: CurStaffService) { }

  ngOnInit() {
    if (this.curBen.genders.length == 0) //this can happen if user didn't go to registration page yet..
      this.loadMasters(); //In this case, get ben queue after the masters load
    else
      this.getBenQueue();
  }

  loadMasters() {
    this.apiService.getRegistrationPageMaster()
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the masters", type: 'error' });
          console.log(data);
        }
        else {
          var masterData = data[0];
          masterData.forEach(masterRow => {
            if (masterRow.master_type == 'gender')
              this.curBen.genders.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'age_unit')
              this.curBen.ageUnits.push({ name: masterRow.name, id: masterRow.id });
            else if (masterRow.master_type == 'id_proof_type')
              this.curBen.idProofTypes.push({ name: masterRow.name, id: masterRow.id });
          });
          this.getBenQueue();
        }
      })
    /* TODO - double check if unsubscribing is not required for http requests..  */
    /* TODO - Check entire application for any other type of subscriptions and close them onNgDestroy */
  }

  getBenQueue() {
    this.benQueueOpen = [];
    this.apiService.getBeneficiaryQueue(this.utilities.getThisSystemNodeId(), this.curStaff.roleId, this.curStaff.splId)
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          //don't show error if there's no one in the queue
        }
        else {
          this.setBenQueueData(data);
        }
      });
  }

  setBenQueueData(data) {
    data[0].forEach(benQueue => {
      var thisBen = {
        benId: '',
        benNodeId: '',
        curEncNodeId: '',
        photo: '',
        strName: '',
        strAge: '',
        strGender: '',
        strFatherNameOrHusbandName: '',
        strDob: '',
        strRegisteredOn: '',
        strIdProof: '',
        strPhoneNumber: ''
      };

      thisBen['benId'] = benQueue['ben_id'];
      thisBen['benNodeId'] = benQueue['ben_node_id'];
      thisBen['curEncNodeId'] = benQueue['enc_node_id'];

      thisBen['photo'] = "assets/images/photo-male-generic.png";
      if (benQueue['photo'] && benQueue['photo'] != '')
        thisBen['photo'] = "data:image/jpeg;base64," + benQueue['photo']

      thisBen['strName'] = benQueue['first_name'] + " " + (benQueue['last_name'] ? benQueue['last_name'] : '');

      thisBen['strAge'] = benQueue['age'];
      this.curBen.ageUnits.forEach(ageUnit => {
        if (ageUnit.id == benQueue['age_unit_id'])
          thisBen['strAge'] += " " + ageUnit.name;
      });

      this.curBen.genders.forEach(gender => {
        if (gender.id == benQueue['gender_id'])
          thisBen['strGender'] = gender.name;
      });
      /* TODO - fix bug - curBen masters - like genders - are loading only if the user navigated to registration page at least once... */

      var fatherName = benQueue['father_name'];
      var husbandName = benQueue['husband_name'];
      thisBen['strFatherNameOrHusbandName'] = '';
      if (fatherName && fatherName != '')
        thisBen['strFatherNameOrHusbandName'] = "Father: " + fatherName;
      else if (husbandName && husbandName != '')
        thisBen['strFatherNameOrHusbandName'] = "Husband: " + husbandName;

      thisBen['strDob'] = '';
      if (benQueue['dob']) {
        var dob = this.datePipe.transform(benQueue['dob'], 'dd-MM-yyyy');
        thisBen['strDob'] = "DOB: " + dob;
      }

      thisBen['strRegisteredOn'] = '';
      if (benQueue['reg_on']) {
        var registeredOn = this.datePipe.transform(benQueue['reg_on'], 'dd-MM-yyyy');
        thisBen['strRegisteredOn'] = "Reg. On: " + registeredOn;
      }

      thisBen['strPhoneNumber'] = '';
      if (benQueue['phone'] && benQueue['phone'] != '') {
        thisBen['strPhoneNumber'] = 'Phone No.: ' + benQueue['phone'];
      }

      thisBen['strIdProof'] = '';
      if (benQueue['id_proof_type_id'] && benQueue['id_proof_value'] && benQueue['id_proof_value'] != '') {
        this.curBen.idProofTypes.forEach(idProofType => {
          if (idProofType.id == benQueue['id_proof_type_id'])
            thisBen['strIdProof'] = idProofType.name;
        });
        thisBen['strIdProof'] += ": " + benQueue['id_proof_value'];
      }

      if (benQueue['is_closed'] == 1) {
        this.benQueueClosed.push(thisBen);
      }
      else {
        this.benQueueOpen.push(thisBen);
      }
    });

    this.openQueueDataSource = new MatTableDataSource(this.benQueueOpen);
    this.closedQueueDataSource = new MatTableDataSource(this.benQueueClosed);
  }

  addNewBen() {
    this.curBen.addNewBen();
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
}