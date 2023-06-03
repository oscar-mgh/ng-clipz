import { Component, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, forkJoin, last, switchMap } from 'rxjs';
import { v4 as uuid } from 'uuid';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from '../../services/ffmpeg.service';

@Component({
	selector: 'app-upload',
	templateUrl: './upload.component.html',
	styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
	isDragover = false;
	file: File | null = null;
	dragDone = false;
	showAlert = false;
	alertMsg = 'Uploading file please wait...';
	alertColor = 'blue';
	inSubmission = false;
	percentage = 0;
	showPercentage = false;
	user: firebase.User | null = null;
	task?: AngularFireUploadTask;
	screenshots: string[] = [];
	selectedScreenshot = '';
	screenshotTask?: AngularFireUploadTask;

	title = new FormControl('', {
		validators: [Validators.required, Validators.minLength(3)],
		nonNullable: true,
	});

	uploadForm = new FormGroup({
		title: this.title,
	});

	constructor(
		private storage: AngularFireStorage,
		private auth: AngularFireAuth,
		private clipService: ClipService,
		private router: Router,
		public ffmpegService: FfmpegService
	) {
		auth.user.subscribe(user => (this.user = user));
		this.ffmpegService.init();
	}

	ngOnDestroy(): void {
		this.task?.cancel();
	}

	async storeFile(event: Event) {
		if (this.ffmpegService.isRunning) {
			return;
		}

		this.isDragover = false;
		this.file = (event as DragEvent).dataTransfer
			? (event as DragEvent).dataTransfer?.files.item(0) ?? null
			: (event.target as HTMLInputElement).files?.item(0) ?? null;

		if (!this.file || this.file.type !== 'video/mp4') {
			return;
		}

		this.screenshots = await this.ffmpegService.getScreenshots(this.file);

		this.selectedScreenshot = this.screenshots[0];

		this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
		this.dragDone = true;
	}

	async uploadFile() {
		this.inSubmission = true;
		this.showPercentage = true;
		this.showAlert = true;
		this.alertColor = 'blue';
		this.alertMsg = 'Uploading file please wait...';
		const clipFileName = uuid();
		const clipPath = `clips/${clipFileName}.mp4`;

		const screenshotBlob = await this.ffmpegService.blobFromURL(this.selectedScreenshot);
		const screenshotPath = `screenshots/${clipFileName}.png`;

		this.task = this.storage.upload(clipPath, this.file);
		const clipRef = this.storage.ref(clipPath);

		this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);
		const screenshotRef = this.storage.ref(screenshotPath);

		combineLatest([this.task.percentageChanges(), this.screenshotTask.percentageChanges()]).subscribe(
			([clipProgress, screenshotProgress]) => {
				if (!clipProgress || !screenshotProgress) {
					return;
				}
				const total = clipProgress + screenshotProgress;
				this.percentage = (total as number) / 200;
			}
		);

		forkJoin([this.task.snapshotChanges(), this.screenshotTask.snapshotChanges()])
			.pipe(
				switchMap(() => forkJoin([
					clipRef.getDownloadURL(),
					screenshotRef.getDownloadURL()
				]))
			).subscribe({
				next: async (urls) => {
					const [clipURL, screenshotURL] = urls;

					const clip = {
						uid: this.user?.uid as string,
						displayName: this.user?.displayName as string,
						title: this.title.value,
						fileName: `${clipFileName}`,
						url: clipURL,
						screenshotURL,
						screenshotFileName: `${clipFileName}`,
						timestamp: firebase.firestore.FieldValue.serverTimestamp(),
					};

					const clipDocRef = await this.clipService.createClip(clip);

					this.alertColor = 'green';
					this.alertMsg = 'File uploaded successfully';
					this.showPercentage = false;

					setTimeout(() => {
						this.router.navigate(['clip', clipDocRef.id]);
					}, 1000);
				},
				error: error => {
					this.alertColor = 'red';
					this.alertMsg = 'Upload failed, prease try again later';
					this.showPercentage = false;
					this.inSubmission = true;
					console.log(error);
				},
			});
	}
}
