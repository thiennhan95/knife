import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { KnifePageRoutingModule } from './knife-routing.module';

import { KnifePage } from './knife.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    KnifePageRoutingModule
  ],
  declarations: [KnifePage]
})
export class KnifePageModule {}
