import {
  getAddressDetails,
  mintingPolicyToId,
  scriptFromNative,
  unixTimeToSlot,
  validatorToAddress,
} from "@lucid-evolution/utils";
import { Effect, Context, Layer, pipe, Console } from "effect";
import { Data, fromText, Lucid, SpendingValidator } from "../../src";
import {
  handleSignSubmit,
  handleSignSubmitWithoutValidation,
  withLogRetry,
} from "../specs/utils";
import { Emulator, generateEmulatorAccount } from "@lucid-evolution/provider";

export const EMULATOR_ACCOUNT = generateEmulatorAccount({
  lovelace: 75000000000n,
});
export const REWARD_AMOUNT = 100000000n;
export const EMULATOR_POOL_ID =
  "pool1nmfr5j5rnqndprtazre802glpc3h865sy50mxdny65kfgf3e5eh";

const alwaysSucceedScript: SpendingValidator = {
  type: "PlutusV2",
  script: "49480100002221200101",
};

export const emulator = await Effect.gen(function* () {
  return new Emulator([EMULATOR_ACCOUNT]);
}).pipe(Effect.runPromise);

const makeEmulatorUser = Effect.gen(function* ($) {
  const user = yield* Effect.tryPromise(() => Lucid(emulator, "Custom"));
  user.selectWallet.fromSeed(EMULATOR_ACCOUNT.seedPhrase);
  return {
    user,
    emulator,
  };
});

export class EmulatorUser extends Context.Tag("EmulatorUser")<
  EmulatorUser,
  Effect.Effect.Success<typeof makeEmulatorUser>
>() {
  static readonly layer = Layer.effect(EmulatorUser, makeEmulatorUser);
}

export const mintInSlotRange = Effect.gen(function* () {
  const { user, emulator } = yield* EmulatorUser;
  const { paymentCredential } = getAddressDetails(EMULATOR_ACCOUNT.address);
  const mintingPolicy = scriptFromNative({
    type: "all",
    scripts: [
      {
        type: "before",
        slot: unixTimeToSlot("Custom", emulator.now() + 60000),
      },
      { type: "sig", keyHash: paymentCredential?.hash! },
    ],
  });

  const policyId = mintingPolicyToId(mintingPolicy);
  const signBuilder = yield* user
    .newTx()
    .mintAssets({
      [policyId + fromText("Wow")]: 123n,
    })
    .validTo(emulator.now() + 30000)
    .attach.MintingPolicy(mintingPolicy)
    .completeProgram();

  return signBuilder;
}).pipe(Effect.flatMap(handleSignSubmitWithoutValidation));

export const registerStake = Effect.gen(function* () {
  const { user, emulator } = yield* EmulatorUser;
  const rewardAddress = yield* pipe(
    Effect.promise(() => user.wallet().rewardAddress()),
    Effect.andThen(Effect.fromNullable),
  );
  const signBuilder = yield* user
    .newTx()
    .registerStake(rewardAddress)
    .completeProgram();
  return signBuilder;
}).pipe(
  Effect.flatMap(handleSignSubmitWithoutValidation),
  Effect.catchTag("TxSubmitError", (error) =>
    error.message.includes("StakeKeyAlreadyRegisteredDELEG")
      ? Effect.void
      : Effect.fail(error),
  ),
  withLogRetry,
  Effect.map(() => emulator.awaitBlock()),
  Effect.orDie,
);

export const delegateTo = Effect.gen(function* ($) {
  const { user } = yield* EmulatorUser;
  const rewardAddress = yield* pipe(
    Effect.promise(() => user.wallet().rewardAddress()),
    Effect.andThen(Effect.fromNullable),
  );
  const signBuilder = yield* user
    .newTx()
    .delegateTo(rewardAddress, EMULATOR_POOL_ID)
    .completeProgram();
  return signBuilder;
}).pipe(Effect.flatMap(handleSignSubmitWithoutValidation), withLogRetry);

export const deRegisterStake = Effect.gen(function* ($) {
  const { user } = yield* EmulatorUser;
  const rewardAddress = yield* pipe(
    Effect.promise(() => user.wallet().rewardAddress()),
    Effect.andThen(Effect.fromNullable),
  );

  const signBuilder = yield* user
    .newTx()
    .deRegisterStake(rewardAddress)
    .completeProgram();
  return signBuilder;
}).pipe(Effect.flatMap(handleSignSubmitWithoutValidation), withLogRetry);

export const registerDeregisterStake = Effect.gen(function* ($) {
  const { user } = yield* EmulatorUser;
  const rewardAddress = yield* pipe(
    Effect.promise(() => user.wallet().rewardAddress()),
    Effect.andThen(Effect.fromNullable),
  );
  const signBuilder = yield* user
    .newTx()
    .registerStake(rewardAddress)
    .deRegisterStake(rewardAddress)
    .completeProgram();
  return signBuilder;
}).pipe(
  Effect.flatMap(handleSignSubmit),
  Effect.catchTag("TxSubmitError", (error) =>
    error.message.includes("StakeKeyAlreadyRegisteredDELEG")
      ? Effect.void
      : Effect.fail(error),
  ),
  withLogRetry,
);

export const withdrawReward = (amount: bigint) =>
  Effect.gen(function* ($) {
    const { user } = yield* EmulatorUser;
    const rewardAddress = yield* pipe(
      Effect.promise(() => user.wallet().rewardAddress()),
      Effect.andThen(Effect.fromNullable),
    );
    const signBuilder = yield* user
      .newTx()
      .withdraw(rewardAddress, amount)
      .completeProgram();
    return signBuilder;
  }).pipe(Effect.flatMap(handleSignSubmitWithoutValidation), withLogRetry);

export const evaluateAContract = Effect.gen(function* ($) {
  const { user } = yield* EmulatorUser;
  const scriptAddress = validatorToAddress("Custom", alwaysSucceedScript);
  const signBuilder = yield* user
    .newTx()
    .pay.ToContract(
      scriptAddress,
      { kind: "inline", value: Data.void() },
      { lovelace: 5000000n },
    )
    .completeProgram();
  return signBuilder;
}).pipe(Effect.flatMap(handleSignSubmitWithoutValidation), withLogRetry);

export const evaluateAContractWithDatum = Effect.gen(function* ($) {
  const { user } = yield* EmulatorUser;
  const scriptAddress = validatorToAddress("Custom", alwaysSucceedScript);
  const signBuilder = yield* user
    .newTx()
    .pay.ToContract(
      scriptAddress,
      { kind: "asHash", value: Data.to("31313131") },
      { lovelace: 5000000n },
    )
    .pay.ToContract(
      scriptAddress,
      { kind: "inline", value: Data.to("313131") },
      { lovelace: 5000000n },
    )
    .completeProgram();
  return signBuilder;
}).pipe(Effect.flatMap(handleSignSubmitWithoutValidation), withLogRetry);

export const compose = Effect.gen(function* ($) {
  const { user } = yield* EmulatorUser;
  const scriptAddress = validatorToAddress("Custom", alwaysSucceedScript);
  const txCompA = user
    .newTx()
    .pay.ToContract(
      scriptAddress,
      { kind: "asHash", value: Data.to("31313131") },
      { lovelace: 5000000n },
    );
  const txCompB = user
    .newTx()
    .pay.ToContract(
      scriptAddress,
      { kind: "inline", value: Data.to("31313131") },
      { lovelace: 5000000n },
    );
  const signBuilder = yield* txCompA.compose(txCompB).completeProgram();
  return signBuilder;
}).pipe(Effect.flatMap(handleSignSubmitWithoutValidation), withLogRetry);
