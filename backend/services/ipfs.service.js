const { pinFileToIPFS, pinJSONToIPFS, unpin, getFromIPFS } = require('../ipfs');

async function uploadFile(fileBuffer, fileName, metadata) {
  const result = await pinFileToIPFS(fileBuffer, fileName, metadata);
  return { cid: result.IpfsHash, url: `ipfs://${result.IpfsHash}` };
}

async function uploadJSON(jsonData, metadata) {
  const result = await pinJSONToIPFS(jsonData, metadata);
  return { cid: result.IpfsHash, url: `ipfs://${result.IpfsHash}` };
}

async function removeFromIPFS(cid) {
  return unpin(cid);
}

async function fetchFromIPFS(cid) {
  return getFromIPFS(cid);
}

module.exports = { uploadFile, uploadJSON, removeFromIPFS, fetchFromIPFS };
