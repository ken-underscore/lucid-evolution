import { assert, describe, expect, test } from "vitest";
import { ProtocolParameters, UTxO } from "@lucid-evolution/core-types";
import { kupmios } from "./service.js";

const discoveryUTxO: UTxO = {
  txHash: "b50e73e74a3073bc44f555928702c0ae0f555a43f1afdce34b3294247dce022d",
  outputIndex: 0,
  address: "addr_test1wpgexmeunzsykesf42d4eqet5yvzeap6trjnflxqtkcf66g0kpnxt",
  assets: {
    lovelace: 11977490n,
    "4a83e031d4c37fc7ca6177a2f3581a8eec2ce155da91f59cfdb3bb28446973636f7665727956616c696461746f72":
      1n,
  },
  datumHash: null,
  datum: null,
  scriptRef: {
    type: "PlutusV2",
    script:
      "5909d1010000322223232325333573466e1d20000021323232323232533357346644664646460044660040040024600446600400400244a666aae7c0045288a9991199ab9a00200114a060066ae840044c008d5d1000919919180111980100100091801119801001000912999aab9f00114a02a666ae68cdd79aba100100314a2260046ae88004cc8c8c8c0088cc0080080048c0088cc008008004894ccd55cf8008a5eb804cd5d018019aba1001300235744002aae7400c004dd59aba100333223233232323002233002002001230022330020020012253335573e002297ae0133574060066ae84004c008d5d1000aab9d33232323002233002002001230022330020020012253335573e002297adef6c60132533357346008002266ae80004c00cd5d1001098019aba2002357420024664646460044660040040024600446600400400244a666aae7c0045280a99919ab9a00114a260066ae840044c008d5d1000918019bae35573a0026eacd55cf000801919b8f33371890001b8d00200100237566ae84d5d1000a4410346534e00149858c8d55cf1baa0013232325333573466e1d200200213322332323002233002002001230022330020020012253335573e0022c264a666ae68cc88cdd79ba73235573c6ea8004008dd3991aab9e37540020020086ae840044d5d09aba20011300335744004646aae78dd50009aba1001002004357420022c6aae78008d55ce8009baa357426ae88014dd61aba1003357446ae88004d5d11aba20013235573c6ea8004d5d0800991aab9e37540020082a666ae68cdc3a4008004266664664446646460044660040040024600446600400400244a666aae7c004489400454ccd5cd19baf35573a6ae840040104c014d5d0800898011aba2001001232223002003375a6aae78004004d5d0991aba235744002646aae78dd5000803991bab35742646ae88d5d11aba235744646ae88d5d1000800991aab9e37540020026ae84c8d55cf1baa0010042498584c8c8c8c8c8c8c8c8c94ccd5cd19b87480080084c8c8c8c94ccd5cd19b874801000854ccd5cd199119baf374e646aae78dd50008011ba73235573c6ea8004004c8c8c8c8c80154ccd5cd19b87480000084c8c8c8c8c8c8c8c8c8c8c8c8c92653335573e0022930b1aba20065333573466e1d20000021323232324994ccd55cf8008a4c2c6ae8800cdd70009aba100115333573466e1d20020021324994ccd55cf8008a4c2c2c6aae78008d55ce8009baa001357420026ae880194ccd5cd19b87480000084c8c8c8c92653335573e0022930b1aba2003375c0026ae8400454ccd5cd19b87480080084c92653335573e0022930b0b1aab9e00235573a0026ea8004d5d08008b1aab9e00235573a0026ea8004d5d08008098a999ab9a33223375e6e98008dd3000992999aab9f00110011333573466ebcd55ce9aba10013752910100357440020026eacd5d09aba20083253335573e00220022666ae68cdd79aab9d357420026ea522100357440020026eacd5d08020a999ab9a3371064a666aae7c004520001333573466ebcd55ce9aba1001375291100375a6aae78d5d09bab35573c6ae84005200037566ae84d5d100419b803253335573e002290000999ab9a3375e6aae74d5d08009ba9488100375a6aae78d5d09bab35573c6ae84005200037566ae840112080dac4091533357346644664646460044660040040024600446600400400244a666aae7c0045288a9991199ab9a00200114a060066ae840044c008d5d1000918019bab35573c002002644664646460044660040040024600446600400400244a666aae7c0045288a9991199ab9a00200114a060066ae840044c008d5d1000918019bad35573c002002466e1c0052000332233323222333323232300223300200200123002233002002001322323223300100300222253335573e002266ae8000c0084c8c8c94ccd5cd19baf002001133574066ec0008cc024d55cf0031aab9e00333300822002005357440082a666ae68cdc81bae002375c002266ae80018cccc0208800400cd5d1002002899aba0003333300822001006005357440086aae74008d55ce8021aba10012253335573e004200226666006440026ae84008d5d100100080080191001001000911ba63300337560046eac00488ccc888cccc8c8c8c0088cc0080080048c0088cc008008004c88c8c88cc00400c0088894ccd55cf800899aba000300213232325333573466ebc0080044cd5d019bb00023300935573c00c6aae7800cccc02088008014d5d10020a999ab9a337206eb8008dd7000899aba00063333008220010033574400800a266ae8000ccccc02088004018014d5d10021aab9d00235573a0086ae84004894ccd55cf801080089999801910009aba10023574400400200200644004004002446ea0cdc09bad002375a0020040020040026eacd5d080525eb7bdb18054ccd5cd199119192999ab9a323370e6aae74dd5000a40046ae84d5d100109919192999ab9a3370e90000010a5015333573466e1d2002002132337100020106eb4d5d08008a5135573c0046aae74004dd500089919192999ab9a3370e90000010a99919ab9a00114a29405280a999ab9a3370e90010010a99919ab9a00114a26466e20004020dd69aba10011323370e0100026eb4d5d08008a99919ab9a00114a29445281aab9e00235573a0026ea8004d5d0800991aab9e37540026ae84d5d1191aab9e375400200266e04dd69aba13235573c6ea80040512080c60a35742646ae88d5d10009aba200a1498585858585858d55cf0011aab9d00137546ae84d5d10009aba23235573c6ea8004cc88cc8c8c0088cc0080080048c0088cc008008004894ccd55cf8008b09919192999ab9a3370e90010010a999ab9a3371e00c6eb8d5d080089aba100413005357440082600a6ae88010d55cf0011aab9d0013754646ae84c8d55cf1baa0010013235742646aae78dd50008009aba100100237586ae8401cdd71aba10011635573c0046aae74004dd5191aba13235573c6ea8004004d5d0800991aab9e3754002646464a666ae68cdc3a4004004266446646460044660040040024600446600400400244a666aae7c004584c94ccd5cd199119baf374e646aae78dd50008011ba73235573c6ea8004004010d5d080089aba135744002260066ae88008c8d55cf1baa001357420020040086ae8400458d55cf0011aab9d00137546ae84d5d10029bac357420066ae88d5d10009aba235744002646aae78dd50009aba10013235573c6ea8004010d55cf0011aab9d001375400498183d8799f1b00000189a8e534b6d8799fd8799f581c4e773fd59569b8e154de2fd6ae5b1c4b56dd7957a9d6f77267e06f41ffd8799fd8799fd8799f581c3bd05909969e8c3e98a3b3f8debf8b1f3cb48a1fc32d8541c9340ef3ffffffffd8799fd87a9f581ce579d647711d851e074a36bf6a6e549704287f778e7eab6e769ab515ffffff0001",
  },
};

describe("Kupmios", async () => {
  // // Stop devkit
  // exec("~/.yaci-devkit/bin/devkit.sh stop &");
  // console.log("Stopped devkit");
  // // Wait for a delay before starting again (if necessary)
  // console.log("waiting 10 seconds");
  // await new Promise((resolve) => setTimeout(resolve, 10000)); // 10 seconds delay
  // // Start devkit
  // exec("~/.yaci-devkit/bin/devkit.sh start create-node -o --start &");
  // console.log("Started devkit");
  // // Wait for a delay before starting again (if necessary)
  // console.log("waiting 30 seconds");
  // await new Promise((resolve) => setTimeout(resolve, 30000)); // 30 seconds delay

  test("getProtocolParameters", async () => {
    const pp: ProtocolParameters = await kupmios.getProtocolParameters();
    assert(pp);
  });

  test("getUtxos", async () => {
    const utxos = await kupmios.getUtxos(
      "addr_test1qrngfyc452vy4twdrepdjc50d4kvqutgt0hs9w6j2qhcdjfx0gpv7rsrjtxv97rplyz3ymyaqdwqa635zrcdena94ljs0xy950",
    );
    assert(utxos);
  });

  test("getUtxosWithUnit", async () => {
    const utxos = await kupmios.getUtxosWithUnit(
      "addr_test1wpgexmeunzsykesf42d4eqet5yvzeap6trjnflxqtkcf66g0kpnxt",
      "4a83e031d4c37fc7ca6177a2f3581a8eec2ce155da91f59cfdb3bb28446973636f7665727956616c696461746f72",
    );
    expect(utxos.length).toBeGreaterThan(0);
  });

  test("getUtxoByUnit", async () => {
    const utxo = await kupmios.getUtxoByUnit(
      "4a83e031d4c37fc7ca6177a2f3581a8eec2ce155da91f59cfdb3bb28446973636f7665727956616c696461746f72",
    );
    expect(utxo).toStrictEqual(discoveryUTxO);
  });

  test("getUtxosByOutRef", async () => {
    const utxos: UTxO[] = await kupmios.getUtxosByOutRef([
      {
        txHash:
          "b50e73e74a3073bc44f555928702c0ae0f555a43f1afdce34b3294247dce022d",
        outputIndex: 0,
      },
    ]);
    expect(utxos).toStrictEqual([discoveryUTxO]);
  });

  test("getDelegation", async () => {
    const delegation = await kupmios.getDelegation(
      "stake_test17zt3vxfjx9pjnpnapa65lx375p2utwxmpc8afj053h0l3vgc8a3g3",
    );
    assert(delegation);
  });

  test("getDatum", async () => {
    const datum = await kupmios.getDatum(
      "95472c2f46b89500703ec778304baf1079c58124c254bf4bf8c96e5d73869293",
    );
    expect(datum).toStrictEqual(
      "d87b9fd8799fd8799f9f581c3f2728ec78ef8b0f356e91a5662ff3124add324a7b7f5aeed69362f4581c17942ff3849b623d24e31ec709c1c94c53b9240311820a9601ad4af0581cba4ab50bdecca85162f3b8114739bc5ba3aaa6490e2b1d15ad0f9c66581c25aa4132c7ce7d8f96ee977cd921cba7681891d114d088449d1d63b2581c5309fa786856c1262d095b89adf64fe8a5255ad19142c9c537359e41ff1917701a001b77401a001b774018c818641a000927c0d8799f0a140aff021905dcd8799f9f581c1a550d5f572584e1add125b5712f709ac3b9828ad86581a4759022baff01ffffffff",
    );
  });

  test("awaitTx", async () => {
    const isConfirmed: boolean = await kupmios.awaitTx(
      "2a1f95a9d85bf556a3dc889831593ee963ba491ca7164d930b3af0802a9796d0",
    );
    expect(isConfirmed).toBe(true);
  });

  test("submitTxBadRequest", async () => {
    await expect(() => kupmios.submitTx("80")).rejects.toThrowError();
  });

  test("evaluateTx", async () => {
    const cbor =
      "84a8008182582057bc0b1630f803cb7f5277be549783a3ecd882458c0f35ab85c44825f119b705000182825839009b619deb6e46ed004e49cb9a158462189cf093bab8eef2765d9b8bf75da571c9ab6fc02a347d0443bb80566c3408b4ee2a1b3a6a5019a281821a00144178a1581cb92906f99519f847c2c7ff96979bb89a3d74c9a1eacaff508d1d3833a24d4275726e61626c65546f6b656e015820accbfb633f637e3bb1abee40c9539d1effd742cd2716b3b1db9de3aaf3f3779401825839009b619deb6e46ed004e49cb9a158462189cf093bab8eef2765d9b8bf75da571c9ab6fc02a347d0443bb80566c3408b4ee2a1b3a6a5019a281821b0000000241786f09a2581c22691d3d969ecf5802226290c2fb98e2bc08522d5b726c1f5f400105a3445465737402534275726e61626c65546f6b656e506c75747573015820accbfb633f637e3bb1abee40c9539d1effd742cd2716b3b1db9de3aaf3f3779401581cb92906f99519f847c2c7ff96979bb89a3d74c9a1eacaff508d1d3833a14e4275726e61626c65546f6b656e3201021a0004187c09a2581cb92906f99519f847c2c7ff96979bb89a3d74c9a1eacaff508d1d3833a34d4275726e61626c65546f6b656e014e4275726e61626c65546f6b656e32015820accbfb633f637e3bb1abee40c9539d1effd742cd2716b3b1db9de3aaf3f3779401581c22691d3d969ecf5802226290c2fb98e2bc08522d5b726c1f5f400105a2534275726e61626c65546f6b656e506c75747573015820accbfb633f637e3bb1abee40c9539d1effd742cd2716b3b1db9de3aaf3f37794010b5820ce0a2440ebdf11ae5a80f8acfa7e4475fa8f36df476fb000fbdb889be2fb41da0d8182582057bc0b1630f803cb7f5277be549783a3ecd882458c0f35ab85c44825f119b7050010825839009b619deb6e46ed004e49cb9a158462189cf093bab8eef2765d9b8bf75da571c9ab6fc02a347d0443bb80566c3408b4ee2a1b3a6a5019a281821b0000000241447dbda1581c22691d3d969ecf5802226290c2fb98e2bc08522d5b726c1f5f400105a1445465737402111a004c4b40a400818258205ee4155d0886da3ff31d482b40e7e0701029018cb0307f658b9458043c7894d45840527def2af35bd80b8b3eafe7c329e99f1bda43cc9523fc4437546226ec8c81b833f6c734c62397a02f2a9946fcf4d54ade59af49699b611a31657545199bbc0b01818201818200581c9b619deb6e46ed004e49cb9a158462189cf093bab8eef2765d9b8bf70581840100d8798180821a000172481a023409910681590536590533010000323232323232322253232323233300730013008375400a264a666010646464a666016600a60186ea80044c8c8c8c8c8c8c94ccc048c94ccc04ccc00401c8cdc42400000229444cc00401c8cdc4000a400044646600200200644a66603200229444c94ccc05cc010dd6980e0010998018018008a50301c001153330123370e004002266e1c008cc8c004004894ccc05c004520001301033002002301a0013758600a60286ea80445280a503330023758602c602e602e60266ea802120000033330013758600660246ea801d20002233004301730183014375400400244464666002002008006444a66603000420022666006006603600466008603400400244a66602066ebcc00cc048dd5180198091baa0023374a90011980a1ba90054bd70098060008800918098009919800800992999807180598079baa00114bd6f7b63009bab301330103754002646600200264660020026eacc050c054c054c054c054c044dd50031129998098008a5eb7bdb1804c8c8c8c94ccc050cdc8a4500002153330143371e91010000210031005133018337606ea4008dd3000998030030019bab3015003375c6026004602e004602a00244a666024002298103d87a80001323232325333013337220100042a66602666e3c0200084c038cc05cdd3000a5eb80530103d87a8000133006006003375660280066eb8c048008c058008c050004894ccc04400452f5c0266024602060260026600400460280026eb8c040c034dd50008b18079808001180700098051baa00614984d9594ccc01cc004c020dd5003099192999806180780109924c646600200200444a66601c0022930991980180198090011bad3010001163758601a00260126ea8018584c8c894ccc028c8c8c94ccc034c028c038dd500089919192999808180518089baa0011325333011300e30123754002264a666024666024a66602a64a666026602060286ea800452f5bded8c026eacc060c054dd500099191980080099198008009bab301a301b301b301b301b3017375401444a666032002297adef6c60132323232533301a33722911000021533301a3371e9101000021003100513301e337606ea4008dd3000998030030019bab301b003375c6032004603a004603600244a666030002298103d87a800013232323253330193372200e0042a66603266e3c01c0084c050cc074dd3000a5eb80530103d87a8000133006006003375660340066eb8c060008c070008c068004dd7180b980a1baa00214a22941282511300f00114a0664600200244a66602c002290000980799801001180c80099198008009bac30043014375401644a66602c002297ae0132325333015325333016301030173754002266ebcc020c060dd5180d980c1baa0010091633323001001222533301b00214c103d87a800013232533301a3014003130153301e0024bd70099980280280099b8000348004c07c00cc074008dd61803980b9baa00a00213301937500046600800800226600800800260340046eb4c06000458c008c048dd5180118091baa3015301630123754602a60246ea800458c8cc004004dd6180118091baa00522533301400114c103d87a80001323253330133375e600a602a6ea80080184c038cc05c0092f5c02660080080026030004602c002460280026024601e6ea800458c044c048008c040004c030dd50008a4c26caca666010600460126ea80044c8c94ccc034c0400084c926323300100100222533300f00114984c8cc00c00cc04c008dd698088008b1bac300e001300a37540022c601860126ea8014dc3a40006e952000370090011b87480095cd2ab9d5573caae7d5d02ba157441f5f6";
    const redeemers = await kupmios.evaluateTx(cbor);
    assert.equal(Array.from(redeemers).length, 1);
  });
});
