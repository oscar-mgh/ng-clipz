import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Clip from '../models/clip.model';
import { DatePipe } from '@angular/common';

@Component({
	selector: 'app-clip',
	templateUrl: './clip.component.html',
	styleUrls: ['./clip.component.css'],
	providers: [DatePipe],
})
export class ClipComponent implements OnInit {
	clip?: Clip;

	constructor(public route: ActivatedRoute, public router: Router) {}

	ngOnInit(): void {
		this.route.data.subscribe(data => {
			this.clip = data.clip as Clip;
		});
	}
}
