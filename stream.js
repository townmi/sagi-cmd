import fs from 'fs';
import { StreamingTrainingRequest } from 'sagi-api/training/v1/training_pb';
import { TrainngClient } from 'sagi-api/training/v1/training_grpc_pb';

const grpc = require('@grpc/grpc-js');

const args = process.argv && process.argv.splice(2, process.argv.length);

let endpoint = 'apis.stage.sagittarius.ai:8443';
const certs = grpc.credentials.createSsl(
  fs.readFileSync(path.join(__dirname, '/certs/ca.pem')),
  fs.readFileSync(path.join(__dirname, '/certs/key.pem')),
  fs.readFileSync(path.join(__dirname, '/certs/cert.pem'))
);

const client = new TrainngClient(endpoint, certs);
const stream = client.streamingTraining(this.rpcCallBack);

let request = new StreamingTrainingRequest();
request.setMediaIdentity('xxxx-xxxx-xxxx');
const c = new global.proto.google.cloud.speech.v1.RecognitionConfig([1, this.rate, this.languageCode]);
request.setStreamingConfig(c);
stream.write(this.request);