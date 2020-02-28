import { Component, OnInit, ViewChild } from '@angular/core';
import { SidenavService } from '../../../services/sidenav.service';
import { AuthService } from '../../../services/auth.service';
import { CurStaffService } from '../../../services/cur-staff.service';
import { Router } from '@angular/router';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  searchBar; searchText;

  @ViewChild('searchBarInput') searchBarInput;

  constructor(public sidenavService: SidenavService, public authService: AuthService, public curStaff: CurStaffService,
    public router: Router, public utilities: UtilitiesService) { }

  ngOnInit() { }

  searchBeneficiary() {
    if (this.searchText != '') {
      this.searchText = this.searchText.trim();
      this.utilities.searchText = this.searchText;

      if (isNaN(this.searchText))
        this.utilities.searchType = this.utilities.EnumSearchType.name;
      else if (this.searchText.length <= 5)
        this.utilities.searchType = this.utilities.EnumSearchType.id;
      else if (this.searchText.length == 12)
        this.utilities.searchType = this.utilities.EnumSearchType.Aadhar;
      else
        this.utilities.searchType = this.utilities.EnumSearchType.phone;

      this.searchText = '';
      this.utilities.subSearchBeneficiary.next();
      this.searchBarInput.nativeElement.blur();
      this.router.navigate(['/search-results']);
    }
  }

  clearSearch() {
    this.searchText = '';
  }

  toggleSidenav() {
    this.sidenavService.sidenavToggle();
  }

  /*   languageChanged(selectedLanguage) {
      this.curStaff.languageChanged(selectedLanguage);
    }
  
    compactnessChanged(selectedCompactness) {
      this.curStaff.compactness = selectedCompactness;
    } */

  /* gapBetweenControlsChanged(selectedGapBetweenControls) {
    this.curStaff.gapBetweenControls = selectedGapBetweenControls;
  } */

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  goToProfile() {
    this.router.navigate(['/doctor-profile']);
  }

  logout() {
    if (confirm("Are you sure you want to logout?")) {
      this.authService.logout();
    }
  }

}
