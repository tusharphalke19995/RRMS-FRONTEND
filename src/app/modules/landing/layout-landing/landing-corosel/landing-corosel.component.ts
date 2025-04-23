import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlickCarouselModule } from 'ngx-slick-carousel';


@Component({
  selector: 'app-landing-corosel',
  standalone: true,
  imports: [CommonModule,SlickCarouselModule],
  templateUrl: './landing-corosel.component.html',
  styleUrl: './landing-corosel.component.scss'
})
export class LandingCoroselComponent {
  bannerSlides = [
    {img: "assets/images/banner/bannerimg-1.jpg",link:''},
    {img: "assets/images/banner/bannerimg2.jpg",link:''},
    {img: "assets/images/banner/bannerimg3.jpg",link:''},
  ];
  slideConfig = {"slidesToShow": 4, "slidesToScroll": 4};
  
  bannerSlideConfig:any={
    "slidesToShow": 1,
    "slidesToScroll": 1,
    "dots": true,
    "infinite": true,
    "autoplay":true,
    "arrows":true,
    "nextArrow": "<div class='cus-slick-next cus-slick-arrow'><img src='/assets/Images/left.jpg' class='bg-light bg-gradient'/></div>",
    "prevArrow": "<div class='cus-slick-prev cus-slick-arrow'><img src='/assets/Images/left.jpg' class='bg-light bg-gradient'/></div>",
    
  };

  impLinksSlides=[
    {img:'/assets/Images/ksp_gov_logo.PNG', link:'https://www.karnataka.gov.in/english'},
    {img:'/assets/Images/ncrb-Logo.png',link:'https://ncrb.gov.in/'},
    {img:'/assets/Images/digital_police_logo.PNG',link:'https://digitalpolice.gov.in/'},
    {img:'/assets/Images/cybercrime_logo.PNG',link:'https://cybercrime.gov.in/'},
    {img:'/assets/Images/ksp_police_logo.PNG',link:'https://ksp.karnataka.gov.in/english'},
    {img:'/assets/Images/Home_logo.PNG',link:'https://www.mha.gov.in/en'}
  ];

  addSlide() {
    this.bannerSlides.push({img: "http://placehold.it/350x150/777777",link:""})
  }
  
  removeSlide() {
    this.bannerSlides.length = this.bannerSlides.length - 1;
  }
  
  slickInit(e) {
    console.log('slick initialized');
  }
  
  breakpoint(e) {
    console.log('breakpoint');
  }
  
  afterChange(e) {
    console.log('afterChange');
  }
  
  beforeChange(e) {
    console.log('beforeChange');
  }
}