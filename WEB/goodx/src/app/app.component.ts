import { Component, OnInit } from '@angular/core';

import { AppVersion } from '@ionic-native/app-version/ngx';
import { Platform } from '@ionic/angular';

import { AuthService } from './services/auth.service';
import { webVersion } from '../../config';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public versionNumber:any = '';

  constructor(private authApi: AuthService, private appVersion: AppVersion, private platform: Platform) {
  }

  ngOnInit() {
    this.getAppVersion();
  }

  public onLogout = () => {
    this.authApi.logout();
  }

  public getAppVersion = () => {
    if (this.platform.is('capacitor')) { // NATIVE
      this.appVersion.getVersionNumber().then((res) => {
        console.log(res);
        this.versionNumber = res;
    })
    } else { // WEB
      this.versionNumber = webVersion;
    }
  }
}
