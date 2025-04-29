import { CommonModule, NgFor, NgIf } from "@angular/common";
import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import {
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSelectModule } from "@angular/material/select";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseAlertComponent, FuseAlertType } from "@fuse/components/alert";
import { TranslocoModule } from "@ngneat/transloco";
import { AuthService } from "app/core/auth/auth.service";

@Component({
  selector: "auth-division-info",
  templateUrl: "./division-info.component.html",
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
  standalone: true,
  imports: [
    RouterLink,
    FuseAlertComponent,
    NgIf,
    FormsModule,
    TranslocoModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    NgFor,
    CommonModule
  ],
})
export class DivisionInfoComponent implements OnInit {
  alert: { type: FuseAlertType; message: string } = {
    type: "success",
    message: "",
  };
  designationRoleForm: UntypedFormGroup;
  showAlert: boolean = false;
  divisionsRoles: any;
  /**
   * Constructor
   */
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private _formBuilder: UntypedFormBuilder,
    private _router: Router
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Create the form
    this.designationRoleForm = this._formBuilder.group({
      divisionId: ["", [Validators.required]]
    });
    this.divisionsRoles = this._authService.getAuthData();
  }


onStateChange(data:any)
{
 sessionStorage.setItem('divisionID', data)
}

goToDashbaord(){
  this._router.navigateByUrl("/dashboard");
}

trackByFn(index: number, item: any): any {
  return item.id || index;
}
 
}
