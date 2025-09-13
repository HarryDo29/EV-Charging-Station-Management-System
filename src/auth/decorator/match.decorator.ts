import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

// 1. Tạo class Constraint để chứa logic validation
@ValidatorConstraint({ name: 'Match' })
export class MatchConstraint implements ValidatorConstraintInterface {
  // Hàm này sẽ chứa logic so sánh
  validate(value: any, args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints as string[];
    const relatedValue: unknown = (args.object as Record<string, unknown>)[
      relatedPropertyName
    ];
    return value === relatedValue;
  }

  // Hàm này trả về message lỗi mặc định
  defaultMessage(args: ValidationArguments) {
    const [relatedPropertyName] = args.constraints as string[];
    return `$property must match ${relatedPropertyName}`;
  }
}

// 2. Tạo Decorator Function
export function Match(property: string, validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property], // <-- Truyền tên của thuộc tính cần so sánh vào đây
      validator: MatchConstraint, // Chỉ định class constraint sẽ được sử dụng
    });
  };
}
