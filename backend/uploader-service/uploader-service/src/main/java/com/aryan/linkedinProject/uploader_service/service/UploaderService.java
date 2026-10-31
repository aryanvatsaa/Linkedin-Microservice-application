package com.aryan.linkedinProject.uploader_service.service;

import org.springframework.web.multipart.MultipartFile;

 
public interface UploaderService {

    String upload(MultipartFile file);

}
