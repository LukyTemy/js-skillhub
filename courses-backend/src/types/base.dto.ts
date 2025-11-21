import {IsNotEmpty, Length, Min} from "class-validator";
import {Type} from "class-transformer";

export class IdParam {
    @IsNotEmpty({message: "Id is required"})
    @Length(24, 24, {message: "Id must have 24 characters"})
    id?: string;
}

export class PageQuery {
    @Min(5)
    @Type(() => Number)
    readonly page: number;
}
