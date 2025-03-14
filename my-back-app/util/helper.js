const fs = require('fs').promises;
const multer = require("multer");


const upload = multer({
    storage:multer.diskStorage({
        destination:function(req,file,callback){
            callback(null,"C:/xampp/htdocs/project/invoice/")
        },
        filename : function(req,file,callback){
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
            callback(null, file.fieldname + '-' + uniqueSuffix)
        }
    }),
    limits:{
        fileSize : (1024*1024) * 3
    },
    fileFilter: function(req,file,callback){
        if(file.mimetype != "image/png" && file.mimetype !== 'image/jpg' && file.mimetype !== 'image/jpeg'){
            // not allow 
            callback(null,false)
        }else{
            callback(null,true)
        }
    }
  })
  
  
  
  
  
  const removeFile = async (fileName) => {
    var filePath = "C:/xampp/htdocs/project/invoice/"
    try {
        await fs.unlink(filePath+fileName);
        return 'File deleted successfully';
    } catch (err) {
      console.error('Error deleting file:', err);
      throw err;
    }
  }
  module.exports = {upload,removeFile}