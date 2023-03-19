const express = require("express");
const elliptic = require('elliptic');
const EC = elliptic.ec;
const ec = new EC('secp256k1');
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "046cf2d8019b8e608a45a19371b8acd3a7b29d873e8a1fb47fc76d5fca16b9fc1a56dcd47ebeaa8e8a6b57285f8402f040da4401981d240409cffc18c696a9577c": 100,
  "047c7cc38ac1804e0e7c9fff5ce8b72200ca105c4e31ae519f55e1dc3774dc5b14f9709e2d0ff607bf3eddde70a1622c4fdae1fd035f59dc1651c5ed65469c096f": 50,
  "044664da24b88c77d2080e1469e9fe0010d71e1f17a14b9ef839a197e062835a84127a9babff1cdcf16b4ce265f7c5c83472734eaf2567a6eae62e2e85084a98e7": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // TODO: get a signature from the client-side application
  // recover the public address from the signature
  const { sender, recipient, amount, signature, message } = req.body;

  const publicKey = ec.keyFromPublic(sender, 'hex');
  const messageHash = Buffer.from(message, 'hex');
  const signatureValid = publicKey.verify(messageHash, signature);

  if (!signatureValid) {
    res.status(400).send({ message: "invalid signature!"});
    return;
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
