import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from '../decorators/role-protected.decorator';
import { User } from '../entities/auth.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {
  
  constructor(
    private readonly reflector: Reflector
  ){}
  
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    
    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler())
    const req = context.switchToHttp().getRequest()
    const user = req.user as User
    console.log(validRoles);

    
    if (user) {
      
      for (const role of validRoles) {
        if (user.roles.includes(role)) {          
          return true;    
        }   
      }
     
    }

    return false;
    
  }
}
