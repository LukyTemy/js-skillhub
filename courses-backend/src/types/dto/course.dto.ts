import { IsNotEmpty, IsString, IsArray, IsEnum, IsUrl, ValidateNested, IsOptional, Length } from "class-validator";
import { Type } from "class-transformer";
import { ObjectId } from "mongodb";

export enum ContentType {
    Text = "text",
    Code = "code",
    Video = "video",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     ContentType:
 *       type: string
 *       enum: [text, code, video]
 *
 *     BaseContentDto:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         type:
 *           $ref: '#/components/schemas/ContentType'
 *
 *     TextContentDto:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseContentDto'
 *         - type: object
 *           properties:
 *             text:
 *               type: string
 *               example: "Obsah lekce..."
 *
 *     CodeContentDto:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseContentDto'
 *         - type: object
 *           properties:
 *             code:
 *               type: string
 *               example: "console.log('Hello');"
 *             language:
 *               type: string
 *               example: "typescript"
 *             filename:
 *               type: string
 *               example: "main.ts"
 *
 *     VideoContentDto:
 *       allOf:
 *         - $ref: '#/components/schemas/BaseContentDto'
 *         - type: object
 *           properties:
 *             url:
 *               type: string
 *               format: uri
 *               example: "https://youtube.com/..."
 *             caption:
 *               type: string
 *
 *     LessonDto:
 *       type: object
 *       required:
 *         - title
 *         - order
 *         - content
 *       properties:
 *         lessonId:
 *           type: string
 *           description: MongoDB ObjectId
 *         title:
 *           type: string
 *         order:
 *           type: number
 *         content:
 *           type: array
 *           items:
 *             oneOf:
 *               - $ref: '#/components/schemas/TextContentDto'
 *               - $ref: '#/components/schemas/CodeContentDto'
 *               - $ref: '#/components/schemas/VideoContentDto'
 *
 *     CourseDto:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - category
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         instructorId:
 *           type: string
 *           description: MongoDB ObjectId
 *         lessons:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/LessonDto'
 */
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
    caption?: string;
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