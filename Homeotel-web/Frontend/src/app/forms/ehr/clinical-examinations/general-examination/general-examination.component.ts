import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { CurBenService } from '../../../../services/cur-ben.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-general-examination',
  templateUrl: './general-examination.component.html',
  styleUrls: ['./general-examination.component.css']
})
export class GeneralExaminationComponent implements OnInit {

  @Input('view-mode')
  viewMode: boolean = false;

  geForm;

  pallor; jaundice; cyanosis; clubbing; gingivitis;
  lympha; lymphaRemarks;
  edema; edemaRemarks;

  //temp variables
  statuses = [{ id: 0, name: 'Absent' }, { id: 1, name: 'Present' }];

  @Output() hasData = new EventEmitter<any>();

  constructor(public apiService: ApiService, public curStaff: CurStaffService, public utilities: UtilitiesService,
    public curBen: CurBenService) { }

  ngOnInit() {
    this.initialiseForm();
  }


  initialiseForm() {
    this.createFormControls();
    this.createForm();
    this.setDefaults();
    this.utilities.setStyles();

    this.loadGeneralExaminationsData();
  }

  setDefaults() {
    this.edemaChanged();
    this.lymphaChanged();
  }

  createFormControls() {
    this.pallor = new FormControl('', Validators.required);
    this.jaundice = new FormControl('', Validators.required);
    this.cyanosis = new FormControl('', Validators.required);
    this.clubbing = new FormControl('', Validators.required);
    this.gingivitis = new FormControl('', Validators.required);
    this.lympha = new FormControl('', Validators.required);
    this.lymphaRemarks = new FormControl();
    this.edema = new FormControl('', Validators.required);
    this.edemaRemarks = new FormControl();
  }

  createForm() {
    this.geForm = new FormGroup({
      pallor: this.pallor,
      jaundice: this.jaundice,
      cyanosis: this.cyanosis,
      clubbing: this.clubbing,
      gingivitis: this.gingivitis,
      lympha: this.lympha,
      lymphaRemarks: this.lymphaRemarks,
      edema: this.edema,
      edemaRemarks: this.edemaRemarks
    });
  }


  //handle user events
  lymphaChanged() {
    if (this.lympha.value)
      this.lymphaRemarks.enable();
    else {
      this.lymphaRemarks.setValue('');
      this.lymphaRemarks.disable();
    }
  }

  edemaChanged() {
    if (this.edema.value)
      this.edemaRemarks.enable();
    else {
      this.edemaRemarks.setValue('');
      this.edemaRemarks.disable();
    }
  }

  isValidData() {
    if (this.lympha.value && !this.lymphaRemarks.value) {
      swal({ title: "Error", text: "Please enter remarks for Lymphadenopathy.", type: 'error' });
      return false;
    }
    else if (this.edema.value && !this.edemaRemarks.value) {
      swal({ title: "Error", text: "Please enter remarks for Edema.", type: 'error' });
      return false;
    }
    else
      return true;
  }

  //save and load data
  saveGeneralExaminations() {

    if (!this.isValidData())
      return;

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.saveGeneralExaminations(this.curBen.curEncId, this.utilities.getCurEncNodeId(),
      this.pallor.value, this.jaundice.value, this.cyanosis.value, this.clubbing.value,
      this.gingivitis.value, this.lympha.value, this.lymphaRemarks.value,
      this.edema.value, this.edemaRemarks.value, this.curStaff.staffId)
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

  loadGeneralExaminationsData() {
    this.apiService.getGeneralExaminations(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setGeneralExaminations(data[0][0]);
        }
      });
  }

  setGeneralExaminations(geData) {
    if (!geData) return;

    this.hasData.emit();

    this.pallor.setValue(geData['has_pallor']);
    this.jaundice.setValue(geData['has_jaundice']);
    this.cyanosis.setValue(geData['has_cyanosis']);
    this.clubbing.setValue(geData['has_clubbing']);
    this.gingivitis.setValue(geData['has_gingivitis']);
    this.lympha.setValue(geData['has_lympha']);
    this.lymphaRemarks.setValue(geData['lympha_remarks']);
    this.edema.setValue(geData['has_edema']);
    this.edemaRemarks.setValue(geData['edema_remarks']);

    this.edemaChanged();
    this.lymphaChanged();
  }

}
