import { environment } from "environments/environment";

export const apiurls = {
  createUser: `${environment.userApiUrl}users/create/`,  
  getUsers: `${environment.userApiUrl}users/`,  
  getRole: `${environment.userApiUrl}mdm/roles/`,  
  getDivision: `${environment.userApiUrl}mdm/divisions/`,
  getDistrict: `${environment.userApiUrl}mdm/districts?stateid/`,
  getState: `${environment.userApiUrl}mdm/states/`,
  geDistrictByState: `${environment.userApiUrl}api/districts/`,
  updateRoleByRoleId: `${environment.userApiUrl}users/update-user/`,
  getDesignations: `${environment.userApiUrl}mdm/designations/`,
  userLogin: `${environment.userApiUrl}users/login/`,
  getUnitsByDistictId :`${environment.userApiUrl}units/districtId/`
}as const;
