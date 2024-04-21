import { Component, OnInit } from '@angular/core';

import { AuthService } from './services/auth.service';
import { webVersion } from '../../config';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public versionNumber:any = '';

  constructor(private authApi: AuthService) {
  }

  ngOnInit() {
    this.getAppVersion();
  }

  public onLogout = () => {
    this.authApi.logout();
  }

  public getAppVersion = () => {
    // use @ionic-native/app-version in the future
    this.versionNumber = webVersion;
  }
}
