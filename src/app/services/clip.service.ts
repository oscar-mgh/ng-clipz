import { Injectable } from '@angular/core';
import {
	AngularFirestore,
	AngularFirestoreCollection,
	DocumentReference,
	QuerySnapshot,
} from '@angular/fire/compat/firestore';
import Clip from '../models/clip.model';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { BehaviorSubject, combineLatest, map, of, switchMap } from 'rxjs';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';

@Injectable({
	providedIn: 'root',
})
export class ClipService implements Resolve<Clip | null> {
	public clipsCollection: AngularFirestoreCollection<Clip>;
	pageClips: Clip[] = [];
	pendingRequest = false;

	constructor(
		private db: AngularFirestore,
		private auth: AngularFireAuth,
		private storage: AngularFireStorage,
		private router: Router
	) {
		this.clipsCollection = db.collection('clips');
	}

	createClip(data: Clip): Promise<DocumentReference<Clip>> {
		return this.clipsCollection.add(data);
	}

	getUserClips(sort$: BehaviorSubject<string>) {
		return combineLatest([this.auth.user, sort$]).pipe(
			switchMap(values => {
				const [user, sort] = values;

				if (!user) {
					return of([]);
				}

				const query = this.clipsCollection.ref
					.where('uid', '==', user.uid)
					.orderBy('timestamp', sort === '1' ? 'desc' : 'asc');
				return query.get();
			}),
			map(snapshot => (snapshot as QuerySnapshot<Clip>).docs)
		);
	}

	updateClip(id: string, title: string) {
		return this.clipsCollection.doc(id).update({
			title,
		});
	}

	async deleteClip(clip: Clip) {
		const clipRef = this.storage.ref(`clips/${clip.fileName}.mp4`);
		const screenshotRef = this.storage.ref(`screenshots/${clip.screenshotFileName}.png`);

		clipRef.delete();
		screenshotRef.delete();

		await this.clipsCollection.doc(clip.docID).delete();
	}

	async getClips() {
		if (this.pendingRequest) {
			return;
		}

		this.pendingRequest = true;
		let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6);

		const { length } = this.pageClips;

		if (length) {
			const lastDocID = this.pageClips[length - 1].docID;
			const lastDoc = await this.clipsCollection.doc(lastDocID).get().toPromise();

			query = query.startAfter(lastDoc);
		}

		const snapshot = await query.get();

		snapshot.forEach(doc => {
			this.pageClips.push({
				docID: doc.id,
				uid: doc.data().uid,
				displayName: doc.data().displayName,
				title: doc.data().title,
				fileName: doc.data().fileName,
				url: doc.data().url,
				timestamp: doc.data().timestamp,
				screenshotURL: doc.data().screenshotURL,
				screenshotFileName: doc.data().screenshotFileName,
			});
		});

		this.pendingRequest = false;
	}

	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		return this.clipsCollection
			.doc(route.params.id)
			.get()
			.pipe(
				map(snapshot => {
					const data = snapshot.data();

					if (!data) {
						this.router.navigate(['/'])
					}

					return data ?? null;
				})
			);
	}
}
