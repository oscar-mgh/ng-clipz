import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
})
export class LoginComponent {
    showAlert = false;
    alertColor = 'blue';
    alertMsg = '';
    inSubmission = false;

    credentials = {
        email: '',
        password: '',
    };

    constructor(private auth: AngularFireAuth) {}

    async login() {
        this.showAlert = true;
        this.inSubmission = true;
        this.alertColor = 'blue';
        this.alertMsg = 'Logging in please wait ...';
        const { email, password } = this.credentials;

        try {
            await this.auth.signInWithEmailAndPassword(email, password);
        } catch (e) {
            console.error(e);
            this.inSubmission = false;
            this.alertMsg = 'An unexpected error ocurred, please try again later';
            this.alertColor = 'red';
            return;
        }
        
        this.alertMsg = 'Logged in with success!';
        this.alertColor = 'green';
    }
}
