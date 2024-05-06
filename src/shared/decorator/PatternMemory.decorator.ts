import { ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface, registerDecorator, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'isValidArrayValues', async: false })
export class IsValidArrayValues implements ValidatorConstraintInterface {
  validate(value: any[], args: ValidationArguments) {
    if(!Array.isArray(value))
        return false;
    if(value.length<0||value.length>25)
        return false;
    return value.every(val => ["left", "right"].includes(val));
  }

  defaultMessage(args: ValidationArguments) {
    return `Each value in ${args.property} must be 'left' or 'right' and length <= 25`;
  }
}

export function IsPattern(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidArrayValues,
    });
  };
}