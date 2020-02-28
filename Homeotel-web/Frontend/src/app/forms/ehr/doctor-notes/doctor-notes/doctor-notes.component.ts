import { Component, OnInit } from '@angular/core';
import { CurBenService } from '../../../../services/cur-ben.service';
import { Router } from '@angular/router';
import { UtilitiesService } from '../../../../services/utilities.service';

@Component({
  selector: 'app-doctor-notes',
  templateUrl: './doctor-notes.component.html',
  styleUrls: ['./doctor-notes.component.css']
})
export class DoctorNotesComponent implements OnInit {

  notesHasData = false;
 analysisHasData = false;



  constructor(public curBen: CurBenService, public router: Router, public utilities: UtilitiesService) { }

  ngOnInit() {
    this.curBen.returnIfBenNotLoaded();
  }

  hasData(childCmpName) {
    switch (childCmpName) {
      case 'notes':
        this.notesHasData = true;
        break;
      case 'analysis':
        this.analysisHasData = true;
        break;
          
    }
  }

}
