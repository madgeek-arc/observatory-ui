import {Routes} from '@angular/router';
import {ArchiveComponent} from "./archive.component";
import {NCTEPoliciesComponent} from "./policies/ncte-policies.component";
import {NCTEFundingComponent} from "./funding/ncte-funding.component";
import {NCTEMandate} from "./mandate/ncte-mandate";
import {NCTEOpenAccessComponent} from "./open-access/ncte-open-access.component";
import {NCTEMonitoringComponent} from "./monitoring/ncte-monitoring.component";
import {ArchiveGuardService} from "../services/archiveGuard.service";
import {DataService} from "../services/data.service";
import {DataHandlerService} from "../services/data-handler.service";
import {StakeholdersService} from "src/survey-tool/app/services/stakeholders.service";

export const ARCHIVE_ROUTES: Routes = [
  {
    path: '',
    component: ArchiveComponent,
    // What ArchiveModule provided: instances scoped to this lazy subtree
    providers: [DataService, DataHandlerService, StakeholdersService],
    canActivateChild: [ArchiveGuardService],
    children: [
      {
        path: '',
        redirectTo: 'policies',
        pathMatch: 'full',
      },
      {
        path: 'policies',
        component: NCTEPoliciesComponent,
      },
      {
        path: 'funding',
        component: NCTEFundingComponent,
      },
      {
        path: 'mandate',
        component: NCTEMandate,
      },
      {
        path: 'monitoring',
        component: NCTEMonitoringComponent,
      },
      {
        path: 'openAccess',
        component: NCTEOpenAccessComponent,
      }
    ],
    runGuardsAndResolvers: 'always'
  }
];
