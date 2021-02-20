import { NgModule } from '@angular/core';
import { AuthGuard } from './Guards/AuthGuard';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';
import { HomeRoutingModule } from './home/home-routing.module';
import { DetailRoutingModule } from './detail/detail-routing.module';
import { MainComponent } from './Components/SideTabs/main/main.component';
import { AuthMainComponent } from './Components/Auth/auth-main/auth-main.component';
import { AdminPanelComponent } from './Components/SideTabs/admin-panel/admin-panel.component';
import { NetworkManagerComponent } from './Components/SideTabs/network-manager/network-manager.component';
import { HealthRecordsManagerComponent } from './Components/SideTabs/health-records-manager/health-records-manager.component';
import { AboutUsComponent } from './Components/SideTabs/about-us/about-us.component';


const routes: Routes = [
   { path:'', redirectTo:'main', pathMatch:'full', canActivate: [AuthGuard] },
   { path:"main", component: MainComponent, canActivate: [AuthGuard] },
   { path:'login', component: AuthMainComponent },
   { path:'network', component: NetworkManagerComponent, canActivate: [AuthGuard] },
   { path:'panel', component: AdminPanelComponent, canActivate: [AuthGuard] },
   { path:'ehrs', component: HealthRecordsManagerComponent, canActivate: [AuthGuard] },
   { path:'about-us', component: AboutUsComponent, canActivate: [AuthGuard] },
   { path: '**', component: PageNotFoundComponent }
];


@NgModule({
   imports: [
      RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' }),
      HomeRoutingModule,
      DetailRoutingModule
   ],
   exports: [RouterModule]
})


export class AppRoutingModule { }
