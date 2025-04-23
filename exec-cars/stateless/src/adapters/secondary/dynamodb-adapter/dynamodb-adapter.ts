import {
  DynamoDBClient,
  ScanCommand,
  ScanCommandInput,
  ScanCommandOutput,
} from '@aws-sdk/client-dynamodb';

import { logger } from '@shared';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const dynamoDb = new DynamoDBClient({});

export async function getAll<T>(tableName: string): Promise<T[]> {
  const allItems: T[] = [];
  let lastEvaluatedKey: Record<string, any> | undefined;
  let params: ScanCommandInput = {
    TableName: tableName,
  };

  do {
    if (lastEvaluatedKey) {
      params = {
        ...params,
        ExclusiveStartKey: lastEvaluatedKey,
      };
    }

    try {
      const data: ScanCommandOutput = await dynamoDb.send(
        new ScanCommand(params),
      );

      const items: T[] = data.Items
        ? data.Items.map((item) => unmarshall(item) as T)
        : [];

      allItems.push(...items);
      lastEvaluatedKey = data.LastEvaluatedKey;
    } catch (error) {
      console.error('error scanning table:', error);
      throw error;
    }
  } while (lastEvaluatedKey);

  logger.info(`retrieved ${allItems.length} items from ${tableName}`);
  return allItems;
}
