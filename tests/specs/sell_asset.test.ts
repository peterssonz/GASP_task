import { Mangata, MangataInstance } from "gasp-sdk";
describe("sell_asset function tests", () => {
  // beforeAll(async () => {
  // });
  const ENDPOINT = "wss://collator-01-ws-rollup-holesky.gasp.xyz";
  it("should do something", async () => {
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
});
