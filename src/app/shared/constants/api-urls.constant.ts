import { environment } from "environments/environment";

export const apiurls = {
  createUser: `${environment.userApiUrl}users/create/`,  
  getUsers: `${environment.userApiUrl}users/`,  
  getRole: `${environment.userApiUrl}mdm/roles`,  
  getDivision: `${environment.userApiUrl}mdm/divisions`,
  getDistrictByStateId: `${environment.userApiUrl}mdm/districts/`,
  getState: `${environment.userApiUrl}mdm/states`,
  geDistrictByState: `${environment.userApiUrl}api/districts/`,
  updateRoleByRoleId: `${environment.userApiUrl}users/update-user/`,
  getDesignations: `${environment.userApiUrl}mdm/designations`,
  userLogin: `${environment.userApiUrl}users/login`,
  getUnitsByDistictId :`${environment.userApiUrl}mdm/units/`,
   uploadInfo :`${environment.userApiUrl}casedata/save`,
   getUploadInfo :`${environment.userApiUrl}casedata/search`,
   filePreview :`${environment.userApiUrl}casedata/filePreview`,
   getFavourites :`${environment.userApiUrl}casedata/favourites`,
   getFilesLatest :`${environment.userApiUrl}casedata/files/latest`,
   casedataUpdate :`${environment.userApiUrl}casedata/update/`,
   favourite :`${environment.userApiUrl}casedata/files`,
   getRolesMatser :`${environment.userApiUrl}mdm/roles`,
   getDivisionsMaster :`${environment.userApiUrl}mdm/divisions`,
   getDesignationsMaster:`${environment.userApiUrl}mdm/designations`,
   saveRole:`${environment.userApiUrl}mdm/roles`,
   saveDesignations:`${environment.userApiUrl}mdm/designations`,
   saveDivision:`${environment.userApiUrl}mdm/divisions`,
  
}as const;
