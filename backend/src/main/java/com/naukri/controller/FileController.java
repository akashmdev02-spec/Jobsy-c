package com.naukri.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/uploads")
@CrossOrigin
public class FileController {
    private static final String UPLOAD_DIR = "uploads";

    @PostMapping
    public ResponseEntity<?> upload(@RequestParam("file") MultipartFile file) {
        try {
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            // Generate unique secure saved file name
            String savedName = UUID.randomUUID().toString() + fileExtension;
            Path path = Paths.get(UPLOAD_DIR, savedName);
            Files.write(path, file.getBytes());

            // Build dynamic local URL mapped to port 8080 public endpoint
            String fileUrl = "http://localhost:8080/api/uploads/" + savedName;
            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {
        try {
            Path path = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() || resource.isReadable()) {
                String contentType = null;
                try {
                    contentType = Files.probeContentType(path);
                } catch (IOException e) {
                    // ignore
                }
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                // Force PDF content type for inline viewing
                if (filename.toLowerCase().endsWith(".pdf")) {
                    contentType = "application/pdf";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
