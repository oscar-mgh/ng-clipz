import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';

import { TabComponent } from './tab/tab.component';
import { ModalComponent } from './modal/modal.component';
import { InputComponent } from './input/input.component';
import { TabsContainerComponent } from './tabs-container/tabs-container.component';
import { AlertComponent } from './alert/alert.component';
import { EventBlockerDirective } from './directives/event-blocker.directive';
// import { ModalService } from '../services/modal.service';

@NgModule({
	declarations: [
		AlertComponent,
		EventBlockerDirective,
		InputComponent,
		ModalComponent,
		TabComponent,
		TabsContainerComponent,
	],
	imports: [
        CommonModule,
        NgxMaskModule.forRoot(),
        ReactiveFormsModule,
    ],
	exports: [
        AlertComponent,
        InputComponent,
        ModalComponent,
        TabComponent,
        TabsContainerComponent,
        EventBlockerDirective,
    ],
	// providers: [ModalService],
})
export class SharedModule {}
