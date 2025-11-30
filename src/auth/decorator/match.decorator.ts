import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// 1. Create class Constraint to contain logic validation
@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  // This function will contain logic to compare
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints as string[];
    // get name of property to compare
    const relatedValue: unknown = (args.object as Record<string, unknown>)[
      relatedPropertyName
    ];
    // get value of property to compare
    return value === relatedValue;
    // return true if value is equal to related value
  }

  // This function will return default error message
  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints as string[];
    return `$property must match ${relatedPropertyName}`;
  }
}

// 2. Create Decorator Function
export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property], // <-- Pass the name of the property to compare into here
      validator: MatchConstraint, // Specify the class constraint that will be used
    });
  };
}
