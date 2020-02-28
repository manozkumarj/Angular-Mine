import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CurBenService } from '../../../services/cur-ben.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { CurStaffService } from '../../../services/cur-staff.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-ben-details',
  templateUrl: './ben-details.component.html',
  styleUrls: ['./ben-details.component.css']
})
export class BenDetailsComponent implements OnInit {

  @Input('view-mode')
  viewMode: boolean = false;

  @Output() addNewBenClicked = new EventEmitter<any>();

  todaysDate = new Date();
  strTodaysDate = '';
  constructor(public curBen: CurBenService, public curStaff: CurStaffService, public utilities: UtilitiesService,
    public datePipe: DatePipe) {
    this.strTodaysDate = this.datePipe.transform(this.todaysDate, 'dd-MM-yyyy');
  }

  ngOnInit() {
  }

  getPhotoDataUrl() {
    if (this.curBen.photoBase64)
      return "data:image/jpeg;base64," + this.curBen.photoBase64;
    else
      return "assets/images/photo-male-generic.png";
  }

  addNewBen() {
    this.addNewBenClicked.emit(); //this is only used when add new ben button is clicked from within registration page..
    this.curBen.addNewBen();
  }
}
