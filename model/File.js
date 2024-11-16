import mongoose from 'mongoose';


const fileSchema = new mongoose.Schema({
    fileName: String,
    fileSize: String,
    fileType: String,
    groupMessageId: [mongoose.Schema({
        messageId: String
    })]
});

const File = mongoose.model('File', fileSchema);

export default File;