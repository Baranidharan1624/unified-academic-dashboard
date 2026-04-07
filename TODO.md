# Fix Manual User Creation 403 Error

**Status**: In Progress

## Steps:
1. [x] Create this TODO.md  
2. [x] Edit `backend/src/main/java/com/campusone/service/CustomUserDetailsService.java` 
  - Replace `.roles(appUser.getRole().name())` with `.authorities("ROLE_" + appUser.getRole().name())`
3. [ ] `cd backend && mvn clean compile` 
4. [ ] Restart backend: `mvn spring-boot:run`
5. [ ] Test manual create in StudentManagement/StaffManagement
6. [ ] Update TODO.md as [x] complete
7. [ ] attempt_completion

## Why:
Spring Security `hasRole('ADMIN')` requires "ROLE_ADMIN" authority. Login JWT has it, but JwtAuthFilter loads without "ROLE_" prefix.

