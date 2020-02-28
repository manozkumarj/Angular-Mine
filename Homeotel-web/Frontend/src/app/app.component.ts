import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from "@angular/material";
import { Subscription } from "rxjs/Subscription";
import { MediaChange, ObservableMedia } from "@angular/flex-layout";
import { SidenavService } from './services/sidenav.service';
import { AuthService } from './services/auth.service';
import { OnInit, OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { TranslateService } from '@ngx-translate/core';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { CurStaffService } from './services/cur-staff.service';
import { UtilitiesService } from './services/utilities.service';
import { Title } from '@angular/platform-browser';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  watcher: Subscription;

  activeMediaQuery = "";

  @ViewChild('snav') sidenav: MatSidenav;

  constructor(public loader: LoadingBarService, public sidenavService: SidenavService, public authService: AuthService,
    public utilities: UtilitiesService, public curStaff: CurStaffService, media: ObservableMedia,
    public translate: TranslateService, public titleService: Title) {

    //get device size - xs, sm, md, lg
    this.watcher = media.subscribe((change: MediaChange) => {
      this.activeMediaQuery = change ? `'${change.mqAlias}' = (${change.mediaQuery})` : "";
      this.sidenavService.adjustSidenavResponsive(change.mqAlias);
    });


    sidenavService.sidenavToggleOrSizeChanged.subscribe((action: string) => {
      if (action === 'toggle') {
        this.sidenav.toggle();
      }
      else if (action === 'forceSizeAdjust') {
        { //hacky but seems to be working fine.. without this, not working correctly
          this.sidenav.close();
          setTimeout(() => {
            this.sidenav.open();
          }, 1);
        }
      }
    });

    //language settings
    translate.setDefaultLang(this.curStaff.language);
    this.setTitle();
    this.curStaff.subLanguageChanged.subscribe((lang) => {
      this.switchLanguage(lang);
    })
  }

  switchLanguage(language: string) {
    this.curStaff.language = language;
    this.translate.use(language);
    this.utilities.setStyles();
    this.setTitle();
  }

  setTitle() {
    //no need to unsubscribe as using take(1) will take care of it..
    this.translate.get('Homeotel_doctor').pipe(
      take(1)
    ).subscribe(value => {
      this.titleService.setTitle(value);
    });
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
}
