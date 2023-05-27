import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import User from '../models/user.model';
import { Observable, delay, filter, map, of, switchMap } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private usersCollection: AngularFirestoreCollection<User>;
	public isAuthenticated$: Observable<boolean>;
	public isAuthenticatedWithDelay$: Observable<boolean>;
	private redirect = false;

	constructor(
		private auth: AngularFireAuth,
		private db: AngularFirestore,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.usersCollection = db.collection('users');
		this.isAuthenticated$ = auth.user.pipe(map(user => !!user));
		this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(900));
		this.router.events
			.pipe(
				filter(e => e instanceof NavigationEnd),
				map(e => this.route.firstChild),
				switchMap(route => route?.data ?? of({ authOnly: false }))
			)
			.subscribe(data => {
				this.redirect = data.authOnly;
			});
	}

	public async createUser(userData: User) {
		if (!userData.password) {
			throw new Error('Password not provided!');
		}

		const { user } = await this.auth.createUserWithEmailAndPassword(
			userData.email as string,
			userData.password as string
		);

		if (!user) {
			throw new Error('User cannot be found');
		}

		await this.usersCollection.doc(user.uid).set({
			name: userData.name,
			email: userData.email,
			age: userData.age,
			phoneNumber: userData.phoneNumber,
		});

		await user.updateProfile({
			displayName: userData.name,
		});
	}

	public async logout($event?: Event) {
		if ($event) {
			$event.preventDefault();
		}
		await this.auth.signOut();

		if (this.redirect) {
			await this.router.navigateByUrl('/');
		}
	}
}
