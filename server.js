import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from "fs";
import sendFile from "./sendMsg.js";
import getAttechmentUrlByMessageId from "./getAttechmentUrlByMessageId.js";
import deleteMsgById from "./deleteMsgById.js";
import File from "./model/File.js";
import mongoose from "mongoose";
const app = express();
const port = process.env.PORT || 3000;

const fileStatusMap = new Map();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json({ limit: "15mb" }));
app.use(bodyParser.json());
app.use(cors());

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.DB_URL)
  .then(() => {
    console.log("DB Connected!!");
  })
}
let chunks = [];
app.post("/uploadFile", async (req, res) => {
  const data = req.body;
  chunks.push(data);
  fileStatusMap.set(data.fileName, "processing");

  res.send({
    msg: "File sent to backend",
    status: 200,
  });
});

app.get("/processFile", async (req, res) => {
  const fileName = chunks[0]?.fileName;
  if (!fileName) {
    return res.send({ msg: "No file to process", status: 400 });
  }

  await File.findOne({ fileName }).then(async (foundFile) => {
    if (foundFile) {
      chunks = [];
      fileStatusMap.set(fileName, "exists");
      res.send({ msg: "File already exists", status: 500 });
    } else {
      for (let i = 0; i < chunks.length; i++) {
        const fileNameWithoutExt = fileName.split(".").slice(0, -1).join(".");
        let chunkFileName = `${fileNameWithoutExt}-${i}.txt`;

        const messageId = await sendFile(chunkFileName, chunks[i].data);

        await File.findOne({ fileName }).then((foundFile) => {
          if (foundFile) {
            foundFile.groupMessageId.push({ messageId });
            foundFile.save();
          } else {
            const newFile = new File({
              fileName,
              fileType: chunks[i].fileType,
              chunkName: chunkFileName,
              fileSize: chunks[i].fileSize,
              lastModified: chunks[i].lastModifiedDate,
              groupMessageId: [{ messageId }],
            });
            newFile.save();
          }
        });
      }

      chunks = [];
      fileStatusMap.set(fileName, "completed");

      res.send({
        msg: "Entire file sent to backend",
        status: 200,
      });
    }
  });
});


app.get("/getAllFiles", async (req, res) => {
  await File.find({}).then((allFiles) => {
    res.send({
      data: allFiles,
    });
  });
});

app.get("/fileStatus", (req, res) => {
  const { fileName } = req.query;

  if (!fileStatusMap.has(fileName)) {
    return res.send({ status: "not found" });
  }

  res.send({ status: fileStatusMap.get(fileName) });
});

app.post("/getAttechmentUrlById", async (req, res) => {
  const fileName = req.body.fileName;
  await File.findOne({
    fileName: fileName,
  }).then(async (foundFile) => {
    if (foundFile) {
      const message = await getAttechmentUrlByMessageId(
        foundFile.groupMessageId[req.body.chunkIndex].messageId
      );
      await fetch(message.url)
        .then((res) => {
          return res.text();
        })
        .then((data) => {
          res.send({
            encodedChunk: data,
          });
        });
    }
  });
});

app.post("/deleteFile", async (req, res) => {
  const fileName = req.body.fileName;
  await File.findOne({
    fileName: fileName
  }).then((foundFile) => {
    if(foundFile){
      deleteMsgById(foundFile.groupMessageId[req.body.chunkIndex].messageId);
    }
  })
  await File.deleteOne({
    fileName: fileName
  })
  res.send({
    msg: "Chunk deleted"
  })
})

app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});
