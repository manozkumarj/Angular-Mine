import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { MatSidenav } from "@angular/material";

@Injectable()
export class SidenavService {

  constructor() { }

  currentMenu = [];
  sideMenuChanged = new Subject();

  sidenavToggleOrSizeChanged = new Subject<string>();

  sidenav: MatSidenav;
  sidenavWidth = 10;
  sideNavMode = "side"; /* TODO - put option to set sidenav to always expanded or collapsed in user settings page */
  sideNavOpened = "true";
  toggleLeftRightIcon = "keyboard_arrow_left";

  screenSize = ""; //xs, sm, md, lg


  iconsToggleSidenav() {
    if (this.sidenavWidth > 6) {
      this.sidenavWidth = 4;
      this.toggleLeftRightIcon = "keyboard_arrow_right";
    }
    else {
      this.sidenavWidth = 10;
      this.toggleLeftRightIcon = "keyboard_arrow_left";
    }
    this.forceSideNavSizeAdjust();
  }


  forceSideNavSizeAdjust() {
    this.sidenavToggleOrSizeChanged.next('forceSizeAdjust');
  }

  adjustSidenavResponsive(sizeAlias) {
    this.screenSize = sizeAlias;

    if (sizeAlias == 'xs' || sizeAlias == 'sm') {
      this.sideNavMode = "over";
      this.sideNavOpened = "false";
    }
    else {
      this.sideNavMode = "side";
      this.sideNavOpened = "true";
    }
  }

  sidenavToggle() {
    this.sidenavToggleOrSizeChanged.next('toggle');
  }

  getSidenavWidth() {
    if (this.screenSize == 'xs' || this.screenSize == 'sm')
      return '10';
    else
      return this.sidenavWidth;
  }

  showMenuText() {
    if (this.screenSize == 'xs' || this.screenSize == 'sm')
      return true;
    else
      return this.sidenavWidth > 6;
  }

  updateSideMenu(role) {
    this.currentMenu = [];
    masterMenu.forEach(menuItem => {
      if (menuItem.forRole == role) {
        this.currentMenu.push(menuItem);
      }
    });
    return this.sideMenuChanged.next();
  }
}


const masterMenu = [
  //1 - Admin
  { forRole: "1", name: "home", icon: "home", routerLink: "home" },
  { forRole: "1", name: "inventory", icon: "apps", routerLink: "inventory" },
  { forRole: "1", name: "add doctor", icon: "add_to_queue", routerLink: "doctor-registration" },

  //2 = DEO
  { forRole: "2", name: "home", icon: "home", routerLink: "home" },
  { forRole: "2", name: "queue", icon: "view_headline", routerLink: "queue" },
  { forRole: "2", name: "registration", icon: "add_to_queue", routerLink: "registration" },

  //6 = ANM
  { forRole: "6", name: "home", icon: "home", routerLink: "home" },
  { forRole: "6", name: "queue", icon: "view_headline", routerLink: "queue" },
  { forRole: "6", name: "registration", icon: "add_to_queue", routerLink: "registration" },
  //{ forRole: "6", name: "casesheet", icon: "description", routerLink: "casesheet" },
  { forRole: "6", name: "complaints", icon: "error_outline", routerLink: "complaints" },
  { forRole: "6", name: "clinical", icon: "multiline_chart", routerLink: "clinical-examinations" },
  { forRole: "6", name: "history", icon: "history", routerLink: "history" },
  { forRole: "6", name: "immunization", icon: "child_care", routerLink: "immunization" },
  { forRole: "6", name: "lab tests", icon: "loupe", routerLink: "lab-tests" },
  { forRole: "6", name: "prescription", icon: "link", routerLink: "prescription" },



  /* TODO - need to use better fonts.. not sure how but figure it out, that's what you do right?
  And like that other math lecturer said once @ krishnamurthy - you should be happy when you come across something you don't know
  similarly, this is an opportunity to **maybe** make a kit and put it out there if there isn't any good one..??
  yea?? we'll see...!! let's see... I'm not a designer YET but let's see... */

  //7 = local doctor
  { forRole: "7", name: "home", icon: "home", routerLink: "home" },
  { forRole: "7", name: "queue", icon: "view_headline", routerLink: "queue" },
  { forRole: "7", name: "registration", icon: "add_to_queue", routerLink: "registration" },
  //{ forRole: "7", name: "casesheet", icon: "description", routerLink: "casesheet" },
  { forRole: "7", name: "complaints", icon: "error_outline", routerLink: "complaints" },
  { forRole: "7", name: "Complaints History", icon: "error_outline", routerLink: "complaints-history" },
  { forRole: "7", name: "History", icon: "history", routerLink: "history" },
  //{ forRole: "7", name: "Treatment History", icon: "error_outline", routerLink: "treatment-history" },
  { forRole: "7", name: "Personal History", icon: "history", routerLink: "personal-history" },
  { forRole: "7", name: "Clinical", icon: "multiline_chart", routerLink: "clinical-examinations" },

  /* { forRole: "7", name: "Immunization", icon: "child_care", routerLink: "immunization" },  */
  { forRole: "7", name: "Lab Tests", icon: "loupe", routerLink: "lab-tests" },
  { forRole: "7", name: "prescription", icon: "link", routerLink: "prescription" },
  /* { forRole: "7", name: "Notes",icon:"link",routerLink:"doctornotes"},
  { forRole: "7", name: "Analysis",icon:"link",routerLink:"doctoranalysis"},    */

  //10 = specialist doctor
  { forRole: "10", name: "queue", icon: "view_headline", routerLink: "queue" },
  { forRole: "10", name: "registration", icon: "add_to_queue", routerLink: "registration" },
  { forRole: "10", name: "casesheet", icon: "description", routerLink: "casesheet" },
  { forRole: "10", name: "complaints", icon: "error_outline", routerLink: "complaints" },
  { forRole: "10", name: "clinical", icon: "multiline_chart", routerLink: "clinical-examinations" },
  { forRole: "10", name: "history", icon: "history", routerLink: "history" },
  { forRole: "10", name: "immunization", icon: "child_care", routerLink: "immunization" },
  { forRole: "10", name: "lab tests", icon: "loupe", routerLink: "lab-tests" },
  { forRole: "10", name: "prescription", icon: "link", routerLink: "prescription" },

  //11 = TMT
  { forRole: "11", name: "queue", icon: "view_headline", routerLink: "queue" },
  { forRole: "11", name: "registration", icon: "add_to_queue", routerLink: "registration" },
  { forRole: "11", name: "casesheet", icon: "description", routerLink: "casesheet" },
  { forRole: "11", name: "complaints", icon: "error_outline", routerLink: "complaints" },
  { forRole: "11", name: "clinical", icon: "multiline_chart", routerLink: "clinical-examinations" },
  { forRole: "11", name: "history", icon: "history", routerLink: "history" },
  { forRole: "11", name: "immunization", icon: "child_care", routerLink: "immunization" },
  { forRole: "11", name: "lab tests", icon: "loupe", routerLink: "lab-tests" },
  { forRole: "11", name: "prescription", icon: "link", routerLink: "prescription" },

  //3 = Lab Technician
  { forRole: "3", name: "queue", icon: "view_headline", routerLink: "queue" },
  { forRole: "3", name: "lab tests", icon: "loupe", routerLink: "lab-tests" },


  //5 = Pharmacist
  { forRole: "5", name: "queue", icon: "view_headline", routerLink: "queue" },
  { forRole: "5", name: "drug_issue", icon: "link", routerLink: "drug-issue" },
  { forRole: "5", name: "prescription", icon: "link", routerLink: "prescription" },
  { forRole: "5", name: "casesheet", icon: "description", routerLink: "casesheet" }
];
