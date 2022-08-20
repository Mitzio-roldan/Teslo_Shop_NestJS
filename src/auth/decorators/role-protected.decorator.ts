import { SetMetadata } from '@nestjs/common';
import { validRole } from '../interfaces/valid-roles';

export const META_ROLES = 'roles'

export const RoleProtected = (...args: validRole[]) => {

    return SetMetadata(META_ROLES, args);



}
