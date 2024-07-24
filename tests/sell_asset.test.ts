import "gasp-types";
import {
  fromBN,
  Mangata,
  MangataInstance,
  signTx,
  toBN,
  Token,
  TokenId,
} from "gasp-sdk";
import { describe, test, beforeAll, expect } from "vitest";
import { Keyring } from "@polkadot/keyring";

const keyring = new Keyring({ type: "ethereum" });
const ENDPOINT = "wss://collator-01-ws-rollup-holesky.gasp.xyz";
const gaspID = "0";
const ethID = "1";
const randomID = "123";
const sellAmount = toBN("1", 17);
const minAmountOut = "0";

const newPair = keyring.createFromUri(
  "0x9924bd4ee2bbba5cd0931092717e1f7e6c43d66494c4ac6511c12a3786aa218f"
);
const mangata: MangataInstance = Mangata.instance([ENDPOINT]);

const signAndSendTx = async (
  api: any,
  tx: any,
  pair: any,
  resolveCondition: (event: any) => boolean
) => {
  await new Promise<void>((resolve, reject) => {
    signTx(api, tx, pair, {
      extrinsicStatus: (events) => {
        if (events.some(resolveCondition)) {
          resolve();
        }
      },
      statusCallback: (status) => {
        if (status.isFinalized) reject(new Error("Transaction failed"));
      },
    });
  });
};

describe("sellAsset API fn test", () => {
  beforeAll(async () => {
    const [chain, nodeName, nodeVersion] = await Promise.all([
      mangata.rpc.getChain(),
      mangata.rpc.getNodeName(),
      mangata.rpc.getNodeVersion(),
    ]);
    console.log(
      `You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`
    );
  });

  test(
    "should swap asset via sellAsset fn",
    {
      timeout: 60000,
    },
    async () => {
      const ownTokensInit: {
        [id: TokenId]: Token;
      } = await mangata.query.getOwnedTokens(newPair.address);

      const gaspBalanceInit = Number(fromBN(ownTokensInit[0].balance.free));
      const ethBalanceInit = Number(fromBN(ownTokensInit[1].balance.free));

      const api = await mangata.api();
      const tx = await api.tx.xyk.sellAsset(
        gaspID,
        ethID,
        sellAmount,
        minAmountOut
      );
      await signAndSendTx(
        api,
        tx,
        newPair,
        (r) => r.method === "AssetsSwapped"
      );

      const ownTokensAfter: {
        [id: TokenId]: Token;
      } = await mangata.query.getOwnedTokens(newPair.address);
      const gaspBalance = Number(fromBN(ownTokensAfter[0].balance.free));
      const ethBalance = Number(fromBN(ownTokensAfter[1].balance.free));

      expect(ownTokensAfter[0].id).toEqual(gaspID);
      expect(ownTokensAfter[1].id).toEqual(ethID);

      expect(gaspBalanceInit).toBeGreaterThan(gaspBalance);
      expect(ethBalanceInit).toBeLessThan(ethBalance);
    }
  );

  test(
    "should not swap asset when using wrong token id",
    {
      timeout: 60000,
    },
    async () => {
      const api = await mangata.api();
      const tx = await api.tx.xyk.sellAsset(
        gaspID,
        randomID,
        sellAmount,
        minAmountOut
      );
      const ERROR_MSG =
        "1010: Invalid Transaction: The swap prevalidation has failed";

      await new Promise<void>(async (resolve) => {
        try {
          await signTx(api, tx, newPair, {
            statusCallback: () => {},
          });
        } catch (error) {
          expect(error.data).toEqual(ERROR_MSG);
          resolve();
        }
      });
    }
  );
});
