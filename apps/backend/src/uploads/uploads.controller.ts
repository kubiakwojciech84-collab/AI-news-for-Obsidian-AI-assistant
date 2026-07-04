import { Controller, Post, UploadedFile, UseGuards, UseInterceptors, BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { diskStorage } from "multer";
import { extname } from "path";
import { randomUUID } from "crypto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

const ALLOWED_EXTENSIONS = new Set([".glb", ".gltf", ".png", ".jpg", ".jpeg", ".webp"]);

/**
 * Local disk-backed asset storage for the editor's model importer and game thumbnails.
 * Swap the multer `storage` engine for an S3 client (e.g. multer-s3) to move to cloud
 * storage without touching any callers - they only ever see the returned relative URL.
 */
@ApiTags("uploads")
@ApiBearerAuth()
@Controller("uploads")
export class UploadsController {
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          if (!ALLOWED_EXTENSIONS.has(ext)) return cb(new BadRequestException(`Unsupported file type: ${ext}`), "");
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 25 * 1024 * 1024 },
    })
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException("No file uploaded");
    return { url: `/uploads/${file.filename}` };
  }
}
