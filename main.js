
/*
 * @Author: tanghaixiang@xindong.com 
 * @Date: 2019-01-31 10:32:19 
 * @Last Modified by: tanghaixiang@xindong.com
 * @Last Modified time: 2019-04-12 21:50:09
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const grpc = require('grpc');
const ISO6391 = require('iso-639-1');
const healthMsg = require('sagi-api/health/v1/health_pb');
const healthRpc = require('sagi-api/health/v1/health_grpc_pb');
const translationMsg = require('sagi-api/translation/v1/translation_pb');
const translationRpc = require('sagi-api/translation/v1/translation_grpc_pb');

const args = process.argv && process.argv.splice(2, process.argv.length);

let endpoint = 'apis.stage.sagittarius.ai:8443';
const certs = grpc.credentials.createSsl(
  fs.readFileSync(path.join(__dirname, '/certs/ca.pem')),
  fs.readFileSync(path.join(__dirname, '/certs/key.pem')),
  fs.readFileSync(path.join(__dirname, '/certs/cert.pem'))
);

/**
 * md5Hex
 * @param {String} text origin string
 * @returns {String} hash
 */
function md5Hex(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

/**
 * mediaQuickHash
 * @param {String} f file path
 * @returns {String} file hash
 */
const mediaQuickHash = (f) => {
  console.log(f);
  const fd = fs.openSync(f, 'r');
  const len = fs.statSync(f).size;

  const position = [
    4096,
    Math.floor(len / 3),
    Math.floor(len / 3) * 2,
    len - 4096 * 2
  ];

  const res = [];
  const buf = Buffer.alloc(4096);
  for (let i = 0; i < 4; i++) {
    const bufLen = fs.readSync(fd, buf, 0, 4096, position[i]);
    res[i] = md5Hex(buf.slice(0, bufLen));
  }

  fs.closeSync(fd);
  return res.join('-');
}

/**
 * send
 * @param {String} mediaIdentity media file hash code
 * @param {String} languageCode  ISO-639-1 language code
 */
const send = async (mediaIdentity) => {
  return new Promise((resolve, reject) => {
    const client = new translationRpc.TranslationClient(endpoint, certs);
    const req = new translationMsg.TranscriptRequest();
    req.setTranscriptIdentity(mediaIdentity);
    client.transcript(req, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
};

// const hash = mediaQuickHash(args[0]);
// let languages = ISO6391.getAllCodes();
// languages = [];
// languages.push('en', 'zh')
// languages.forEach(async (l) => {
//   const s = new Date();
//   const r = await send(hash, l);
//   const d = new Date();
//   let res = '';
//   if (r instanceof Error) {
//     res = `
//       ${s.toISOString()}--filePath    : ${args[0]}\n
//       ${s.toISOString()}--mediaHash   : ${hash}\n
//       ${s.toISOString()}--languageCode: ${l}\n
//       --------total time: ${d - s}\n
//       ${d.toISOString()}-- Error:
//       -------------------------
//       ${r.toString()}
//     `
//   } else {
//     res = `
//       ${s.toISOString()}--filePath    : ${args[0]}\n
//       ${s.toISOString()}--mediaHash   : ${hash}\n
//       ${s.toISOString()}--languageCode: ${l}\n
//       --------total time: ${d - s}\n
//       ${d.toISOString()}-- Success:
//       --------${JSON.stringify(r, null, "  ")}
//     `
//   }
//   console.log(res);
// });
const hash = args[0];
const run = async () => {
  const r = await send(hash);
  const s = new Date();
  const d = new Date();
  let res = '';
  if (r instanceof Error) {
    res = `
      ${s.toISOString()}--filePath    : ${args[0]}\n
      ${s.toISOString()}--mediaHash   : ${hash}\n
      --------total time: ${d - s}\n
      ${d.toISOString()}-- Error:
      -------------------------
      ${r.toString()}
    `
  } else {
    res = `
      ${s.toISOString()}--filePath    : ${args[0]}\n
      ${s.toISOString()}--mediaHash   : ${hash}\n
      --------total time: ${d - s}\n
      ${d.toISOString()}-- Success:
      --------${JSON.stringify(r, null, "  ")}
    `
  }
  console.log(res);
}

run();