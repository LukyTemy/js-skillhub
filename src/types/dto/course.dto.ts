import {IsNotEmpty, IsString, IsArray, IsUUID, IsDate, IsNumber, IsEnum, IsUrl, ArrayMinSize, ValidateNested, Length} from "class-validator";
import { Type } from "class-transformer";

export enum ContentType {
  Text = "text",
  Code = "code",
  Video = "video",
}

export class LessonContentDto {
  @IsEnum(ContentType, { message: "Content type must be one of: text, code, or video" })
  @IsNotEmpty()
  public type: ContentType;

  @IsString()
  @IsNotEmpty()
  public data: string;
}

export class LessonDto {
  @IsNotEmpty()
  public lessonId: string;

  @IsString()
  @Length(2, 100, { message: "Lesson title must be between 2 and 100 characters" })
  @IsNotEmpty()
  public title: string;

  @IsArray()
  @ArrayMinSize(1, { message: "Lesson must have at least one content item" })
  @ValidateNested({ each: true })
  @Type(() => LessonContentDto)
  public content: LessonContentDto[];

  @IsNumber()
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

  @IsNotEmpty()
  public instructorId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonDto)
  public lessons: LessonDto[];
}