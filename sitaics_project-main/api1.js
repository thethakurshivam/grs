const express = require('express');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Student = require('./models1/student'); // Updated path to match project structure

// GridFS storage configuration
const storage = new GridFsStorage({
  url: 'mongodb://localhost:27017/your-database-name', // adjust connection string
  file: (req, file) => {
    return {
      filename: file.originalname,
      bucketName: 'certificates'
    };
  }
});

const upload = multer({ storage });

// Route to save student information (including mou_id)
app.post('/students', async (req, res) => {
  try {
    const {
      sr_no,
      batch_no,
      rank,
      serial_number,
      enrollment_number,
      full_name,
      gender,
      dob,
      birth_place,
      birth_state,
      country,
      aadhar_no,
      mobile_no,
      alternate_number,
      email,
      address,
      mou_id,
      files,
      courses
    } = req.body;

    const newStudent = new Student({
      sr_no,
      batch_no,
      rank,
      serial_number,
      enrollment_number,
      full_name,
      gender,
      dob,
      birth_place,
      birth_state,
      country,
      aadhar_no,
      mobile_no,
      alternate_number,
      email,
      address,
      mou_id,
      files,
      courses
    });

    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to add previous course certification with PDF
app.post('/students/:id/previous-certifications', upload.single('certificate_pdf'), async (req, res) => {
  try {
    const studentId = req.params.id;
    const { organization_name, course_name } = req.body;
    
    const previousCourse = {
      organization_name,
      course_name,
      certificate_pdf: req.file.id
    };

    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { $push: { previous_courses_certification: previousCourse } },
      { new: true }
    );

    res.status(200).json(updatedStudent);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

