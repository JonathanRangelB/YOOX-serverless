import { MessageAttributeValue } from '@aws-sdk/client-sqs';
import { SQSRecordAttributes } from 'aws-lambda';

export function transformSQSRecordAttributes(
  sqsAttributes: SQSRecordAttributes | undefined,
  errorMessage?: string
): Record<string, MessageAttributeValue> | undefined {
  if (!sqsAttributes) return undefined;

  const transformed: Record<string, MessageAttributeValue> = {};

  for (const [key, value] of Object.entries(sqsAttributes)) {
    transformed[key] = {
      DataType: 'String',
      StringValue: value,
    };
  }

  transformed['ErrorMessage'] = {
    DataType: 'String',
    StringValue: errorMessage,
  };

  return transformed;
}
