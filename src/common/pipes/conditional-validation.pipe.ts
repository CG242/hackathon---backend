import { ArgumentMetadata, Injectable, ValidationPipe } from '@nestjs/common';
import type { ValidationPipeOptions } from '@nestjs/common';

/**
 * ValidationPipe global qui:
 * - parse le body si c'est une string JSON
 * - SKIP la validation class-validator quand il n'y a pas de DTO (metatype Object / null / undefined)
 *   afin de laisser les pipes Zod gérer la validation.
 */
@Injectable()
export class ConditionalValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super(options);
  }

  transform(value: any, metadata: ArgumentMetadata) {
    // Si body string JSON -> parser d'abord
    if (metadata.type === 'body' && typeof value === 'string') {
      try {
        const trimmed = value.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          value = JSON.parse(trimmed);
        }
      } catch {
        // laisser les pipes suivants gérer l'erreur
      }
    }

    // Pas de DTO classique => skip validation
    if (
      metadata.type === 'body' &&
      (metadata.metatype === Object || metadata.metatype == null)
    ) {
      return value;
    }

    return super.transform(value, metadata);
  }
}
