import { DOCUMENT } from '@angular/common';
import { Component, AfterViewInit, Renderer2, Inject } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  
  constructor(private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) {}

  ngAfterViewInit() {
    setTimeout(() => {
      const el = this.document.getElementById('pre-load');
      if (el) {
        this.renderer.setStyle(el, 'display', 'none');
      }
    }, 300);
  }
  
}