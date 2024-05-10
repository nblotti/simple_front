import {CanActivateFn, Router} from '@angular/router';
import {computed, inject} from "@angular/core";
import {UserContextService} from "./user-context.service";


export const authGuard: CanActivateFn = (route, state) => {

  const loggedIn = computed<boolean>(() => {
    const result = inject(UserContextService).isLogged() ;
    console.log('In computed: ' + result);
    return result;
  });

  if (loggedIn()) {
    console.log('can activate true');
    return true;
  } else {
    console.log('can activate false');
    const router = inject(Router);
    return router.navigate(['/login'])
  }

};
