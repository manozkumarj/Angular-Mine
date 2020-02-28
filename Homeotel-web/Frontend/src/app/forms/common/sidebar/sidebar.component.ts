import { Component, OnInit } from '@angular/core';
import { SidenavService } from '../../../services/sidenav.service';
import { Router } from '@angular/router';
import { CurBenService } from '../../../services/cur-ben.service';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  /* currentMenu = []; */

  constructor(public sidenavService: SidenavService, public router: Router, public curBen: CurBenService, public utilities: UtilitiesService) { }

  ngOnInit() {
    /*  this.currentMenu = this.sidenavService.currentMenu;
     this.sidenavService.sideMenuChanged.subscribe(() => this.currentMenu = this.sidenavService.currentMenu); */
  }

  hideMenuItem(menuName) {
    if (menuName == 'immunization' && this.curBen.hasAgeAbove(15)) //don't show immunization in beneficiary is above 15
      return true;   
    else return false;
  }
}
