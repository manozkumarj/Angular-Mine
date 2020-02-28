import { Component, OnInit } from '@angular/core';
import { CurStaffService } from '../../../services/cur-staff.service';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {


  compactnessOptions = ['20%', '30%', '40%', '90%'];  
  languages = ['english', 'telugu'];  

  constructor(public curStaff: CurStaffService, public utilities: UtilitiesService) { }

  ngOnInit() {
    this.utilities.setStyles();
  }

  languageChanged() {    
    this.curStaff.languageChanged(this.curStaff.language);
  }
}
