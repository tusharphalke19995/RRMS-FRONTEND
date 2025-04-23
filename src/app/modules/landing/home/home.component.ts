import { Component, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { LandingHeaderComponent } from '../layout-landing/landing-header/landing-header.component';
import { LandingFooterComponent } from '../layout-landing/landing-footer/landing-footer.component';
import { LandingCoroselComponent } from '../layout-landing/landing-corosel/landing-corosel.component';
import { LandingMorquesComponent } from '../layout-landing/landing-morques/landing-morques.component';
import { LandingEmergencyComponent } from '../layout-landing/landing-emergency/landing-emergency.component';
import { NgClass, NgIf } from '@angular/common';
import { FuseCardComponent } from '@fuse/components/card';

@Component({
    selector     : 'landing-home',
    templateUrl  : './home.component.html',
    encapsulation: ViewEncapsulation.None,
    standalone   : true,
    imports      : [MatButtonModule, RouterLink, MatIconModule,LandingHeaderComponent,LandingFooterComponent,LandingCoroselComponent,LandingMorquesComponent,LandingEmergencyComponent,MatButtonModule, NgClass, FuseCardComponent, NgIf, MatIconModule],
})
export class LandingHomeComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
    yearlyBilling: boolean = true;
}
