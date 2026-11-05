import { brandService } from '@/services/brandService';
import { categoryService } from '@/services/categoryService';
import { imageService } from '@/services/imageService';
import { roleService } from '@/services/roleService';
import { userService } from '@/services/userService';
import { variantService } from '@/services/variantService';

export const catalogServicesByType = {
  categories: categoryService,
  brands: brandService,
  variants: variantService,
  images: imageService,
  roles: roleService,
  users: userService
};
