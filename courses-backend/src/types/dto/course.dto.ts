import { IsNotEmpty, IsString, IsArray, IsEnum, IsUrl, ValidateNested, IsOptional, Length } from "class-validator";
import { Type } from "class-transformer";
import { ObjectId } from "mongodb";


export enum ContentType {
  Text = "text",
  Code = "code",
  Video = "video",
}


export abstract class BaseContentDto {
  @IsEnum(ContentType)
  type: ContentType;
}


export class TextContentDto extends BaseContentDto {
  type = ContentType.Text;

  @IsString()
  @IsNotEmpty()
  text: string;
}

// 3. DTO pro Kód
export class CodeContentDto extends BaseContentDto {
  type = ContentType.Code;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsOptional()
  filename?: string;
}

export class VideoContentDto extends BaseContentDto {
  type = ContentType.Video;

  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  caption?: string; // Popisek videa?
}

export class LessonDto {
  @IsOptional()
  public lessonId: ObjectId;

  @IsString()
  @Length(2, 100)
  @IsNotEmpty()
  public title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BaseContentDto, {
    keepDiscriminatorProperty: true,
    discriminator: {
      property: 'type',
      subTypes: [
        { value: TextContentDto, name: ContentType.Text },
        { value: CodeContentDto, name: ContentType.Code },
        { value: VideoContentDto, name: ContentType.Video },
      ],
    },
  })
  public content: (TextContentDto | CodeContentDto | VideoContentDto)[];

  @IsNotEmpty()
  public order: number;
}

export class CourseDto {
  @IsString()
  @Length(2, 100, { message: "Title must be between 2 and 100 characters" })
  @IsNotEmpty()
  public title: string;

  @IsString()
  @Length(10, 1000, { message: "Description must be between 10 and 1000 characters" })
  @IsNotEmpty()
  public description: string;

  @IsString()
  @Length(2, 50, { message: "Category must be between 2 and 50 characters" })
  @IsNotEmpty()
  public category: string;

  public instructorId: ObjectId;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonDto)
  public lessons: LessonDto[];
}