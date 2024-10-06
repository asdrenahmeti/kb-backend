import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { NotesService } from './notes.service';
import { AddNoteDto } from './dto/create-note.dto'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('notes')
@ApiTags('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post(':bookingId')
  @ApiOperation({ summary: 'Add a note to a booking' })
  @ApiResponse({ status: 201, description: 'The note has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  async addNote(
    @Param('bookingId') bookingId: string,
    @Body() addNoteDto: AddNoteDto,
  ) {
    return this.notesService.addNote(bookingId, addNoteDto.userId, addNoteDto.content);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get all notes for a booking' })
  @ApiResponse({ status: 200, description: 'Return all notes for the booking.' })
  @ApiResponse({ status: 404, description: 'Booking not found.' })
  async getNotesForBooking(@Param('bookingId') bookingId: string) {
    return this.notesService.getNotesForBooking(bookingId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note' })
  @ApiResponse({ status: 200, description: 'The note has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Note not found.' })
  async deleteNote(@Param('id') id: string) {
    await this.notesService.deleteNote(id);
    return { message: 'Note deleted successfully' };
  }
}