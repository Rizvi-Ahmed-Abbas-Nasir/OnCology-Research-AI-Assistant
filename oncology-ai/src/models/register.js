import mongoose, { Schema, models } from "mongoose";

const StudentSchema = new Schema(
  {
    StudentName: {
      type: String,
      required: true,
    },
    StudentEmail: { type: String, require: true, index:true, unique:true,sparse:true},
    
    StudentPassword: {  
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const StudentRegistration = models.StudentRegistration || mongoose.model("StudentRegistration", StudentSchema);

export default StudentRegistration;
