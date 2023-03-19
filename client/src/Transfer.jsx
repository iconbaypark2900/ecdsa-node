import { useState } from "react";
import server from "./server";
import { ec as EC } from "elliptic";
import { createHash } from "crypto";
import { toHex } from "ethereum-cryptography/utils";

const ec = new EC("secp256k1");

function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    // Define the message and create the signature
    const privateKey = ec.keyFromPrivate(address, "hex");
    const message = "Hello, this is a test message!";
    const messageHash = createHash("sha256").update(message).digest();
    const messageHashHex = toHex(messageHash);
    const signature = privateKey.sign(messageHash);

    try {
      const {
        data: { balance },
      } = await server.post("send", {
        sender: address,
        amount: parseInt(sendAmount),
        recipient,
        signature: signature.toString("hex"),
        message: messageHashHex,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;

