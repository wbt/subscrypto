import { useState } from "react";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { ActionButton } from "~~/components/example-ui/actionButton";

const CustomerPage: NextPage = () => {
  const [merchantAddr, setMerchantAddr] = useState("");
  const onButton = function () {
    const loc = window.location;
    const newLoc = loc + "/" + merchantAddr;
    location.assign(newLoc);
  };
  return (
    <>
      <MetaHeader
        title="API Customer: Manage Subscriptions"
        description="Allows API users to pay with cryptocurrency."
      />
      This application allows you to subscribe to APIs for a specific known provider.
      <br />
      Normally, the provider should provide an interface to advertise their service tiers and allow you to trigger a
      purchase transaction directly from the provider&apos;s web page.
      <br />
      This app does not currently have a discovery feature to help you find APIs to subscribe to, as that should be
      driven by your use case.
      <br />
      It also currently does not have a feature to easily show you all your current (and possibly past) subscriptions
      through some sort of caching, in part because it is a hackathon project.
      <br />
      However, you can use this interface to view and subscribe to a particular provider if you know the provider&apos;s
      hex Ethereum address.
      <br />
      (ENS and other web3 domain name services are not yet supported, but should be in the future.)
      <br />
      Enter the provider&apos;s public Ethereum address to proceed:
      <input
        type="text"
        className="width-3/5 text-black"
        placeholder="e.g. 0x7aDb4fC14fD18694e0961aF923E3550fbb137385"
        value={merchantAddr}
        onChange={e => setMerchantAddr(e.target.value)}
      />
      <ActionButton onClick={onButton} isLoading={false} text={"View API price tiers from this seller"} />
    </>
  );
};

export default CustomerPage;
