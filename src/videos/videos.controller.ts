import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { ParamsToIncludeValidationPipe } from 'src/common/pipes/params_to_include.pipes';
import { ParamsToQueryValidationPipe } from 'src/common/pipes/params_to_query.pipes';
import { ParamsToPaginationValidationPipe } from 'src/common/pipes/pagination.pipes';

@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) { }

  @Post()
  create(@Body() createVideoDto: CreateVideoDto) {
    return this.videosService.create(createVideoDto);
  }

  @Get()
  findAll(
    @Query(new ParamsToIncludeValidationPipe("videos")) include: any,
    @Query(ParamsToPaginationValidationPipe) pagination: any,
    @Query(new ParamsToQueryValidationPipe("videos")) filter: any,
  ) {

    return this.videosService.findAll({ filter, include, pagination });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query("include", new ParamsToIncludeValidationPipe("videos")) include: any,) {
    return this.videosService.findOne(+id, { include });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVideoDto: UpdateVideoDto) {
    return this.videosService.update(+id, updateVideoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videosService.remove(+id);
  }
}
