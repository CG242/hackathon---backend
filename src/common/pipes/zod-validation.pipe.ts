import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    // Ne valider que le body
    if (metadata.type !== 'body') return value;

    try {
      let parsedValue = value;

      // Si le body arrive sous forme string, tenter JSON.parse
      if (typeof parsedValue === 'string') {
        const trimmed = parsedValue.trim();

        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            parsedValue = JSON.parse(trimmed);
          } catch (e: any) {
            throw new BadRequestException({
              message: 'Invalid JSON in request body',
              errors: [
                { path: '', message: e?.message || 'Invalid JSON format' },
              ],
            });
          }
        } else {
          throw new BadRequestException({
            message: 'Invalid input: expected object, received string',
            errors: [
              {
                path: '',
                message: `Le body doit être un JSON valide (reçu: ${trimmed.slice(0, 50)})`,
              },
            ],
          });
        }
      }

      // Zod s'attend à un objet/array (pas null, pas string)
      if (typeof parsedValue !== 'object' || parsedValue === null) {
        throw new BadRequestException({
          message: 'Invalid input: expected object',
          errors: [
            { path: '', message: 'Le body doit être un objet JSON valide' },
          ],
        });
      }

      return this.schema.parse(parsedValue);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          path: Array.isArray(issue.path) ? issue.path.join('.') : '',
          message: issue.message,
        }));

        throw new BadRequestException({
          message: 'Validation failed',
          errors,
        });
      }

      throw new BadRequestException({
        message: 'Validation failed',
        errors: [
          {
            path: '',
            message: error instanceof Error ? error.message : 'Unknown error',
          },
        ],
      });
    }
  }
}
