import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { CurStaffService } from '../../../../services/cur-staff.service';
import { UtilitiesService } from '../../../../services/utilities.service';
import { CurBenService } from '../../../../services/cur-ben.service';
import swal from 'sweetalert2';

@Component({
  selector: 'app-systemic-examination',
  templateUrl: './systemic-examination.component.html',
  styleUrls: ['./systemic-examination.component.css']
})
export class SystemicExaminationComponent implements OnInit {

  @Input('view-mode')
  viewMode: boolean = false;

  seForm;

  respSys; cardioSys; gastroSys; nervousSys; genitoSys; musculoSys; otherFindings;

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

    this.loadSytemicExaminationData()
  }

  createFormControls() {
    this.respSys = new FormControl('', Validators.required);
    this.cardioSys = new FormControl('', Validators.required);
    this.gastroSys = new FormControl('', Validators.required);
    this.nervousSys = new FormControl('', Validators.required);
    this.genitoSys = new FormControl('', Validators.required);
    this.musculoSys = new FormControl('', Validators.required);
    this.otherFindings = new FormControl();
  }

  createForm() {
    this.seForm = new FormGroup({
      respSys: this.respSys,
      cardioSys: this.cardioSys,
      gastroSys: this.gastroSys,
      nervousSys: this.nervousSys,
      genitoSys: this.genitoSys,
      musculoSys: this.musculoSys,
      otherFindings: this.otherFindings
    });
  }

  //save and load data
  saveSystemicExaminations() {

    //using thisSystemNodeId as the encounter is happening at this node..
    this.apiService.saveSystemicExaminations(this.curBen.curEncId, this.utilities.getCurEncNodeId(),
      this.respSys.value, this.cardioSys.value, this.gastroSys.value, this.nervousSys.value,
      this.genitoSys.value, this.musculoSys.value, this.otherFindings.value,
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

  loadSytemicExaminationData() {
    this.apiService.getSystemicExaminations(this.curBen.curEncId, this.utilities.getCurEncNodeId())
      .subscribe((data) => {
        if (this.utilities.isInvalidApiResponseData(data)) {
          swal({ title: "Error", text: "Something went wrong while loading the data", type: 'error' });
          console.log(data);
        }
        else {
          this.setSystemicExaminationData(data[0][0]);
        }
      });
  }

  setSystemicExaminationData(seData) {
    if (!seData) return;

    this.hasData.emit();

    this.respSys.setValue(seData['resp_sys']);
    this.cardioSys.setValue(seData['cardio_sys']);
    this.gastroSys.setValue(seData['gastro_sys']);
    this.nervousSys.setValue(seData['nervous_sys']);
    this.genitoSys.setValue(seData['genito_sys']);
    this.musculoSys.setValue(seData['musculo_sys']);
    this.otherFindings.setValue(seData['other_findings']);
  }


}
