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
  selector: "auth-designation-role",
  templateUrl: "./designation-role.component.html",
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
export class DesignationRoleComponent implements OnInit {
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
      designationRoleId: ["", [Validators.required]]
    });
    this.divisionsRoles = this._authService.getAuthData();
    console.log("finalDesignationRoleInfo",this.divisionsRoles.DivisionsRoles)
  }


onStateChange(data:any)
{
 sessionStorage.setItem('designationRoleId', data)
}

goToDashbaord(){
  this._router.navigateByUrl("/dashboard");
}

trackByFn(index: number, item: any): any {
  return item.id || index;
}
 
}
