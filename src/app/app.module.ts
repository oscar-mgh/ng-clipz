import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';

import { AppRoutingModule } from './app-routing.module';
import { UserModule } from './user/user.module';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { environment } from 'src/environments/environment';
import { ClipComponent } from './clip/clip.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ClipsListComponent } from './clips-list/clips-list.component';
import { FbTimestampPipe } from './pipes/fb-timestamp.pipe';

@NgModule({
	declarations: [
		AppComponent,
		NavComponent,
		HomeComponent,
		ClipComponent,
		NotFoundComponent,
		ClipsListComponent,
		FbTimestampPipe,
	],
	imports: [
		AngularFireModule.initializeApp(environment.firebase),
		AngularFireAuthModule,
		AngularFirestoreModule,
		AngularFireStorageModule,
		BrowserModule,
		UserModule,
		//* Resolves Wildcard Issues
		AppRoutingModule,
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
