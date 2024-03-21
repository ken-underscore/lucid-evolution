import * as CML from "@dcspark/cardano-multiplatform-lib-nodejs";
import { LucidConfig } from "../lucid-evolution/MakeLucid.js";
import { TxBuilderConfig, OutputDatum } from "./types.js";
import { readFrom } from "./Read.js";
import { Assets, Script, UTxO } from "@lucid-evolution/core-types";
import { collectFromUTxO } from "./Collect.js";
import {
  attachCertificateValidator,
  attachMintingPolicy,
  attachScript,
  attachSpendingValidator,
  attachWithdrawalValidator,
} from "./Attach.js";
import { payToAddress, payToAddressWithData } from "./Pay.js";
import { mintAssets } from "./Mint.js";
import { validFrom, validTo } from "./Interval.js";
import { complete } from "./Complete.js";
import { MkTxComplete } from "../lucid-evolution/MakeTxComplete.js";
import { RunTimeError, TransactionErrors } from "./Errors.js";
import { Either } from "effect/Either";
import { Effect } from "effect/Effect";

export type TxBuilder = {
  readFrom: (utxos: UTxO[]) => TxBuilder;
  collectFrom: (
    config: TxBuilderConfig,
    utxos: UTxO[],
    redeemer?: string | undefined,
  ) => TxBuilder;
  pay: {
    ToAddress: (address: string, assets: Assets) => TxBuilder;
    ToAddressWithData: (
      address: string,
      outputDatum: OutputDatum,
      assets: Assets,
      scriptRef?: Script | undefined,
    ) => TxBuilder;
  };
  mintAssets: (assets: Assets, redeemer?: string | undefined) => TxBuilder;
  validFrom: (unixTime: number) => TxBuilder;
  validTo: (unixTime: number) => TxBuilder;
  attach: {
    Script: (script: Script) => TxBuilder;
    SpendingValidator: (spendingValidator: Script) => TxBuilder;
    MintingPolicy: (mintingPolicy: Script) => TxBuilder;
    CertificateValidator: (certValidator: Script) => TxBuilder;
    WithdrawalValidator: (withdrawalValidator: Script) => TxBuilder;
  };
  complete: () => {
    unsafeRun: () => Promise<MkTxComplete>;
    safeRun: () => Promise<
      Either<MkTxComplete, TransactionErrors | RunTimeError>
    >;
    program: () => Effect<MkTxComplete, TransactionErrors | RunTimeError>;
  };
  config: () => TxBuilderConfig;
};

export function makeTxBuilder(lucidConfig: LucidConfig): TxBuilder {
  const config: TxBuilderConfig = {
    lucidConfig: lucidConfig,
    txBuilder: CML.TransactionBuilder.new(lucidConfig.txbuilderconfig),
    inputUTxOs: [],
    scripts: new Map(),
    programs: [],
  };
  const makeTx: TxBuilder = {
    readFrom: (utxos: UTxO[]) => {
      const program = readFrom(config, utxos);
      config.programs.push(program);
      return makeTx;
    },
    collectFrom: (
      config: TxBuilderConfig,
      utxos: UTxO[],
      redeemer?: string | undefined,
    ) => {
      const program = collectFromUTxO(config, utxos, redeemer);
      config.programs.push(program);
      return makeTx;
    },
    pay: {
      ToAddress: (address: string, assets: Assets) => {
        const program = payToAddress(config, address, assets);
        config.programs.push(program);
        return makeTx;
      },
      ToAddressWithData: (
        address: string,
        outputDatum: OutputDatum,
        assets: Assets,
        scriptRef?: Script | undefined,
      ) => {
        const program = payToAddressWithData(
          config,
          address,
          outputDatum,
          assets,
          scriptRef,
        );
        config.programs.push(program);
        return makeTx;
      },
    },
    mintAssets: (assets: Assets, redeemer?: string | undefined) => {
      const program = mintAssets(config, assets, redeemer);
      config.programs.push(program);
      return makeTx;
    },
    validFrom: (unixTime: number) => {
      const program = validFrom(config, unixTime);
      config.programs.push(program);
      return makeTx;
    },
    validTo: (unixTime: number) => {
      const program = validTo(config, unixTime);
      config.programs.push(program);
      return makeTx;
    },
    attach: {
      Script: (script: Script) => {
        const scriptKeyValue = attachScript(config, script);
        config.scripts.set(scriptKeyValue.key, scriptKeyValue.value);
        return makeTx;
      },
      SpendingValidator: (spendingValidator: Script) => {
        const scriptKeyValue = attachSpendingValidator(
          config,
          spendingValidator,
        );
        config.scripts.set(scriptKeyValue.key, scriptKeyValue.value);
        return makeTx;
      },
      MintingPolicy: (mintingPolicy: Script) => {
        const scriptKeyValue = attachMintingPolicy(config, mintingPolicy);
        config.scripts.set(scriptKeyValue.key, scriptKeyValue.value);
        return makeTx;
      },
      CertificateValidator: (certValidator: Script) => {
        const scriptKeyValue = attachCertificateValidator(
          config,
          certValidator,
        );
        config.scripts.set(scriptKeyValue.key, scriptKeyValue.value);
        return makeTx;
      },
      WithdrawalValidator: (withdrawalValidator: Script) => {
        const scriptKeyValue = attachWithdrawalValidator(
          config,
          withdrawalValidator,
        );
        config.scripts.set(scriptKeyValue.key, scriptKeyValue.value);
        return makeTx;
      },
    },
    complete: () => complete(config),
    config: () => config,
  };
  return makeTx;
}