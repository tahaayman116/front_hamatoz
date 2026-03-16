import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.html',
  styleUrls: ['./about.css'],
})
export class About {
  teamMembers = [
    { name: 'Amr Essam', image: '/team/amr.png' },
    { name: 'Taha Ayman', image: '/team/taha.jpeg' },
    { name: 'Omar Refay', image: '/team/omar.png' },
    { name: 'Hady Ashraf', image: '/team/hady.png' },
    { name: 'Zeyad Mohamed', image: '/team/zeyad.png' },
    { name: 'Manar Ali', image: null },
    { name: 'Taghreed All', image: null },
    { name: 'Alaa Ashraf', image: null },
  ];
}
