import "gasp-types";
import { Mangata, MangataInstance, signTx } from "gasp-sdk";
import { describe, it, beforeAll } from "vitest";
import { Keyring } from "@polkadot/keyring";

const keyring = new Keyring({ type: "ethereum" });
const ENDPOINT = "wss://collator-01-ws-rollup-holesky.gasp.xyz";
describe("sell_asset API fn test", () => {
  beforeAll(async () => {
    const mangata: MangataInstance = Mangata.instance([ENDPOINT]);
    // Retrieve the chainName, nodeName & nodeVersion information
    const [chain, nodeName, nodeVersion] = await Promise.all([
      mangata.rpc.getChain(),
      mangata.rpc.getNodeName(),
      mangata.rpc.getNodeVersion(),
    ]);
    console.log(
      `You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`
    );
  });
  it("should sell asset via sellAsset fn", async () => {
    const mangata: MangataInstance = Mangata.instance([ENDPOINT]);
    const phrase =
      "zero nation dilemma impulse world profit angle repair stand market web rabbit";
    const newPair = keyring.addFromUri(phrase);
    console.log("HERE+++++", newPair.address);
    const api = await mangata.api();
    const tx = await api.tx.xyk.sellAsset("0", "2", "100000000000000000", "0");
    await signTx(api, tx, newPair, {
      statusCallback: (data) => {
        console.log(data);
      },
    });
  });
});
