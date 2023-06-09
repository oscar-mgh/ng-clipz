import { Component, Input, OnChanges, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Clip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
	selector: 'app-edit',
	templateUrl: './edit.component.html',
	styleUrls: ['./edit.component.css'],
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
	@Input() activeClip: Clip | null = null;
	showAlert = false;
	inSubmission = false;
	alertColor = 'blue';
	alertMsg = '';
	@Output() update = new EventEmitter<Clip>();

	clipID = new FormControl('', { nonNullable: true });

	title = new FormControl('', {
		validators: [Validators.required, Validators.minLength(3)],
		nonNullable: true,
	});

	editForm = new FormGroup({
		title: this.title,
		id: this.clipID,
	});

	constructor(private modal: ModalService, private clipService: ClipService) {}

	ngOnChanges(): void {
		if (!this.activeClip) {
			return;
		}

		this.clipID.setValue(this.activeClip.docID!);
		this.title.setValue(this.activeClip.title);
		this.inSubmission = false;
		this.showAlert = false;
	}

	ngOnInit(): void {
		this.modal.register('editClip');
	}

	ngOnDestroy(): void {
		this.modal.unregister('editClip');
	}

	async submit() {
		if (!this.activeClip) return;

		this.inSubmission = true;
		this.showAlert = true;
		this.alertColor = 'blue';
		this.alertMsg = 'Please wait! Updating clip';

		try {
			await this.clipService.updateClip(this.clipID.value, this.title.value);
		} catch (e) {
			this.inSubmission = false;
			this.alertColor = 'red';
			this.alertMsg = 'Something went wrong, try again later';
			return;
		}

		this.activeClip.title = this.title.value;
		this.update.emit(this.activeClip);

		this.inSubmission = false;
		this.alertColor = 'green';
		this.alertMsg = 'Success!';

		setTimeout(() => {
			this.showAlert = false;
			this.inSubmission = false;
			this.alertColor = 'blue';
			this.alertMsg = '';
		}, 2300);
	}
}
