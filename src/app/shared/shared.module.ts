import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';

import { TabComponent } from './tab/tab.component';
import { ModalComponent } from './modal/modal.component';
import { InputComponent } from './input/input.component';
import { TabsContainerComponent } from './tabs-container/tabs-container.component';
import { AlertComponent } from './alert/alert.component';
// import { ModalService } from '../services/modal.service';

@NgModule({
    declarations: [AlertComponent, InputComponent, ModalComponent, TabComponent, TabsContainerComponent],
    imports: [CommonModule, ReactiveFormsModule, NgxMaskModule.forRoot()],
    exports: [AlertComponent, InputComponent, ModalComponent, TabComponent, TabsContainerComponent],
    // providers: [ModalService],
})
export class SharedModule {}
