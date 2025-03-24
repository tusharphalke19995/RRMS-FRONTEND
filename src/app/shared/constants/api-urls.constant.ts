import { environment } from "environments/environment";

export const apiurls = {
  createUser: `${environment.userApiUrl}users/create/`,  
  getUsers: `${environment.userApiUrl}users/`,  
  getRole: `${environment.userApiUrl}mdm/roles/`,  
  getDivision: `${environment.userApiUrl}mdm/divisions/`,
  getDistrict: `${environment.userApiUrl}mdm/districts/`,
  getState: `${environment.userApiUrl}mdm/states/`,
  geDistrictByState: `${environment.userApiUrl}api/districts/`,
  updateRoleByRoleId: `${environment.userApiUrl}users/update-user/`,
  getDesignations: `${environment.userApiUrl}mdm/designations/`,
}as const;