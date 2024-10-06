import { PartialType } from '@nestjs/swagger';
import { AddNoteDto } from './create-note.dto';

export class UpdateNoteDto extends PartialType(AddNoteDto) {}
