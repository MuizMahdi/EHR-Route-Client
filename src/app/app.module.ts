import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Other modules
import { HomeModule } from './home/home.module';
import { DetailModule } from './detail/detail.module';
import { ClickOutsideModule } from 'ng-click-outside';
import { JwtInterceptor } from './Helpers/Interceptors/JwtInterceptor';
import { ErrorInterceptor } from './Helpers/Interceptors/ErrorInterceptor';

// Ng-Zorro Modules
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

// Components
import { AppComponent } from './app.component';
import { LoginComponent } from './Components/Auth/login/login.component';
import { MainComponent } from './Components/SideTabs/main/main.component';
import { AuthMainComponent } from './Components/Auth/auth-main/auth-main.component';
import { NavBarComponent } from './Components/MainLayout/nav-bar/nav-bar.component';
import { SideBarComponent } from './Components/MainLayout/side-bar/side-bar.component';
import { NavSearchComponent } from './Components/MainLayout/nav-search/nav-search.component';
import { RegistrationComponent } from './Components/Auth/registration/registration.component';
import { AdminPanelComponent } from './Components/SideTabs/admin-panel/admin-panel.component';
import { UserProfileComponent } from './Components/Searches/user-profile/user-profile.component';
import { NetworkManagerComponent } from './Components/SideTabs/network-manager/network-manager.component';
import { NavUserMenuComponent } from './Components/MainLayout/nav-user-menu/nav-user-menu.component';
import { HealthRecordsManagerComponent } from './Components/SideTabs/health-records-manager/health-records-manager.component';
import { NetworkInvitationComponent } from './Components/Notifications/network-invitation/network-invitation.component';
import { NavUserNotificationsComponent } from './Components/MainLayout/nav-user-notifications/nav-user-notifications.component';
import { ConsentRequestComponent } from './Components/Notifications/consent-request/consent-request.component';
import { InformationInputComponent } from './Components/Modals/information-input/information-input.component';
import { RecordDetailsComponent } from './Components/Modals/record-details/record-details.component';
import { UpdateConsentRequestComponent } from './Components/Notifications/update-consent-request/update-consent-request.component';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { AboutUsComponent } from './Components/SideTabs/about-us/about-us.component';


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({

   declarations: [
      AppComponent,
      LoginComponent,
      RegistrationComponent,
      AuthMainComponent,
      MainComponent,
      SideBarComponent,
      NavBarComponent,
      NavUserMenuComponent,
      NavSearchComponent,
      NetworkManagerComponent,
      NavUserNotificationsComponent,
      AdminPanelComponent,
      NetworkInvitationComponent,
      HealthRecordsManagerComponent,
      UserProfileComponent,
      ConsentRequestComponent,
      InformationInputComponent,
      RecordDetailsComponent,
      UpdateConsentRequestComponent,
      AboutUsComponent
   ],

   imports: [
      BrowserModule,
      BrowserAnimationsModule,
      FormsModule,
      HttpClientModule,
      CoreModule,
      SharedModule,
      HomeModule,
      DetailModule,
      NzModalModule,
      NzFormModule,
      NzInputModule,
      NzButtonModule,
      NzSelectModule,
      NzRadioModule,
      NzDatePickerModule,
      NzAutocompleteModule,
      NzAlertModule,
      NzSpinModule,
      NzPaginationModule,
      NzMenuModule,
      NzDropDownModule,
      AppRoutingModule,
      AppRoutingModule,
      ReactiveFormsModule,
      HttpClientModule,
      ClickOutsideModule,
      TranslateModule.forRoot({
         loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
         }
      }),
   ],

   providers: [
      { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
      { provide: NZ_I18N, useValue: en_US }
   ],

   bootstrap: [
      AppComponent
   ]

})


export class AppModule { }

