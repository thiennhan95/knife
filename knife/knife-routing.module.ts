import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { KnifePage } from './knife.page';

const routes: Routes = [
  {
    path: '',
    component: KnifePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KnifePageRoutingModule {}
