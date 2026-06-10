const axios = require('axios');
const FormData = require('form-data');

const PINATA_BASE_URL = 'https://api.pinata.cloud';
const GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs';

function getHeaders() {
  return {
    pinata_api_key: process.env.PINATA_API_KEY,
    pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
  };
}

async function pinFileToIPFS(fileBuffer, fileName, metadata) {
  const form = new FormData();
  form.append('file', fileBuffer, { filename: fileName });
  if (metadata) {
    form.append('pinataMetadata', JSON.stringify(metadata));
  }
  const res = await axios.post(`${PINATA_BASE_URL}/pinning/pinFileToIPFS`, form, {
    headers: {
      ...getHeaders(),
      ...form.getHeaders(),
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });
  return res.data;
}

async function pinJSONToIPFS(jsonData, metadata) {
  const body = { pinataContent: jsonData };
  if (metadata) {
    body.pinataMetadata = metadata;
  }
  const res = await axios.post(`${PINATA_BASE_URL}/pinning/pinJSONToIPFS`, body, {
    headers: getHeaders(),
  });
  return res.data;
}

async function unpin(cid) {
  const res = await axios.delete(`${PINATA_BASE_URL}/pinning/unpin/${cid}`, {
    headers: getHeaders(),
  });
  return res.data;
}

async function getFromIPFS(cid) {
  const res = await axios.get(`${GATEWAY_URL}/${cid}`, {
    responseType: 'arraybuffer',
  });
  return res.data;
}

module.exports = { pinFileToIPFS, pinJSONToIPFS, unpin, getFromIPFS };
